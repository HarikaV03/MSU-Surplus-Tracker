"use client"

import Layout from "../../components/Layout"
import AssetForm from '../../components/AssetForm'
import BackButton from "../../components/BackButton"

export default function RegisterPage() {
  return (
    <Layout>
      {/* Back button for easy navigation */}
      <div className="max-w-2xl mx-auto pt-6 px-4">
        <BackButton />
      </div>

      <div className="max-w-2xl mx-auto py-10 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-maroon-800 uppercase tracking-tight">
            Register New Asset
          </h1>
          <p className="text-slate-500 text-sm">
            Add a new item to the MSU Surplus database. Use Gemini to generate professional descriptions.
          </p>
        </header>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
           <AssetForm /> 
        </div>
      </div>
    </Layout>
  );
}
