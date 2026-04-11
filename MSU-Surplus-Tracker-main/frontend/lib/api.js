const getBaseUrl = () => {
  // If we are in a browser and in a Codespace environment
  if (typeof window !== "undefined" && window.location.hostname.includes("github.dev")) {
    const cluster = window.location.hostname.split('-3000')[1]; // Grabs the region/cluster info
    const codespaceName = window.location.hostname.split('-3000')[0];
    return `https://${codespaceName}-8000${cluster}`;
  }
  // Fallback to env variable for local/production
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
};

const BASE_URL = getBaseUrl();

// Helper to handle responses safely
async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text()
    console.error("API Error:", res.status, text)
    throw new Error(`API Error: ${res.status}`)
  }
  return res.json()
}

// GET all assets
export async function getAssets() {
  try {
    const res = await fetch(`${BASE_URL}/assets`)
    return await handleResponse(res)
  } catch (err) {
    console.error("getAssets failed:", err)
    throw err
  }
}

// GET asset by ID
export async function getAsset(id) {
  try {
    const res = await fetch(`${BASE_URL}/assets/${id}`)
    return await handleResponse(res)
  } catch (err) {
    console.error("getAsset failed:", err)
    throw err
  }
}

// POST new asset
export async function addAsset(asset) {
  try {
    const res = await fetch(`${BASE_URL}/assets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(asset),
    })
    return await handleResponse(res)
  } catch (err) {
    console.error("addAsset failed:", err)
    throw err
  }
}

// PUT update asset status
export async function updateAssetStatus(id, status) {
  try {
    const res = await fetch(`${BASE_URL}/assets/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ current_status: status }),
    })
    return await handleResponse(res)
  } catch (err) {
    console.error("updateAssetStatus failed:", err)
    throw err
  }
}
