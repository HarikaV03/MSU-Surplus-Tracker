const BASE_URL = "http://127.0.0.1:8000" // FastAPI backend

// GET all assets
export async function getAssets() {
  const res = await fetch(`${BASE_URL}/assets`)
  return res.json()
}

// GET by ID
export async function getAsset(id) {
  const res = await fetch(`${BASE_URL}/assets/${id}`)
  return res.json()
}

// POST new asset
export async function addAsset(asset) {
  const res = await fetch(`${BASE_URL}/assets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(asset),
  })
  return res.json()
}

// PUT update asset status
export async function updateAssetStatus(id, status) {
  const res = await fetch(`${BASE_URL}/assets/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ current_status: status }),
  })
  return res.json()
}
