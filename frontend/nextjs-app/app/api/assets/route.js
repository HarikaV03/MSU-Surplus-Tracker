import { proxy } from "../_proxy"

export async function GET(request) {
  return proxy(request, "/assets")
}

export async function POST(request) {
  return proxy(request, "/assets")
}

