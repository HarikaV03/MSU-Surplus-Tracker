"use client"
import { useEffect, useState } from "react"
import { getAsset, getAssetAuditEvents, updateStatus } from "../../../lib/api"
import Layout from "../../../components/Layout"
import { useParams } from "next/navigation"
import Link from "next/link"

export default function AssetDetail() {
  const { id } = useParams()
  const [asset, setAsset] = useState(null)
  const [status, setStatus] = useState("")
  const [auditEvents, setAuditEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function load() {
    setLoading(true)
    try {
      const data = await getAsset(id)
      setAsset(data)
      setStatus(data.current_status)
      const audits = await getAssetAuditEvents(id)
      setAuditEvents(audits)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate() {
    setSaving(true)
    try {
      await updateStatus(id, status)
      await load()
    } catch (err) {
      alert(err?.message || "Failed to update status")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-500">Loading...</p>
      </Layout>
    )
  }

  if (!asset) {
    return (
      <Layout>
        <p className="text-red-600">Asset not found.</p>
        <Link className="text-blue-600 underline" href="/">
          Back
        </Link>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{asset.item_name}</h1>
        <Link className="text-blue-600 underline" href="/">
          Back
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-gray-500">Asset ID</div>
            <div className="font-medium">{asset.asset_id}</div>
          </div>
          <div>
            <div className="text-gray-500">Asset Tag</div>
            <div className="font-medium">{asset.asset_tag || "—"}</div>
          </div>
          <div>
            <div className="text-gray-500">Condition</div>
            <div className="font-medium">{asset.condition || "—"}</div>
          </div>
          <div>
            <div className="text-gray-500">Location</div>
            <div className="font-medium">{asset.location || "—"}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="Active">Active</option>
            <option value="Surplus">Surplus</option>
            <option value="Disposed">Disposed</option>
          </select>
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? "Saving..." : "Update Status"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-3">Audit Trail</h2>
        {auditEvents.length === 0 ? (
          <p className="text-gray-500 text-sm">No audit events yet.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {auditEvents.map((ev) => (
              <div key={ev.audit_id} className="border rounded p-3">
                <div className="font-medium">{ev.event_type}</div>
                <div className="text-gray-600">
                  {ev.field_name ? (
                    <>
                      {ev.field_name}: {ev.old_value ?? "—"} → {ev.new_value ?? "—"}
                    </>
                  ) : (
                    "—"
                  )}
                </div>
                <div className="text-gray-500">
                  {ev.changed_at ? new Date(ev.changed_at).toLocaleString() : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

