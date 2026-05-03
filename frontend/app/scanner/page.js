"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Layout from "../../components/Layout";
import BackButton from "../../components/BackButton";
import { getAssetByTag } from "../../lib/api";
import { Camera, Barcode, Laptop, AlertCircle, CheckCircle2 } from "lucide-react";

const QRScanner = dynamic(() => import("../../components/QRScanner"), { 
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
      <p className="text-slate-400 animate-pulse font-bold">INITIALIZING CAMERA...</p>
    </div>
  )
});

export default function ScannerPage() {
  const [activeTab, setActiveTab] = useState("camera"); // 'camera' or 'barcode'
  const [scannedAsset, setScannedAsset] = useState(null);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const barcodeInputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-focus the input when switching to Barcode tab for the wand
  useEffect(() => {
    if (activeTab === "barcode" && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [activeTab]);

  const handleScan = async (decodedText) => {
    if (!decodedText) return;
    setError(null);
    try {
      const asset = await getAssetByTag(decodedText);
      setScannedAsset(asset);
      // Clear input after success for next wand scan
      if (barcodeInputRef.current) barcodeInputRef.current.value = "";
    } catch (err) {
      setScannedAsset(null);
      setError(`Tag "${decodedText}" not found in MSU Database`);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <BackButton />
        
        <div className="flex flex-col items-center mt-4">
          <h1 className="text-4xl font-black text-brand-maroon italic mb-2 uppercase tracking-tighter">
            Scanner Portal
          </h1>
          <p className="text-slate-400 font-bold text-xs tracking-[0.2em] mb-8 uppercase">
            MSU Asset Verification System
          </p>
          
          <div className="w-full bg-white rounded-3xl shadow-2xl border-t-8 border-brand-gold overflow-hidden">
            
            {/* TAB NAVIGATION */}
            <div className="flex p-2 bg-slate-50 border-b border-slate-100">
              <TabButton 
                active={activeTab === "camera"} 
                onClick={() => setActiveTab("camera")}
                icon={<Camera size={18} />}
                label="Camera"
              />
              <TabButton 
                active={activeTab === "barcode"} 
                onClick={() => setActiveTab("barcode")}
                icon={<Barcode size={18} />}
                label="Wand / Manual"
              />
            </div>

            <div className="p-6">
              {activeTab === "camera" ? (
                <div className="animate-in fade-in duration-500">
                  {mounted ? (
                    <QRScanner onScanSuccess={handleScan} />
                  ) : (
                    <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
                  )}
                </div>
              ) : (
                <div className="py-10 px-4 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="text-center mb-6">
                    <div className="inline-flex p-4 bg-brand-maroon/5 rounded-full text-brand-maroon mb-4">
                      <Laptop size={32} />
                    </div>
                    <h2 className="text-lg font-black text-brand-maroon uppercase">Bluetooth Wand Mode</h2>
                    <p className="text-slate-500 text-sm italic">Scan a barcode or type the Tag ID manually</p>
                  </div>
                  
                  <input 
                    ref={barcodeInputRef}
                    type="text" 
                    placeholder="Awaiting Scan..." 
                    className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center text-xl font-mono font-bold focus:border-brand-maroon focus:ring-4 focus:ring-brand-maroon/5 outline-none transition-all"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleScan(e.target.value);
                        e.target.value = ""; // Clear for next scan
                      }
                    }}
                  />
                </div>
              )}

              {/* RESULTS SECTION */}
              <div className="mt-8 min-h-[100px]">
                {scannedAsset && (
                  <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-100 flex gap-4 animate-in zoom-in-95 duration-300">
                    <div className="text-green-600 mt-1">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black bg-green-600 text-white px-2 py-0.5 rounded-full">MATCH FOUND</span>
                        <span className="text-slate-400 font-mono text-xs font-bold">#{scannedAsset.asset_tag}</span>
                      </div>
                      <h3 className="font-black text-brand-maroon text-xl uppercase leading-tight">
                        {scannedAsset.item_name}
                      </h3>
                      <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                        {scannedAsset.description || "No description provided."}
                      </p>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="p-5 bg-red-50 text-red-700 rounded-2xl border-2 border-red-100 flex items-center gap-3 animate-in shake-1 duration-500">
                    <AlertCircle size={20} />
                    <span className="font-bold text-sm uppercase tracking-tight">{error}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Reusable Tab Button Component
function TabButton({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
        active 
          ? "bg-white text-brand-maroon shadow-md border border-slate-200" 
          : "text-slate-400 hover:text-slate-600"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
