import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-slate-800">
          MSU Surplus
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/" className="block p-3 rounded hover:bg-slate-800 transition">
            
          </Link>
          <Link href="/inventory" className="block p-3 rounded hover:bg-slate-800 transition">
            
          </Link>
          <Link href="/add" className="block p-3 rounded hover:bg-slate-800 transition">
           
          </Link>
        </nav>
        <div className="p-4 text-xs text-slate-500 border-t border-slate-800">
          Logged in as Admin
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center px-8 justify-between">
          <h2 className="font-semibold text-gray-700">System Overview</h2>
          <div className="flex items-center gap-4">
             <span className="text-sm text-gray-500">April 2026</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
