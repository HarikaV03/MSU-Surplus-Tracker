"use client";
import { useEffect, useState } from 'react'; 
import { useRouter, usePathname } from 'next/navigation'; 
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion'; 
import { 
  LayoutDashboard, 
  ClipboardList, 
  ScanBarcode, 
  BarChart3, 
  Settings, 
  LogOut,
  PlusCircle
} from 'lucide-react';

export default function Layout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('msu_user');
    if (!user) {
      router.push('/login'); 
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('msu_user');
    router.push('/login');
  };

  const menuItems = [
    { name: 'Dashboard', href: '/', icon: <LayoutDashboard size={20}/> },
    { name: 'Inventory', href: '/inventory', icon: <ClipboardList size={20}/> },
    { name: 'Add Asset', href: '/add', icon: <PlusCircle size={20}/> },
    { name: 'Scanner', href: '/scanner', icon: <ScanBarcode size={20}/> },
    { name: 'Reports', href: '/reports', icon: <BarChart3 size={20}/> },
    { name: 'Settings', href: '/settings', icon: <Settings size={20}/> },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* SIDEBAR - Stays fixed and rendered regardless of auth/page state to prevent flickers */}
      <aside className="w-64 bg-brand-maroon text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 text-brand-gold text-2xl font-black border-b border-brand-dark italic tracking-tighter">
          MSU SURPLUS Tracker
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${
                  isActive 
                    ? 'bg-brand-dark text-brand-gold shadow-inner' 
                    : 'hover:bg-brand-dark hover:text-brand-gold'
                }`}
              >
                <span className={`${
                  isActive ? 'text-brand-gold' : 'text-brand-gold/60 group-hover:text-brand-gold'
                }`}>
                  {item.icon}
                </span>
                <span className={`font-semibold ${isActive ? 'text-white' : ''}`}>
                  {item.name}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 bg-brand-gold rounded-full shadow-[0_0_8px_rgba(214,172,80,0.8)]" 
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-brand-dark space-y-2">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg hover:bg-black/20 hover:text-brand-gold transition-all text-sm font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
          <div className="px-3 py-1 text-[10px] uppercase tracking-widest text-brand-gold/50 font-bold">
            Admin Portal
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <header className="h-16 bg-white border-b-4 border-brand-gold flex items-center px-8 justify-between shadow-sm z-10">
          <h2 className="font-bold text-brand-maroon uppercase tracking-tight">
            {menuItems.find(i => i.href === pathname)?.name || "System Overview"}
          </h2>
          <div className="flex items-center gap-4">
             <span className="text-xs font-bold text-brand-maroon bg-brand-gold/20 px-3 py-1 rounded-full uppercase tracking-wider">
                April 2026
             </span>
          </div>
        </header>

        <main className="flex-1 overflow-auto relative">
          <AnimatePresence mode="wait">
            {isCheckingAuth ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full w-full flex flex-col items-center justify-center bg-background"
              >
                <div className="text-brand-maroon/20 text-4xl font-black italic mb-2 animate-pulse uppercase">
                  MSU
                </div>
                <div className="text-brand-maroon/40 text-[10px] uppercase tracking-[0.3em] font-bold">
                  Verifying...
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={pathname} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="p-8 max-w-7xl mx-auto"
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
