"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AssetForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    asset_tag: "",
    item_name: "",
    description: "",
    condition: "Good",
    current_status: "surplus",
    location: ""
  });

  const handleGenerateDescription = async () => {
  if (!formData.item_name) {
    alert("Please enter an Item Name first!");
    return;
  }

  setLoading(true);
  try {
 
    const codespaceName = process.env.NEXT_PUBLIC_CODESPACE_NAME || ""; 
    const backendUrl = `https://${codespaceName}-8000.app.github.dev/generate-description`;
  
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        item_name: formData.item_name, 
        condition: formData.condition 
      }),
    });
    
    if (!response.ok) throw new Error('Backend not responding');

    const data = await response.json();
    if (data.description) {
      setFormData({ ...formData, description: data.description });
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    alert(`AI Error: Ensure your backend is running at ${process.env.NEXT_PUBLIC_API_URL}`);
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Asset Registered Successfully!");
        router.push('/inventory'); // Redirect to inventory list
      } else {
        const err = await response.json();
        alert(`Error: ${err.detail}`);
      }
    } catch (error) {
      alert("Database Error: Failed to save asset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Asset Tag & Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="font-bold text-slate-700 text-xs uppercase mb-1">Asset Tag / Barcode</label>
          <input
            type="text"
            className="p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-gold"
            value={formData.asset_tag}
            onChange={(e) => setFormData({...formData, asset_tag: e.target.value})}
            placeholder="e.g. 54321"
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="font-bold text-slate-700 text-xs uppercase mb-1">Item Name</label>
          <input
            type="text"
            className="p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-gold"
            value={formData.item_name}
            onChange={(e) => setFormData({...formData, item_name: e.target.value})}
            placeholder="e.g. Dell Latitude 5420"
            required
          />
        </div>
      </div>

      {/* Description with Gemini AI */}
      <div className="flex flex-col">
        <label className="font-bold text-slate-700 text-xs uppercase mb-1">Description (Notes)</label>
        <div className="flex items-start gap-2">
          <textarea
            className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-gold text-sm"
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Add notes about condition or issues..."
          />
          <button
            type="button"
            onClick={handleGenerateDescription}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 font-bold text-[10px] uppercase tracking-tighter"
          >
            {loading ? "..." : "Fix"}
          </button>
        </div>
      </div>

      {/* Condition & Status Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="font-bold text-slate-700 text-xs uppercase mb-1">Condition</label>
          <select 
            className="p-2.5 border border-slate-300 rounded-lg bg-white"
            value={formData.condition}
            onChange={(e) => setFormData({...formData, condition: e.target.value})}
          >
            <option value="New">New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor/Broken</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="font-bold text-slate-700 text-xs uppercase mb-1">Status Action</label>
          <select 
            className="p-2.5 border border-slate-300 rounded-lg bg-white font-semibold text-brand-maroon"
            value={formData.current_status}
            onChange={(e) => setFormData({...formData, current_status: e.target.value})}
          >
            <option value="active">In Use (Active)</option>
            <option value="surplus">Send to Surplus</option>
            <option value="disposed">Dispose / Scrap</option>
            <option value="sold">Mark as Sold</option>
          </select>
        </div>
      </div>

      {/* Final Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-maroon text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-maroon-900/20 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Register & Save Asset"}
      </button>
    </form>
  );
}
