
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    
    // Check if we are in a GitHub Codespace
    if (hostname.includes("github.dev") || hostname.includes("app.github.dev")) {
      // Replace the frontend port (3000) with the backend port (8000)
      return `https://${hostname.replace('-3000', '-8000')}`;
    }
  }
  // Fallback for local development or production env
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
};

const BASE_URL = getBaseUrl();

// Centralized response handler
async function handleResponse(res) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("API Error Detail:", res.status, errorData);
    throw new Error(errorData.detail || `API Error: ${res.status}`);
  }
  return res.json();
}

// GET all assets
export async function getAssets() {
  try {
    const res = await fetch(`${BASE_URL}/assets`);
    return await handleResponse(res);
  } catch (err) {
    console.error("getAssets failed:", err);
    throw err;
  }
}

// GET asset by Asset Tag 
export async function getAssetByTag(tag) {
  try {
    const res = await fetch(`${BASE_URL}/assets/${tag}`);
    return await handleResponse(res);
  } catch (err) {
    console.error(`getAsset ${tag} failed:`, err);
    throw err;
  }
}

// POST new asset
export async function addAsset(asset) {
  try {
    const res = await fetch(`${BASE_URL}/assets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(asset),
    });
    return await handleResponse(res);
  } catch (err) {
    console.error("addAsset failed:", err);
    throw err;
  }
}

// PUT update asset status 
export async function updateAssetStatus(id, status) {
  try {
    const res = await fetch(`${BASE_URL}/assets/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_status: status }),
    });
    return await handleResponse(res);
  } catch (err) {
    console.error("updateAssetStatus failed:", err);
    throw err;
  }
}

// SEARCH assets 
export async function searchAssets(query) {
  try {
    const res = await fetch(`${BASE_URL}/assets/search?q=${encodeURIComponent(query)}`);
    return await handleResponse(res);
  } catch (err) {
    console.error("searchAssets failed:", err);
    throw err;
  }
}
