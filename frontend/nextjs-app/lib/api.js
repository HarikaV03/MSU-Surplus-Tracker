const BASE_URL = ""

async function apiFetch(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
  }

  const res = await fetch(`${BASE_URL}/api${path}`, {
    ...options,
    headers,
  })

  let data = null
  const contentType = res.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    data = await res.json()
  } else {
    data = await res.text()
  }

  if (!res.ok) {
    const detail =
      data && typeof data === "object" && "detail" in data ? data.detail : "Request failed"
    throw new Error(detail)
  }

  return data
}

// GET all assets
export async function getAssets() {
  return await apiFetch("/assets", { method: "GET" })
}

// GET by ID
export async function getAsset(id) {
  return await apiFetch(`/assets/${id}`, { method: "GET" })
}

// POST new asset
export async function addAsset(asset) {
  return await apiFetch("/assets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(asset),
  })
}

// PUT update asset status
export async function updateAssetStatus(id, status) {
  return await apiFetch(`/assets/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ current_status: status }),
  })
}

// Backwards-compatible alias used by existing pages
export async function updateStatus(id, status) {
  return await updateAssetStatus(id, status)
}

export async function getAssetAuditEvents(id) {
  return await apiFetch(`/assets/${id}/audit-events`, { method: "GET" })
}
