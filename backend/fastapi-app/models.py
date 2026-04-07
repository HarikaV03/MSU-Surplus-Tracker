from sqlalchemy import ForeignKey, Integer, String, Text, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from database import Base


class Department(Base):
    __tablename__ = "departments"

    department_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    department_name: Mapped[str] = mapped_column(String(100), nullable=False)

    users: Mapped[list["User"]] = relationship(back_populates="department")
    assets: Mapped[list["Asset"]] = relationship(back_populates="department")


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(30), nullable=False)
    department_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("departments.department_id"), nullable=True
    )

    department: Mapped["Department | None"] = relationship(back_populates="users")
    submitted_assets: Mapped[list["Asset"]] = relationship(
        back_populates="submitter", foreign_keys="Asset.submitted_by"
    )
    scan_events: Mapped[list["ScanEvent"]] = relationship(back_populates="scanned_by_user")


class Asset(Base):
    __tablename__ = "assets"

    asset_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    asset_tag: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True, index=True)
    item_name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    condition: Mapped[str | None] = mapped_column(String(30), nullable=True)
    current_status: Mapped[str] = mapped_column(String(30), nullable=False)
    location: Mapped[str | None] = mapped_column(String(100), nullable=True)
    department_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("departments.department_id"), nullable=True
    )
    submitted_by: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.user_id"), nullable=True)
    created_at: Mapped[object] = mapped_column(TIMESTAMP, server_default=func.current_timestamp())

    department: Mapped["Department | None"] = relationship(back_populates="assets")
    submitter: Mapped["User | None"] = relationship(
        back_populates="submitted_assets", foreign_keys=[submitted_by]
    )
    scan_events: Mapped[list["ScanEvent"]] = relationship(back_populates="asset", cascade="all, delete-orphan")
    disposal_records: Mapped[list["DisposalRecord"]] = relationship(
        back_populates="asset", cascade="all, delete-orphan"
    )


class ScanEvent(Base):
    __tablename__ = "scan_events"

    scan_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    asset_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("assets.asset_id", ondelete="CASCADE"), nullable=True, index=True
    )
    scanned_by: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.user_id"), nullable=True)
    scan_time: Mapped[object] = mapped_column(TIMESTAMP, server_default=func.current_timestamp())
    scan_location: Mapped[str | None] = mapped_column(String(100), nullable=True)

    asset: Mapped["Asset | None"] = relationship(back_populates="scan_events")
    scanned_by_user: Mapped["User | None"] = relationship(back_populates="scan_events")


class DisposalRecord(Base):
    __tablename__ = "disposal_records"

    record_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    asset_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("assets.asset_id", ondelete="CASCADE"), nullable=True, index=True
    )
    recommended_action: Mapped[str | None] = mapped_column(String(30), nullable=True)
    final_action: Mapped[str | None] = mapped_column(String(30), nullable=True)
    approved_by: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.user_id"), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[object] = mapped_column(TIMESTAMP, server_default=func.current_timestamp())

    asset: Mapped["Asset | None"] = relationship(back_populates="disposal_records")
