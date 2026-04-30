from datetime import datetime
import os

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session
import google.generativeai as genai

from database import Base, engine, get_db
import models

# Models (SQLAlchemy)
from models import (
    Asset as AssetModel,
    AssetAuditEvent as AssetAuditEventModel,
    Department as DepartmentModel,
    DisposalRecord as DisposalRecordModel,
    ScanEvent as ScanEventModel,
    User as UserModel,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MSU Surplus Tracker API")

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash-lite') 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AIDescriptionRequest(BaseModel):
    item_name: str
    condition: str

class AssetCreate(BaseModel):
    asset_tag: str
    item_name: str
    description: str | None = None
    condition: str | None = None
    current_status: str
    location: str | None = None
    department_id: int | None = None
    submitted_by: int | None = None

class AssetOut(BaseModel):
    asset_id: int
    asset_tag: str | None = None
    item_name: str
    description: str | None = None
    condition: str | None = None
    current_status: str
    location: str | None = None
    department_id: int | None = None
    submitted_by: int | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True

class StatusUpdate(BaseModel):
    current_status: str
    updated_by: int | None = None

class ScanEventCreate(BaseModel):
    asset_id: int
    scan_location: str
    scanned_by: int | None = None

class ScanEventOut(BaseModel):
    scan_id: int
    asset_id: int | None = None
    scanned_by: int | None = None
    scan_time: datetime | None = None
    scan_location: str | None = None

    class Config:
        from_attributes = True

class DepartmentOut(BaseModel):
    department_id: int
    department_name: str

    class Config:
        from_attributes = True

class UserOut(BaseModel):
    user_id: int
    full_name: str
    email: str
    role: str
    department_id: int | None = None

    class Config:
        from_attributes = True

class DisposalRecordOut(BaseModel):
    record_id: int
    asset_id: int | None = None
    recommended_action: str | None = None
    final_action: str | None = None
    approved_by: int | None = None
    notes: str | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True

class AssetAuditEventOut(BaseModel):
    audit_id: int
    asset_id: int | None = None
    event_type: str
    field_name: str | None = None
    old_value: str | None = None
    new_value: str | None = None
    changed_by: int | None = None
    changed_at: datetime | None = None

    class Config:
        from_attributes = True

@app.get("/")
def root():
    return {"message": "MSU Surplus Tracker API running"}

@app.post("/generate-description")
async def generate_description(req: AIDescriptionRequest):
    if not os.getenv("GEMINI_KEY"):
        raise HTTPException(status_code=500, detail="Gemini API Key not configured")
    
    try:
        prompt = (
            f"You are a professional MSU Surplus Property Clerk. "
            f"The user provided these notes about an item: '{req.item_name}'. "
            f"The item is in {req.condition} condition. "
            f"Task: Rewrite the user's notes into a concise, professional 1-sentence inventory description. "
            f"Focus strictly on the condition and any issues mentioned. Do not invent details not provided by the user."
        )
        
        response = model.generate_content(prompt)
        return {"description": response.text.strip()}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to paraphrase description")

@app.get("/assets", response_model=list[AssetOut])
def get_assets(db: Session = Depends(get_db)):
    return db.query(AssetModel).all()

@app.post("/assets", response_model=AssetOut)
def add_asset(asset: AssetCreate, db: Session = Depends(get_db)):
    # Removed AssetModel.asset_id check since we aren't passing it manually anymore
    existing = db.query(AssetModel).filter(AssetModel.asset_tag == asset.asset_tag).first()
    
    if existing:
        raise HTTPException(409, "Asset with this barcode already exists")

    new_asset = AssetModel(
        asset_tag=asset.asset_tag,
        item_name=asset.item_name,
        description=asset.description,
        condition=asset.condition,
        current_status=asset.current_status,
        location=asset.location,
        department_id=asset.department_id,
        submitted_by=asset.submitted_by,
    )

    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    return new_asset

# (Rest of the endpoints for /assets/{id}, /scan-events, etc. remain the same)
@app.get("/assets/{asset_id}", response_model=AssetOut)
def get_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.get(AssetModel, asset_id)
    if not asset:
        raise HTTPException(404, "Asset not found")
    return asset

@app.put("/assets/{asset_id}/status", response_model=AssetOut)
def update_status(asset_id: int, status_update: StatusUpdate, db: Session = Depends(get_db)):
    asset = db.get(AssetModel, asset_id)
    if not asset:
        raise HTTPException(404, "Asset not found")

    asset.current_status = status_update.current_status
    db.commit()
    db.refresh(asset)
    return asset

@app.get("/assets/by-tag/{asset_tag}", response_model=AssetOut)
def get_by_tag(asset_tag: str, db: Session = Depends(get_db)):
    asset = db.query(AssetModel).filter(AssetModel.asset_tag == asset_tag).first()
    if not asset:
        raise HTTPException(404, "Asset not found")
    return asset

@app.get("/users", response_model=list[UserOut])
def get_users(db: Session = Depends(get_db)):
    return db.query(UserModel).all()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
