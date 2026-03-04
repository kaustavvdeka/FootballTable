'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/components/AdminProvider';
import { PlusCircle, Trophy, ArrowRight, Loader2 } from 'lucide-react';

export default function Home() {
  const { isAdmin } = useAdmin();
  const [leagues, setLeagues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchLeagues = async () => {
    try {
      const res = await fetch('/api/leagues');
      const data = await res.json();
      setLeagues(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeagues();
  }, []);

  const createLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setCreating(true);
    try {
      const res = await fetch('/api/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        setName('');
        fetchLeagues();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Tournaments & Leagues
          </h1>
          <p className="text-slate-400 mt-2">Manage and view all your active football competitions.</p>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <PlusCircle size={20} className="text-emerald-400" />
            Create New League / Group
          </h2>
          <form onSubmit={createLeague} className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. La Liga, Group A..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium text-white"
              disabled={creating}
            />
            <button
              type="submit"
              disabled={!name || creating}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {creating ? <Loader2 size={18} className="animate-spin" /> : 'Create'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-emerald-500" size={32} />
        </div>
      ) : leagues.length === 0 ? (
        <div className="text-center p-12 bg-slate-900/50 border border-slate-800 rounded-xl border-dashed">
          <Trophy size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-medium text-slate-300">No leagues found</h3>
          <p className="text-slate-500 mt-2">Create a new league to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leagues.map((league) => (
            <Link
              key={league.id}
              href={`/leagues/${league.id}`}
              className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-emerald-900/20 hover:-translate-y-1 block"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                    <Trophy size={24} />
                  </div>
                  <h3 className="text-lg font-bold truncate max-w-[200px] text-white">{league.name}</h3>
                </div>
                <ArrowRight size={20} className="text-slate-600 group-hover:text-emerald-400 transform group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4 text-sm text-slate-500">
                Created on {new Date(league.createdAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
