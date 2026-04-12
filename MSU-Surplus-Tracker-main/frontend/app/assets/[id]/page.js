"use client"
import { useEffect, useState } from "react"
import { getAsset, updateStatus } from "../../../lib/api"
import { useParams } from "next/navigation"

export default function AssetDetail() {
  const { id } = useParams()
  const [asset, setAsset] = useState(null)
  const [status, setStatus] = useState("")

  useEffect(() => {
    loadAsset()
  }, [])

  async function loadAsset() {
    const data = await getAsset(id)
    setAsset(data)
    setStatus(data.current_status)
  }

  async function handleUpdate() {
    const res = await updateStatus(id, status)
    alert(res.message)
    loadAsset()
  }

  if (!asset) return <p>Loading...</p>

  return (
    <div>
      <h1>{asset.item_name}</h1>
      <p>Condition: {asset.condition}</p>

      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="active">Active</option>
        <option value="surplus">Surplus</option>
        <option value="disposed">Disposed</option>
      </select>

      <button onClick={handleUpdate}>Update Status</button>
    </div>
  )
}
