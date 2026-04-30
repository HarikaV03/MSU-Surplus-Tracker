"use client";
import { useEffect, useState } from 'react';
import Layout from "../../components/Layout";
import BackButton from "../../components/BackButton";
import { getAssets } from "../../lib/api";
import { BarChart3, PieChart, Package, ShieldCheck, Trash2, ArrowUpRight } from 'lucide-react';

export default function ReportsPage() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    surplus: 0,
    disposed: 0,
    conditionBreakdown: { New: 0, Good: 0, Fair: 0, Poor: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAssets().then(data => {
      const counts = data.reduce((acc, asset) => {
        acc.total++;
        acc[asset.current_status]++;
        acc.conditionBreakdown[asset.condition]++;
        return acc;
      }, { total: 0, active: 0, surplus: 0, disposed: 0, conditionBreakdown: { New: 0, Good: 0, Fair: 0, Poor: 0 } });
      
      setStats(counts);
      setLoading(false);
    });
  }, []);

  
  const getWidth = (count) => stats.total > 0 ? `${(count / stats.total) * 100}%` : "0%";

  return (
    <Layout>
      <BackButton />
      
      <div className="mb-8">
        <h1 className="text-3xl font-black text-brand-maroon italic tracking-tighter flex items-center gap-3">
          <BarChart3 size={32} className="text-brand-gold" />
          SYSTEM ANALYTICS
        </h1>
        <p className="text-slate-500 font-medium">Real-time inventory distribution for MSU Surplus Division</p>
      </div>

      {/* BIG STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Assets" value={stats.total} icon={<Package size={24}/>} color="bg-slate-800" />
        <StatCard title="Active Use" value={stats.active} icon={<ShieldCheck size={24}/>} color="bg-green-600" />
        <StatCard title="In Surplus" value={stats.surplus} icon={<PieChart size={24}/>} color="bg-brand-gold" />
        <StatCard title="Disposed" value={stats.disposed} icon={<Trash2 size={24}/>} color="bg-brand-maroon" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CONDITION DISTRIBUTION - "The Bar Chart" */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-brand-maroon mb-6 flex items-center justify-between">
            Condition Distribution
            <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-400 font-black tracking-widest uppercase">Visual Metrics</span>
          </h3>
          <div className="space-y-6">
            <ProgressBar label="New / Excellent" count={stats.conditionBreakdown.New} width={getWidth(stats.conditionBreakdown.New)} color="bg-green-500" />
            <ProgressBar label="Good / Serviceable" count={stats.conditionBreakdown.Good} width={getWidth(stats.conditionBreakdown.Good)} color="bg-blue-500" />
            <ProgressBar label="Fair / Functional" count={stats.conditionBreakdown.Fair} width={getWidth(stats.conditionBreakdown.Fair)} color="bg-brand-gold" />
            <ProgressBar label="Poor / Salvage" count={stats.conditionBreakdown.Poor} width={getWidth(stats.conditionBreakdown.Poor)} color="bg-brand-maroon" />
          </div>
        </div>

        {/* RECENT ACTIVITY MOCK-UP */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-brand-maroon mb-6">Recent System Events</h3>
          <div className="space-y-4">
            <ActivityItem text="Batch disposal approved for IT Services" time="2h ago" type="disposal" />
            <ActivityItem text="12 New Dell Laptops registered" time="5h ago" type="add" />
            <ActivityItem text="Inventory Audit: Athletics Department" time="Yesterday" type="audit" />
            <ActivityItem text="Manual override: Asset 49561 status change" time="2 days ago" type="edit" />
          </div>
          <button className="w-full mt-8 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:border-brand-gold hover:text-brand-maroon transition-all">
            Download Full Audit Log (PDF)
          </button>
        </div>

      </div>
    </Layout>
  );
}


function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-all">
      <div className={`${color} absolute top-0 right-0 w-16 h-16 opacity-10 rounded-bl-full`}></div>
      <div className={`${color} text-white p-3 rounded-2xl w-fit mb-4 shadow-lg`}>
        {icon}
      </div>
      <div className="text-3xl font-black text-slate-800">{value}</div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{title}</div>
    </div>
  );
}

function ProgressBar({ label, count, width, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold mb-2">
        <span className="text-slate-600 uppercase">{label}</span>
        <span className="text-brand-maroon">{count} Assets</span>
      </div>
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width }}></div>
      </div>
    </div>
  );
}

function ActivityItem({ text, time, type }) {
  return (
    <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
      <div className="bg-brand-gold/20 p-2 rounded-lg">
        <ArrowUpRight size={14} className="text-brand-maroon" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-700">{text}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase">{time}</p>
      </div>
    </div>
  );
}
