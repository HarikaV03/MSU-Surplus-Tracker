from datetime import datetime
import os

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows any URL 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


USER_API_KEY = os.getenv("USER_API_KEY")
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY")

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def require_user_api_key(api_key: str | None = Depends(api_key_header)) -> str:
    if not api_key:
        raise HTTPException(401, "Missing API key")
    if ADMIN_API_KEY and api_key == ADMIN_API_KEY:
        return "admin"
    if USER_API_KEY and api_key == USER_API_KEY:
        return "user"
    raise HTTPException(401, "Invalid API key")


def require_admin_api_key(role: str = Depends(require_user_api_key)) -> str:
    if role != "admin":
        raise HTTPException(403, "Admin access required")
    return role



class AssetCreate(BaseModel):
    id: int
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


class DepartmentCreate(BaseModel):
    department_name: str


class DepartmentOut(BaseModel):
    department_id: int
    department_name: str

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    full_name: str
    email: str
    role: str
    department_id: int | None = None


class UserOut(BaseModel):
    user_id: int
    full_name: str
    email: str
    role: str
    department_id: int | None = None

    class Config:
        from_attributes = True


class DisposalRecordCreate(BaseModel):
    asset_id: int
    recommended_action: str | None = None
    final_action: str | None = None
    approved_by: int | None = None
    notes: str | None = None


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



@app.get("/assets", response_model=list[AssetOut])
def get_assets(db: Session = Depends(get_db)):
    return db.query(AssetModel).all()


@app.post("/assets", response_model=AssetOut)
def add_asset(asset: AssetCreate, db: Session = Depends(get_db)):
    existing = db.query(AssetModel).filter(
        or_(
            AssetModel.asset_id == asset.id,
            AssetModel.asset_tag == asset.asset_tag
        )
    ).all()

    for row in existing:
        if row.asset_id == asset.id:
            raise HTTPException(409, "Asset with this ID already exists")
        if row.asset_tag == asset.asset_tag:
            raise HTTPException(409, "Asset with this barcode already exists")

    new_asset = AssetModel(
        asset_id=asset.id,
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


@app.post("/scan-events", response_model=ScanEventOut)
def create_scan(scan: ScanEventCreate, db: Session = Depends(get_db)):
    event = ScanEventModel(**scan.dict())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@app.get("/scan-events", response_model=list[ScanEventOut])
def get_scans(db: Session = Depends(get_db)):
    return db.query(ScanEventModel).all()



@app.get("/departments", response_model=list[DepartmentOut])
def get_departments(db: Session = Depends(get_db)):
    return db.query(DepartmentModel).all()


@app.post("/departments", response_model=DepartmentOut)
def create_department(dept: DepartmentCreate, db: Session = Depends(get_db)):
    new_dept = DepartmentModel(**dept.dict())
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)
    return new_dept



@app.get("/users", response_model=list[UserOut])
def get_users(db: Session = Depends(get_db)):
    return db.query(UserModel).all()


@app.post("/users", response_model=UserOut)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = UserModel(**user.dict())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user



@app.get("/disposal-records", response_model=list[DisposalRecordOut])
def get_disposals(db: Session = Depends(get_db)):
    return db.query(DisposalRecordModel).all()


@app.post("/disposal-records", response_model=DisposalRecordOut)
def create_disposal(record: DisposalRecordCreate, db: Session = Depends(get_db)):
    new_record = DisposalRecordModel(**record.dict())
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record



@app.get("/assets/{asset_id}/audit-events", response_model=list[AssetAuditEventOut])
def get_audit(asset_id: int, db: Session = Depends(get_db)):
    return (
        db.query(AssetAuditEventModel)
        .filter(AssetAuditEventModel.asset_id == asset_id)
        .all()
    )

if __name__ == "__main__":
    import uvicorn
    # host="0.0.0.0" makes the server reachable outside the container
    uvicorn.run(app, host="0.0.0.0", port=8000)
