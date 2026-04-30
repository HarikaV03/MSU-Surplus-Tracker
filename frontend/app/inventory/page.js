"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from "../../components/Layout";
import BackButton from "../../components/BackButton";
import { getAssets, updateAssetStatus } from "../../lib/api"; 
import { Search, X, Edit3, Save, BarChart2 } from 'lucide-react';

export default function InventoryPage() {
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    getAssets()
      .then(data => {
        setAssets(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const filteredAssets = assets.filter(asset => 
    asset.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.asset_tag.includes(searchTerm)
  );

  const handleSaveStatus = async () => {
    setIsSaving(true);
    try {
      await updateAssetStatus(selectedAsset.asset_id, selectedAsset.current_status);
      await fetchData(); // Refresh list
      setSelectedAsset(null); // Close modal
      alert("Asset updated successfully!");
    } catch (err) {
      alert("Failed to update asset.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <BackButton />
      
      {/* Header & Search Section */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-maroon uppercase tracking-tight">Asset Inventory</h1>
          <p className="text-slate-500 text-sm">Managing {filteredAssets.length} items</p>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search by name or tag (e.g. 49561)"
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none transition-all shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase">Tag</th>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase">Item Name</th>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase">Condition</th>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="4" className="p-12 text-center text-slate-400 animate-pulse">Fetching MSU Assets...</td></tr>
            ) : filteredAssets.map((asset) => (
              <tr 
                key={asset.asset_id} 
                onClick={() => setSelectedAsset(asset)}
                className="hover:bg-brand-gold/5 transition-colors group cursor-pointer"
              >
                <td className="p-4 font-mono text-sm text-brand-maroon font-bold">{asset.asset_tag}</td>
                <td className="p-4 text-slate-700 font-medium">{asset.item_name}</td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                    {asset.condition}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    asset.current_status === 'active' ? 'bg-green-100 text-green-700' : 
                    asset.current_status === 'surplus' ? 'bg-brand-gold/20 text-brand-maroon' : 
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {asset.current_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ASSET SUMMARY & EDIT MODAL */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-maroon/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-t-8 border-brand-gold overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-brand-maroon italic tracking-tighter flex items-center gap-2">
                <Edit3 size={20} className="text-brand-gold" />
                ASSET SUMMARY
              </h2>
              <button onClick={() => setSelectedAsset(null)} className="text-slate-400 hover:text-brand-maroon transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset Tag</label>
                  <p className="text-lg font-mono font-bold text-brand-maroon">{selectedAsset.asset_tag}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Condition</label>
                  <p className="text-md font-bold text-slate-700">{selectedAsset.condition}</p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Item Description</label>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-600 leading-relaxed italic">
                  {selectedAsset.description || "No description provided for this MSU asset."}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Manage Status</label>
                <select 
                  value={selectedAsset.current_status}
                  onChange={(e) => setSelectedAsset({...selectedAsset, current_status: e.target.value})}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none font-bold text-brand-maroon uppercase text-xs tracking-wider"
                >
                  <option value="active">Active</option>
                  <option value="surplus">Surplus</option>
                  <option value="disposed">Disposed</option>
                </select>
              </div>
            </div>

            {/* MODAL FOOTER WITH MARKET LINK */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
              {/* Dynamic Market Analysis Link */}
              <Link 
                href="/market"
                className="w-full bg-brand-gold text-brand-maroon font-black py-4 rounded-xl hover:bg-yellow-500 transition-all flex items-center justify-center gap-2 shadow-md uppercase tracking-widest text-xs"
              >
                <BarChart2 size={18} />
                View Market Analysis
              </Link>

              <div className="flex gap-3">
                <button 
                  onClick={handleSaveStatus}
                  disabled={isSaving}
                  className="flex-1 bg-brand-maroon text-white font-bold py-4 rounded-xl hover:bg-brand-dark transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <Save size={18} />
                  {isSaving ? "SAVING..." : "UPDATE ASSET"}
                </button>
                <button 
                  onClick={() => setSelectedAsset(null)}
                  className="flex-1 border-2 border-slate-200 text-slate-500 font-bold py-4 rounded-xl hover:bg-slate-100 transition-all"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
