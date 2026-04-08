const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8001"
const API_KEY = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY

export async function proxy(request, path) {
  const url = `${BACKEND_URL}${path}`

  const headers = new Headers(request.headers)
  headers.delete("host")

  if (API_KEY) headers.set("X-API-Key", API_KEY)

  // Ensure JSON requests stay JSON
  if (!headers.get("content-type") && request.method !== "GET" && request.method !== "HEAD") {
    headers.set("content-type", "application/json")
  }

  const res = await fetch(url, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
  })

  return new Response(res.body, {
    status: res.status,
    headers: res.headers,
  })
}

