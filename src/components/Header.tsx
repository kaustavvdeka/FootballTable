'use client';
import Link from 'next/link';
import { useAdmin } from './AdminProvider';
import { Shield, ShieldAlert } from 'lucide-react';

export default function Header() {
    const { isAdmin, toggleAdmin } = useAdmin();

    return (
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-sm shadow-black/50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="font-bold text-xl flex items-center gap-2 text-white">
                        ⚽ Football League Table
                    </Link>
                    <button
                        onClick={toggleAdmin}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${isAdmin ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-md shadow-amber-500/10' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    >
                        {isAdmin ? <ShieldAlert size={18} /> : <Shield size={18} />}
                        {isAdmin ? 'Admin Mode' : 'Guest Mode'}
                    </button>
                </div>
            </div>
        </header>
    );
}
