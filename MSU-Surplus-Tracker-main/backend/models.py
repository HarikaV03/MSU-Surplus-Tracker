from datetime import datetime
from database import Base

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey



class Asset(Base):
    __tablename__ = "assets"

    asset_id = Column(Integer, primary_key=True, index=True)
    asset_tag = Column(String, unique=True, index=True)

    item_name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    condition = Column(String, nullable=True)
    current_status = Column(String, nullable=False)

    location = Column(String, nullable=True)

    department_id = Column(Integer, ForeignKey("departments.department_id"), nullable=True)
    submitted_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)



class ScanEvent(Base):
    __tablename__ = "scan_events"

    scan_id = Column(Integer, primary_key=True, index=True)

    asset_id = Column(Integer, ForeignKey("assets.asset_id"))
    scan_location = Column(String, nullable=False)

    scanned_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    scan_time = Column(DateTime, default=datetime.utcnow)



class Department(Base):
    __tablename__ = "departments"

    department_id = Column(Integer, primary_key=True, index=True)
    department_name = Column(String, unique=True, nullable=False)



class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)

    role = Column(String, nullable=False)

    department_id = Column(Integer, ForeignKey("departments.department_id"), nullable=True)



class DisposalRecord(Base):
    __tablename__ = "disposal_records"

    record_id = Column(Integer, primary_key=True, index=True)

    asset_id = Column(Integer, ForeignKey("assets.asset_id"))

    recommended_action = Column(String, nullable=True)
    final_action = Column(String, nullable=True)

    approved_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)

    notes = Column(String, nullable=True)

    updated_at = Column(DateTime, default=datetime.utcnow)



class AssetAuditEvent(Base):
    __tablename__ = "asset_audit_events"

    audit_id = Column(Integer, primary_key=True, index=True)

    asset_id = Column(Integer, ForeignKey("assets.asset_id"))

    event_type = Column(String, nullable=False)

    field_name = Column(String, nullable=True)
    old_value = Column(String, nullable=True)
    new_value = Column(String, nullable=True)

    changed_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)

    changed_at = Column(DateTime, default=datetime.utcnow)
