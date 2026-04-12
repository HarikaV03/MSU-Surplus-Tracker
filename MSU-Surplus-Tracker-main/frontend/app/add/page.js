"use client"

import { useState } from "react"
import { addAsset, generateAIDescription } from "../../lib/api"
import Layout from "../../components/Layout"
import BackButton from "../../components/BackButton"
import { useRouter } from "next/navigation"
import { Sparkles } from 'lucide-react' 

export default function AddAsset() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const [form, setForm] = useState({
    asset_tag: "",
    item_name: "",
    condition: "Good",
    current_status: "surplus",
    description: "" 
  })

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  // AI Generation Logic
  const handleAI = async () => {
    if (!form.item_name) return alert("Please enter an item name first!");
    setIsGenerating(true);
    try {
      const result = await generateAIDescription(form.item_name, form.condition);
      setForm({ ...form, description: result.description });
    } catch (err) {
      alert("AI Generation failed: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await addAsset(form)
      if (result) {
        alert("Asset added successfully!")
        router.push("/")
      }
    } catch (err) {
      alert("Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <BackButton />
      
      <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-brand-maroon mb-6 uppercase tracking-tight">
          Register New Asset
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Asset Tag - Example updated to 49561 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Asset Tag / Barcode</label>
            <input
              name="asset_tag"
              placeholder="e.g. 49561" 
              onChange={handleChange}
              required
              className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Item Name</label>
            <input
              name="item_name"
              placeholder="e.g. Dell Latitude Laptop"
              onChange={handleChange}
              required
              className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none"
            />
          </div>

          {/* Description with AI Sparkles Button */}
          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="block text-sm font-bold text-slate-700">Description</label>
              <button 
                type="button"
                onClick={handleAI}
                disabled={isGenerating}
                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-brand-maroon hover:text-brand-gold transition-colors"
              >
                <Sparkles size={12} />
                {isGenerating ? "AI Thinking..." : "Auto-Fill with Claude"}
              </button>
            </div>
            <textarea
              name="description"
              value={form.description} 
              onChange={handleChange}
              rows="3"
              className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none text-sm"
              placeholder="Briefly describe the item's features or faults..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Condition</label>
              <select name="condition" onChange={handleChange} className="w-full border p-2.5 rounded-lg outline-none">
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor/Broken</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
              <select name="current_status" onChange={handleChange} className="w-full border p-2.5 rounded-lg outline-none">
                <option value="active">Active</option>
                <option value="surplus">Surplus</option>
                <option value="disposed">Disposed</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-maroon text-white font-bold py-3 rounded-lg hover:bg-brand-dark transition-all shadow-md disabled:opacity-50 mt-4"
          >
            {loading ? "Registering..." : "Add Asset to Database"}
          </button>
        </form>
      </div>
    </Layout>
  )
}
