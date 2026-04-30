"use client"
import { useEffect, useState } from "react"
import { getAssets } from "../lib/api"
import Layout from "../components/Layout"
import Link from "next/link"

export default function Home() {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAssets()
  }, [])

  async function loadAssets() {
    try {
      const data = await getAssets()
      setAssets(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError("Failed to load assets. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Quick Stats Calculation
  const totalAssets = assets.length
  const surplusCount = assets.filter(a => a.current_status === "surplus").length
  const disposedCount = assets.filter(a => a.current_status === "disposed").length

  return (
    <Layout>
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Surplus Inventory
          </h1>
          <p className="text-slate-500 mt-1">
            Monitor and manage MSU asset lifecycles.
          </p>
        </div>

        <Link
          href="/add"
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-sm transition-all active:scale-95"
        >
          <span className="mr-2 text-xl">+</span> Add New Asset
        </Link>
      </div>

      {/* QUICK STATS CARDS */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <p className="text-slate-500 text-sm font-medium">Total Items</p>
            <p className="text-2xl font-bold text-slate-800">{totalAssets}</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm border-l-4 border-l-yellow-400">
            <p className="text-slate-500 text-sm font-medium">In Surplus</p>
            <p className="text-2xl font-bold text-slate-800">{surplusCount}</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm border-l-4 border-l-red-400">
            <p className="text-slate-500 text-sm font-medium">Disposed</p>
            <p className="text-2xl font-bold text-slate-800">{disposedCount}</p>
          </div>
        </div>
      )}

      {/* CONTENT STATES */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-slate-500 mt-4 font-medium">Loading MSU Database...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center">
          <p className="font-semibold">{error}</p>
          <button 
            onClick={loadAssets}
            className="mt-2 text-sm underline hover:text-red-800"
          >
            Try again
          </button>
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-16 text-center">
          <p className="text-slate-400 text-lg">No assets registered in the system.</p>
          <Link href="/add" className="text-blue-600 font-semibold hover:underline mt-2 inline-block">
            Register your first asset →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <div
              key={asset.asset_id}
              className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                  ID: {asset.asset_id}
                </div>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-tight ${
                    asset.current_status === "disposed"
                      ? "bg-red-100 text-red-700"
                      : asset.current_status === "surplus"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {asset.current_status}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                {asset.item_name}
              </h3>

              <p className="text-slate-500 text-sm mt-2 line-clamp-2 h-10">
                {asset.description || "No description provided."}
              </p>

              <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Condition</p>
                  <p className="text-sm font-semibold text-slate-700">{asset.condition || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Location</p>
                  <p className="text-sm font-semibold text-slate-700">{asset.location || "N/A"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
