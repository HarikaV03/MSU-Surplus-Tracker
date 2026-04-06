from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Asset as AssetModel
from models import ScanEvent as ScanEventModel

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MSU Surplus Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Asset(BaseModel):
    id: int
    asset_tag: str
    item_name: str
    condition: str
    current_status: str

    model_config = {"from_attributes": True}


class StatusUpdate(BaseModel):
    current_status: str


class ScanEvent(BaseModel):
    asset_id: int
    scan_location: str

    model_config = {"from_attributes": True}


@app.get("/")
def root():
    return {"message": "MSU Surplus Tracker API running"}


@app.get("/assets")
def get_assets(db: Session = Depends(get_db)):
    return db.query(AssetModel).all()


@app.post("/assets")
def add_asset(asset: Asset, db: Session = Depends(get_db)):
    # Preserve in-memory duplicate logic, translated to SQL:
    # - duplicate id -> "Asset with this ID already exists"
    # - duplicate asset_tag -> "Asset with this barcode/asset tag already exists"
    existing = (
        db.query(AssetModel)
        .filter(or_(AssetModel.asset_id == asset.id, AssetModel.asset_tag == asset.asset_tag))
        .all()
    )
    for row in existing:
        if row.asset_id == asset.id:
            return {"error": "Asset with this ID already exists"}
        if row.asset_tag == asset.asset_tag:
            return {"error": "Asset with this barcode/asset tag already exists"}

    new_asset = AssetModel(
        asset_id=asset.id,
        asset_tag=asset.asset_tag,
        item_name=asset.item_name,
        condition=asset.condition,
        current_status=asset.current_status,
    )
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    return {"message": "Asset added successfully", "asset": new_asset}


@app.get("/assets/{asset_id}")
def get_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.get(AssetModel, asset_id)
    if not asset:
        return {"error": "Asset not found"}
    return asset


@app.put("/assets/{asset_id}/status")
def update_asset_status(asset_id: int, status_update: StatusUpdate, db: Session = Depends(get_db)):
    asset = db.get(AssetModel, asset_id)
    if not asset:
        return {"error": "Asset not found"}
    asset.current_status = status_update.current_status
    db.commit()
    db.refresh(asset)
    return {"message": "Asset status updated", "asset": asset}


@app.get("/assets/by-tag/{asset_tag}")
def get_asset_by_tag(asset_tag: str, db: Session = Depends(get_db)):
    asset = db.query(AssetModel).filter(AssetModel.asset_tag == asset_tag).first()
    if not asset:
        return {"error": "Asset not found"}
    return asset


@app.post("/scan-events")
def add_scan_event(scan_event: ScanEvent, db: Session = Depends(get_db)):
    asset = db.get(AssetModel, scan_event.asset_id)
    if not asset:
        return {"error": "Asset not found"}

    event = ScanEventModel(asset_id=scan_event.asset_id, scan_location=scan_event.scan_location)
    db.add(event)
    db.commit()
    db.refresh(event)
    return {"message": "Scan event logged successfully", "scan_event": event}


@app.get("/scan-events")
def get_scan_events(db: Session = Depends(get_db)):
    return db.query(ScanEventModel).all()