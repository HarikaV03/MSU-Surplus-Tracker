"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', department: '', role: 'Staff' });

  const handleSignup = (e) => {
    e.preventDefault();
    
    localStorage.setItem('msu_user', JSON.stringify(form));
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-brand-maroon flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 border-t-8 border-brand-gold">
        <h1 className="text-3xl font-black text-brand-maroon italic mb-2">MSU SURPLUS</h1>
        <p className="text-slate-500 mb-6 font-medium">Create your administrative account</p>
        
        <form onSubmit={handleSignup} className="space-y-4">
          <input required name="name" placeholder="Full Name" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-brand-gold" onChange={(e) => setForm({...form, name: e.target.value})} />
          <input required type="email" name="email" placeholder="University Email" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-brand-gold" onChange={(e) => setForm({...form, email: e.target.value})} />
          <select className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-brand-gold" onChange={(e) => setForm({...form, department: e.target.value})}>
            <option>Select Department</option>
            <option>IT Services</option>
            <option>Athletics</option>
            <option>Facilities</option>
          </select>
          <select className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-brand-gold" onChange={(e) => setForm({...form, role: e.target.value})}>
            <option value="Staff">Staff</option>
            <option value="Manager">Manager</option>
            <option value="Admin">System Admin</option>
          </select>
          <button className="w-full bg-brand-maroon text-white font-bold py-3 rounded-lg hover:bg-brand-dark transition-all shadow-lg">
            Register Account
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account? <Link href="/login" className="text-brand-maroon font-bold">Log In</Link>
        </p>
      </div>
    </div>
  );
}
