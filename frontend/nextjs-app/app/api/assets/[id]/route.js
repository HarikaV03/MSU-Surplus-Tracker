import { proxy } from "../../_proxy"

export async function GET(request, { params }) {
  return proxy(request, `/assets/${params.id}`)
}

