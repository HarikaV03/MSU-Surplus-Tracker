"use client"

import { useState } from "react"
import { addAsset } from "../../lib/api"
import Layout from "../../components/Layout"
import { useRouter } from "next/navigation"

export default function AddAsset() {
  //  Router for redirecting after submission
  const router = useRouter()

  //  Form state (stores user input)
  const [form, setForm] = useState({
    id: "",
    asset_tag: "",
    item_name: "",
    condition: "",
    current_status: "active", // default value
  })

  //  Loading state for UX feedback
  const [loading, setLoading] = useState(false)

  //  Handle input changes (updates form state)
  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  //  Handle form submission
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      await addAsset({
        ...form,
        id: Number(form.id), // convert ID to number
      })

      alert("Asset added successfully!")
      router.push("/")
    } catch (err) {
      alert(err?.message || "Failed to add asset")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      {/*  Centered Card Container */}
      <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4">Add New Asset</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ID Field */}
          <input
            name="id"
            placeholder="ID"
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          {/* Asset Tag */}
          <input
            name="asset_tag"
            placeholder="Asset Tag / Barcode"
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          {/* Item Name */}
          <input
            name="item_name"
            placeholder="Item Name"
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          {/* Condition */}
          <input
            name="condition"
            placeholder="Condition (e.g., Good, Fair, Poor)"
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          {/* Status Dropdown */}
          <select
            name="current_status"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="active">Active</option>
            <option value="surplus">Surplus</option>
            <option value="disposed">Disposed</option>
          </select>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? "Adding..." : "Add Asset"}
          </button>
        </form>
      </div>
    </Layout>
  )
}
