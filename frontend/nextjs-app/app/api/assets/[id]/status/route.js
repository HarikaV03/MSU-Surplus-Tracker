import { proxy } from "../../../_proxy"

export async function PUT(request, { params }) {
  return proxy(request, `/assets/${params.id}/status`)
}

