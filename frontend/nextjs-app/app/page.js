"use client"
import { useEffect, useState } from "react"
import { getAssets } from "../lib/api"
import Layout from "../components/Layout"
import Link from "next/link"

export default function Home() {
  //  State to store assets from backend
  const [assets, setAssets] = useState([])

  //  Loading state 
  const [loading, setLoading] = useState(true)

  //  Optional: error state for robustness 
  const [error, setError] = useState(null)

  //  Runs once when component loads
  useEffect(() => {
    loadAssets()
  }, [])

  //  Fetch assets from FastAPI backend
  async function loadAssets() {
    try {
      const data = await getAssets()
      setAssets(data)
    } catch (err) {
      // Handle API failure
      setError("Failed to load assets. Please try again.")
    } finally {
      // Always stop loading 
      setLoading(false)
    }
  }

  return (
    <Layout>
      {/*  Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Surplus Assets
          </h1>
          <p className="text-gray-500 text-sm">
            Manage and track surplus inventory
          </p>
        </div>

        {/*  Navigation to Add Asset Page */}
        <Link
          href="/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          + Add Asset
        </Link>
      </div>

      {/*  CONDITIONAL RENDERING SECTION */}
      {/* This is where loading, error, empty, and data states are handled */}

      {loading ? (
        //  1. Loading State (while waiting for backend)
        <p className="text-gray-500">Loading assets...</p>

      ) : error ? (
        //  2. Error State (if API fails)
        <p className="text-red-500">{error}</p>

      ) : assets.length === 0 ? (
        //  3. Empty State (no data exists)
        <p className="text-gray-500 text-center mt-10">
          No assets yet. Click "Add Asset" to get started.
        </p>

      ) : (
        //  4. Data Display (normal case)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <Link key={asset.asset_id} href={`/assets/${asset.asset_id}`} className="block">
              <div className="bg-white shadow-md rounded-xl p-5 hover:shadow-xl transition border">
                {/*  Asset Name */}
                <h3 className="text-lg font-semibold text-gray-800">
                  {asset.item_name}
                </h3>

                {/*  Condition */}
                <p className="text-sm text-gray-500 mt-1">
                  Condition: {asset.condition}
                </p>

                {/* Status Badge (color-coded for UX clarity) */}
                <p
                  className={`mt-3 inline-block px-3 py-1 text-sm rounded-full ${
                    asset.current_status === "Disposed" || asset.current_status === "disposed"
                      ? "bg-red-100 text-red-600"
                      : asset.current_status === "Surplus" || asset.current_status === "surplus"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {asset.current_status}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  )
}