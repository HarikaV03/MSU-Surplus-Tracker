from datetime import datetime
from http.client import HTTPException
from fastapi import Depends, FastAPI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Asset as AssetModel
from models import Department as DepartmentModel
from models import DisposalRecord as DisposalRecordModel
from models import ScanEvent as ScanEventModel
from models import User as UserModel

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
    description: str | None = None
    condition: str | None = None
    current_status: str
    location: str | None = None
    department_id: int | None = None
    submitted_by: int | None = None

    model_config = {"from_attributes": True}

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

    model_config = {"from_attributes": True}


class StatusUpdate(BaseModel):
    current_status: str


class ScanEvent(BaseModel):
    asset_id: int
    scan_location: str
    scanned_by: int | None = None

    model_config = {"from_attributes": True}

class ScanEventOut(BaseModel):
    scan_id: int
    asset_id: int | None = None
    scanned_by: int | None = None
    scan_time: datetime | None = None
    scan_location: str | None = None

    model_config = {"from_attributes": True}

class DepartmentCreate(BaseModel):
    department_name: str

    model_config = {"from_attributes": True}

class DepartmentOut(BaseModel):
    department_id: int
    department_name: str

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    full_name: str
    email: str
    role: str
    department_id: int | None = None

    model_config = {"from_attributes": True}

class UserOut(BaseModel):
    user_id: int
    full_name: str
    email: str
    role: str
    department_id: int | None = None

    model_config = {"from_attributes": True}


class DisposalRecordCreate(BaseModel):
    asset_id: int
    recommended_action: str | None = None
    final_action: str | None = None
    approved_by: int | None = None
    notes: str | None = None

    model_config = {"from_attributes": True}

class DisposalRecordOut(BaseModel):
    record_id: int
    asset_id: int | None = None
    recommended_action: str | None = None
    final_action: str | None = None
    approved_by: int | None = None
    notes: str | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


@app.get("/")
def root():
    return {"message": "MSU Surplus Tracker API running"}


@app.get("/assets", response_model=list[AssetOut])
def get_assets(db: Session = Depends(get_db)):
    return db.query(AssetModel).all()


@app.post("/assets", response_model=AssetOut)
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
            raise HTTPException(status_code=409, detail="Asset with this ID already exists")
        if row.asset_tag == asset.asset_tag:
            raise HTTPException(
                status_code=409, detail="Asset with this barcode/asset tag already exists"
            )
        
    if asset.department_id is not None:
        if not db.get(DepartmentModel, asset.department_id):
            raise HTTPException(status_code=400, detail="Invalid department_id")

    if asset.submitted_by is not None:
        if not db.get(UserModel, asset.submitted_by):
            raise HTTPException(status_code=400, detail="Invalid submitted_by user_id")

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
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


@app.put("/assets/{asset_id}/status", response_model=AssetOut)
def update_asset_status(asset_id: int, status_update: StatusUpdate, db: Session = Depends(get_db)):
    asset = db.get(AssetModel, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    asset.current_status = status_update.current_status
    db.commit()
    db.refresh(asset)
    return asset

@app.get("/assets/by-tag/{asset_tag}")
def get_asset_by_tag(asset_tag: str, db: Session = Depends(get_db)):
    asset = db.query(AssetModel).filter(AssetModel.asset_tag == asset_tag).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


@app.post("/scan-events", response_model=ScanEventOut)
def add_scan_event(scan_event: ScanEvent, db: Session = Depends(get_db)):
    asset = db.get(AssetModel, scan_event.asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    if scan_event.scanned_by is not None:
        if not db.get(UserModel, scan_event.scanned_by):
            raise HTTPException(status_code=400, detail="Invalid scanned_by user_id")

    event = ScanEventModel(asset_id=scan_event.asset_id, scan_location=scan_event.scan_location,scanned_by=scan_event.scanned_by,)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@app.get("/scan-events")
def get_scan_events(db: Session = Depends(get_db)):
    return db.query(ScanEventModel).all()

@app.get("/departments", response_model=list[DepartmentOut])
def list_departments(db: Session = Depends(get_db)):
    return db.query(DepartmentModel).all()


@app.post("/departments", response_model=DepartmentOut)
def create_department(dept: DepartmentCreate, db: Session = Depends(get_db)):
    new_dept = DepartmentModel(department_name=dept.department_name)
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)
    return new_dept


@app.get("/departments/{department_id}", response_model=DepartmentOut)
def get_department(department_id: int, db: Session = Depends(get_db)):
    dept = db.get(DepartmentModel, department_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept


@app.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(UserModel).all()


@app.post("/users", response_model=UserOut)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(UserModel).filter(UserModel.email == user.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="User with this email already exists")

    if user.department_id is not None and not db.get(DepartmentModel, user.department_id):
        raise HTTPException(status_code=400, detail="Invalid department_id")

    new_user = UserModel(
        full_name=user.full_name,
        email=user.email,
        role=user.role,
        department_id=user.department_id,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(UserModel, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.get("/disposal-records", response_model=list[DisposalRecordOut])
def list_disposal_records(db: Session = Depends(get_db)):
    return db.query(DisposalRecordModel).all()


@app.post("/disposal-records", response_model=DisposalRecordOut)
def create_disposal_record(record: DisposalRecordCreate, db: Session = Depends(get_db)):
    if not db.get(AssetModel, record.asset_id):
        raise HTTPException(status_code=400, detail="Invalid asset_id")

    if record.approved_by is not None and not db.get(UserModel, record.approved_by):
        raise HTTPException(status_code=400, detail="Invalid approved_by user_id")

    new_record = DisposalRecordModel(
        asset_id=record.asset_id,
        recommended_action=record.recommended_action,
        final_action=record.final_action,
        approved_by=record.approved_by,
        notes=record.notes,
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record


@app.get("/disposal-records/{record_id}", response_model=DisposalRecordOut)
def get_disposal_record(record_id: int, db: Session = Depends(get_db)):
    record = db.get(DisposalRecordModel, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Disposal record not found")
    return record


@app.get("/assets/{asset_id}/disposal-records", response_model=list[DisposalRecordOut])
def get_asset_disposal_records(asset_id: int, db: Session = Depends(get_db)):
    if not db.get(AssetModel, asset_id):
        raise HTTPException(status_code=404, detail="Asset not found")
    return db.query(DisposalRecordModel).filter(DisposalRecordModel.asset_id == asset_id).all()