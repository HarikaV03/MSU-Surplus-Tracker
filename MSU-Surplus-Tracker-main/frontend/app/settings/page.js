"use client";
import Layout from "../../components/Layout";
import BackButton from "../../components/BackButton";
import { Settings, User, Bell, Shield } from "lucide-react";

export default function SettingsPage() {
  const settingSections = [
    { name: 'Profile Settings', icon: <User size={20}/>, desc: 'Manage your admin account details' },
    { name: 'Notifications', icon: <Bell size={20}/>, desc: 'Configure surplus alert thresholds' },
    { name: 'Security', icon: <Shield size={20}/>, desc: 'Update passwords and API keys' },
  ];

  return (
    <Layout>
      <BackButton />
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-maroon uppercase tracking-tight">
          System Settings
        </h1>
        <p className="text-slate-500">Configure your MSU Surplus Tracker preferences.</p>
      </div>

      <div className="max-w-2xl space-y-4">
        {settingSections.map((section) => (
          <div 
            key={section.name}
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-brand-gold transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-brand-maroon/5 rounded-lg text-brand-maroon group-hover:bg-brand-gold/20 transition-colors">
                {section.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-700">{section.name}</h3>
                <p className="text-sm text-slate-500">{section.desc}</p>
              </div>
            </div>
            <div className="text-slate-300 group-hover:text-brand-gold">
              {/* Chevron icon could go here */}
              →
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
