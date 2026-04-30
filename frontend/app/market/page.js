"use client";
import { useEffect, useState } from 'react';
import Layout from "../../components/Layout";
import { BarChart2, ShoppingCart, Globe, Tag } from 'lucide-react';

export default function MarketDashboard() {
  const [marketList, setMarketList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/market')
      .then(res => res.json())
      .then(data => {
        setMarketList(data);
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-brand-maroon uppercase italic tracking-tight">Market Intelligence</h1>
          <p className="text-slate-400 font-bold text-xs tracking-[0.3em] mt-1">MSU SURPLUS LIVE VALUATION</p>
        </div>
        <div className="bg-brand-gold/10 px-4 py-2 rounded-full border border-brand-gold/20">
          <span className="text-brand-maroon font-black text-xs uppercase tracking-widest animate-pulse">
            ● Live Analysis Active
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="w-12 h-12 border-4 border-brand-maroon border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-brand-maroon uppercase tracking-widest text-sm">Aggregating 25 Market Points...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {marketList.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-md transition-shadow">
              
              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-slate-300">#{item.id}</span>
                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                    item.cond === 'New' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>{item.cond}</span>
                </div>
                <h3 className="text-md font-black text-brand-maroon truncate uppercase">{item.name}</h3>
              </div>

              {/* Price Grid */}
              <div className="flex gap-2">
                <PriceBox label="MSU" price={item.prices.msu} highlight />
                <PriceBox label="eBay" price={item.prices.ebay} icon={<Globe size={10}/>} />
                <PriceBox label="Amazon" price={item.prices.amazon} icon={<ShoppingCart size={10}/>} />
              </div>

            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

function PriceBox({ label, price, highlight, icon }) {
  return (
    <div className={`w-20 p-2 rounded-xl text-center border ${
      highlight ? 'bg-brand-maroon border-brand-maroon text-white' : 'bg-slate-50 border-slate-100 text-slate-500'
    }`}>
      <p className={`text-[8px] font-black uppercase mb-1 flex items-center justify-center gap-1 ${highlight ? 'text-brand-gold' : 'text-slate-400'}`}>
        {icon} {label}
      </p>
      <p className="font-mono font-bold text-xs">${price}</p>
    </div>
  );
}
