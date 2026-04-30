"use client"; 
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()}
      className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4 font-medium"
    >
      <ArrowLeft size={20} />
      <span>Go Back</span>
    </button>
  );
}
