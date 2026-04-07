import uuid

from fastapi.testclient import TestClient

from database import SessionLocal
from main import app
from models import Asset, Department, DisposalRecord, ScanEvent, User


client = TestClient(app)


def _cleanup_by_asset_id(asset_id: int):
    # Cleanup in FK-safe order
    with SessionLocal() as db:
        db.query(ScanEvent).filter(ScanEvent.asset_id == asset_id).delete()
        db.query(DisposalRecord).filter(DisposalRecord.asset_id == asset_id).delete()
        db.query(Asset).filter(Asset.asset_id == asset_id).delete()
        db.commit()


def test_assets_duplicate_and_404():
    asset_id = 91001
    asset_tag = f"TEST-{uuid.uuid4()}"
    try:
        r = client.post(
            "/assets",
            json={
                "id": asset_id,
                "asset_tag": asset_tag,
                "item_name": "Test Item",
                "condition": "Good",
                "current_status": "Available",
            },
        )
        assert r.status_code == 200, r.text
        assert r.json()["asset_id"] == asset_id

        # duplicate id => 409
        r2 = client.post(
            "/assets",
            json={
                "id": asset_id,
                "asset_tag": f"TEST-{uuid.uuid4()}",
                "item_name": "Test Item 2",
                "current_status": "Available",
            },
        )
        assert r2.status_code == 409, r2.text
        assert r2.json()["detail"] == "Asset with this ID already exists"

        # duplicate asset_tag => 409
        r3 = client.post(
            "/assets",
            json={
                "id": asset_id + 1,
                "asset_tag": asset_tag,
                "item_name": "Test Item 3",
                "current_status": "Available",
            },
        )
        assert r3.status_code == 409, r3.text
        assert r3.json()["detail"] == "Asset with this barcode/asset tag already exists"

        # missing asset => 404
        r4 = client.get("/assets/99999999")
        assert r4.status_code == 404, r4.text
        assert r4.json()["detail"] == "Asset not found"
    finally:
        _cleanup_by_asset_id(asset_id)
        _cleanup_by_asset_id(asset_id + 1)


def test_departments_users_assets_scan_events_and_disposal_records_flow():
    dept_name = f"Test Dept {uuid.uuid4()}"
    user_email = f"test-{uuid.uuid4()}@example.com"
    asset_id = 92001
    asset_tag = f"TEST-{uuid.uuid4()}"

    dept_id = None
    user_id = None
    record_id = None
    scan_id = None
    try:
        # create department
        r = client.post("/departments", json={"department_name": dept_name})
        assert r.status_code == 200, r.text
        dept_id = r.json()["department_id"]

        # create user in department
        r2 = client.post(
            "/users",
            json={"full_name": "Test User", "email": user_email, "role": "staff", "department_id": dept_id},
        )
        assert r2.status_code == 200, r2.text
        user_id = r2.json()["user_id"]

        # create asset linked to department + submitted_by
        r3 = client.post(
            "/assets",
            json={
                "id": asset_id,
                "asset_tag": asset_tag,
                "item_name": "Monitor",
                "current_status": "Available",
                "department_id": dept_id,
                "submitted_by": user_id,
            },
        )
        assert r3.status_code == 200, r3.text
        assert r3.json()["department_id"] == dept_id
        assert r3.json()["submitted_by"] == user_id

        # scan event linked to asset + scanned_by
        r4 = client.post(
            "/scan-events",
            json={"asset_id": asset_id, "scan_location": "Warehouse A", "scanned_by": user_id},
        )
        assert r4.status_code == 200, r4.text
        scan_id = r4.json()["scan_id"]
        assert r4.json()["asset_id"] == asset_id
        assert r4.json()["scanned_by"] == user_id

        # disposal record linked to asset
        r5 = client.post(
            "/disposal-records",
            json={"asset_id": asset_id, "recommended_action": "Recycle", "notes": "test"},
        )
        assert r5.status_code == 200, r5.text
        record_id = r5.json()["record_id"]
        assert r5.json()["asset_id"] == asset_id

        # verify query endpoints
        r6 = client.get(f"/disposal-records/{record_id}")
        assert r6.status_code == 200, r6.text

        r7 = client.get(f"/assets/{asset_id}/disposal-records")
        assert r7.status_code == 200, r7.text
        assert any(rr["record_id"] == record_id for rr in r7.json())
    finally:
        _cleanup_by_asset_id(asset_id)
        with SessionLocal() as db:
            if scan_id is not None:
                db.query(ScanEvent).filter(ScanEvent.scan_id == scan_id).delete()
            if record_id is not None:
                db.query(DisposalRecord).filter(DisposalRecord.record_id == record_id).delete()
            if user_id is not None:
                db.query(User).filter(User.user_id == user_id).delete()
            if dept_id is not None:
                db.query(Department).filter(Department.department_id == dept_id).delete()
            db.commit()

