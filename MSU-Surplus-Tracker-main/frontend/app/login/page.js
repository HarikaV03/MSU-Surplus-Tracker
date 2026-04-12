"use client";
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();

  const handleTestLogin = () => {
    
    const testUser = { name: "Demo Admin", department: "IT Services", role: "Admin" };
    localStorage.setItem('msu_user', JSON.stringify(testUser));
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-brand-maroon flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-10 text-center border-t-8 border-brand-gold">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-brand-maroon italic tracking-tighter">MSU SURPLUS tracker</h1>
          <p className="text-slate-400 uppercase tracking-widest text-xs font-bold mt-2">Asset Management Portal</p>
        </div>

        <div className="space-y-4">
          <button onClick={handleTestLogin} className="w-full bg-brand-maroon text-white font-bold py-4 rounded-xl hover:bg-brand-dark transition-all shadow-xl flex items-center justify-center gap-3 group">
            <span>Launch System Walkthrough</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
          
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">MSU Admin Login</span></div>
          </div>

          <input type="email" placeholder="MSU Email Address" className="w-full p-3 border rounded-lg bg-slate-50 outline-none" disabled />
          <button className="w-full border-2 border-slate-200 text-slate-400 font-bold py-3 rounded-lg cursor-not-allowed">
            Sign in with Mustangs ID
          </button>
          <p className="text-[10px] text-slate-400 italic">SSO Integration Pending Department Approval</p>
        </div>
      </div>
    </div>
  );
}
