from fastapi     import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="MSU Surplus Tracker API")

# temporary fake storage
assets = []

class Asset(BaseModel):
    id: int
    item_name: str
    condition: str
    current_status: str

class StatusUpdate(BaseModel):
    current_status: str

@app.get("/")
def root():
    return {"message": "MSU Surplus Tracker API running"}

@app.get("/assets")
def get_assets():
    return assets

@app.post("/assets")
def add_asset(asset: Asset):
    for existing_asset in assets:
        if existing_asset["id"] == asset.id:
            return {"error": "Asset with this ID already exists"}

    assets.append(asset.dict())
    return {"message": "Asset added successfully", "asset": asset}

@app.get("/assets/{asset_id}")
def get_asset(asset_id: int):
    for asset in assets:
        if asset["id"] == asset_id:
            return asset
    return {"error": "Asset not found"}

@app.put("/assets/{asset_id}/status")
def update_asset_status(asset_id: int, status_update: StatusUpdate):
    for asset in assets:
        if asset["id"] == asset_id:
            asset["current_status"] = status_update.current_status
            return {"message": "Asset status updated", "asset": asset}
    return {"error": "Asset not found"}