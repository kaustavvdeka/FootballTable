'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/components/AdminProvider';
import { Trophy, Users, Calendar, PlusCircle, LayoutList, Loader2, Save, AlertCircle, Play, Trash2, RotateCcw, XCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Modal from '@/components/Modal';
import ToastContainer, { ToastMessage, ToastType } from '@/components/Toast';

const STAGES = ['League Stage', 'Group Stage', 'Round of 16', 'Super 8', 'Semi-Final', 'Final'];

export default function LeaguePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { isAdmin } = useAdmin();
    const [league, setLeague] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [teamName, setTeamName] = useState('');
    const [teamGroup, setTeamGroup] = useState('');
    const [addingTeam, setAddingTeam] = useState(false);

    const [scheduleStage, setScheduleStage] = useState('League Stage');
    const [scheduling, setScheduling] = useState(false);

    const [customHomeTeam, setCustomHomeTeam] = useState('');
    const [customAwayTeam, setCustomAwayTeam] = useState('');
    const [customStage, setCustomStage] = useState('Final');
    const [addingMatch, setAddingMatch] = useState(false);

    const router = useRouter();
    // View state
    const [activeTab, setActiveTab] = useState<'table' | 'matches'>('table');
    const [clearingSchedule, setClearingSchedule] = useState(false);

    // Toast State
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const addToast = (message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
    };
    const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        children: React.ReactNode;
        type: 'danger' | 'success' | 'info';
        confirmLabel: string;
        onConfirm: () => void;
        loading: boolean;
    }>({
        isOpen: false,
        title: '',
        children: null,
        type: 'info',
        confirmLabel: 'Confirm',
        onConfirm: () => { },
        loading: false
    });

    const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));
    const openModal = (config: Omit<typeof modalConfig, 'isOpen' | 'loading'>) => {
        setModalConfig({ ...config, isOpen: true, loading: false });
    };

    const fetchLeague = async () => {
        try {
            const res = await fetch(`/api/leagues/${id}`);
            if (!res.ok) throw new Error('Failed to fetch league');
            const data = await res.json();
            setLeague(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeague();
    }, [id]);

    const addTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamName) return;
        setAddingTeam(true);
        try {
            const payload: any = { name: teamName, leagueId: id };
            if (teamGroup) payload.group = teamGroup;

            const res = await fetch('/api/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setTeamName('');
                setTeamGroup('');
                addToast('Team added successfully!', 'success');
                fetchLeague();
            } else {
                const err = await res.json();
                addToast(err.error || 'Failed to add team', 'error');
            }
        } catch (err) {
            addToast('An unexpected error occurred', 'error');
            console.error(err);
        } finally {
            setAddingTeam(false);
        }
    };

    const scheduleMatches = async () => {
        setScheduling(true);
        try {
            const res = await fetch(`/api/leagues/${id}/schedule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stage: scheduleStage })
            });
            if (res.ok) {
                addToast('Schedule generated!', 'success');
                fetchLeague();
            } else {
                const err = await res.json();
                addToast(err.error, 'error');
            }
        } catch (err) {
            addToast('Failed to generate schedule', 'error');
            console.error(err);
        } finally {
            setScheduling(false);
        }
    };

    const addCustomMatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customHomeTeam || !customAwayTeam || customHomeTeam === customAwayTeam) {
            addToast("Please select two different teams.", "info");
            return;
        }
        setAddingMatch(true);
        try {
            const res = await fetch(`/api/leagues/${id}/matches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ homeTeamId: customHomeTeam, awayTeamId: customAwayTeam, stage: customStage })
            });
            if (res.ok) {
                setCustomHomeTeam('');
                setCustomAwayTeam('');
                addToast('Match created!', 'success');
                fetchLeague();
            } else {
                const err = await res.json();
                addToast(err.error, 'error');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setAddingMatch(false);
        }
    };

    const updateMatch = async (matchId: string, homeGoals: number, awayGoals: number) => {
        try {
            await fetch(`/api/matches/${matchId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ homeGoals, awayGoals })
            });
            fetchLeague();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteMatch = async (matchId: string) => {
        openModal({
            title: 'Delete Match',
            type: 'danger',
            confirmLabel: 'Delete',
            children: 'Are you sure you want to delete this match? This action cannot be undone.',
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, loading: true }));
                try {
                    await fetch(`/api/matches/${matchId}`, { method: 'DELETE' });
                    addToast('Match deleted', 'success');
                    fetchLeague();
                    closeModal();
                } catch (err) {
                    addToast('Failed to delete match', 'error');
                }
            }
        });
    };

    const resetMatch = async (matchId: string) => {
        openModal({
            title: 'Reset Match',
            type: 'info',
            confirmLabel: 'Reset',
            children: 'Reset this match result back to Upcoming?',
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, loading: true }));
                try {
                    await fetch(`/api/matches/${matchId}`, { method: 'PUT' });
                    addToast('Match result reset', 'success');
                    fetchLeague();
                    closeModal();
                } catch (err) {
                    addToast('Failed to reset match', 'error');
                }
            }
        });
    };

    const deleteTeam = async (teamId: string) => {
        openModal({
            title: 'Delete Team',
            type: 'danger',
            confirmLabel: 'Delete Team',
            children: 'Delete this team and all its matches? This will affect the standings.',
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, loading: true }));
                try {
                    await fetch(`/api/teams/${teamId}`, { method: 'DELETE' });
                    addToast('Team deleted', 'success');
                    fetchLeague();
                    closeModal();
                } catch (err) {
                    addToast('Failed to delete team', 'error');
                }
            }
        });
    };

    const deleteLeague = async () => {
        openModal({
            title: 'DELETE LEAGUE',
            type: 'danger',
            confirmLabel: 'Delete League Forever',
            children: 'Are you absolutely sure? This will delete the entire league and all associated data permanently.',
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, loading: true }));
                try {
                    await fetch(`/api/leagues/${id}/delete`, { method: 'DELETE' });
                    router.push('/');
                } catch (err) {
                    addToast('Failed to delete league', 'error');
                    setModalConfig(prev => ({ ...prev, loading: false }));
                }
            }
        });
    };

    const clearSchedule = async () => {
        openModal({
            title: 'Clear Schedule',
            type: 'danger',
            confirmLabel: 'Clear All Matches',
            children: 'This will delete ALL matches in this league. This cannot be undone.',
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, loading: true }));
                try {
                    const res = await fetch(`/api/leagues/${id}/schedule`, { method: 'DELETE' });
                    if (res.ok) {
                        addToast('Schedule cleared', 'success');
                        fetchLeague();
                    }
                    closeModal();
                } catch (err) {
                    addToast('Failed to clear schedule', 'error');
                }
            }
        });
    };

    if (loading) return (
        <div className="flex justify-center p-24">
            <Loader2 className="animate-spin text-emerald-500" size={48} />
        </div>
    );

    if (error) return (
        <div className="text-center p-12 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-medium text-red-500">{error}</h3>
            <Link href="/" className="text-slate-400 hover:text-white mt-4 inline-block">← Back to Home</Link>
        </div>
    );

    // Compute Table stats (Only for League and Group Stages)
    const tableStats = new Map();
    league.teams.forEach((t: any) => {
        tableStats.set(t.id, {
            ...t,
            p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0
        });
    });

    league.matches.forEach((m: any) => {
        // Only count group/league matches for the main table standings
        if (m.status === 'FINISHED' && (m.stage === 'League Stage' || m.stage === 'Group Stage')) {
            const home = tableStats.get(m.homeTeamId);
            const away = tableStats.get(m.awayTeamId);

            if (!home || !away) return; // safety check

            home.p += 1; away.p += 1;
            home.gf += m.homeGoals; away.gf += m.awayGoals;
            home.ga += m.awayGoals; away.ga += m.homeGoals;

            if (m.homeGoals > m.awayGoals) {
                home.w += 1; home.pts += 3;
                away.l += 1;
            } else if (m.homeGoals < m.awayGoals) {
                away.w += 1; away.pts += 3;
                home.l += 1;
            } else {
                home.d += 1; home.pts += 1;
                away.d += 1; away.pts += 1;
            }
        }
    });

    const tableRows = Array.from(tableStats.values()).map(t => {
        t.gd = t.gf - t.ga;
        return t;
    }).sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
    });

    // Group the table rows by their group field if it exists
    const groupedTableRows: Record<string, any[]> = {};
    const hasGroups = tableRows.some(row => row.group);

    if (hasGroups) {
        tableRows.forEach(row => {
            const groupName = row.group || 'Standings'; // fallback
            if (!groupedTableRows[groupName]) groupedTableRows[groupName] = [];
            groupedTableRows[groupName].push(row);
        });
    } else {
        groupedTableRows['League Standings'] = tableRows;
    }

    // Group Matches by Stage
    const groupedMatches: Record<string, any[]> = {};
    league.matches.forEach((m: any) => {
        const stage = m.stage || 'League Stage';
        if (!groupedMatches[stage]) groupedMatches[stage] = [];
        groupedMatches[stage].push(m);
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 w-full">
            {/* Header Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl">
                    <Trophy size={200} className="text-emerald-500" />
                </div>

                <div className="h-20 w-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 z-10 shrink-0">
                    <Trophy size={40} className="text-white drop-shadow-md" />
                </div>
                <div className="z-10 w-full text-center sm:text-left break-words">
                    <h1 className="text-3xl font-bold text-white tracking-tight break-words">{league.name}</h1>
                    <p className="text-slate-400 mt-2 flex flex-wrap justify-center sm:justify-start items-center gap-4 text-sm font-medium">
                        <span className="flex items-center gap-1.5"><Users size={16} /> {league.teams.length} Teams</span>
                        <span className="flex items-center gap-1.5"><Calendar size={16} /> {league.matches.length} Matches</span>
                    </p>
                </div>
            </div>

            {/* Admin Panel */}
            {isAdmin && (
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Add Team */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <PlusCircle size={16} className="text-emerald-400" /> Add Team to League
                        </h3>
                        <form onSubmit={addTeam} className="flex flex-col gap-3">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Team Name"
                                    value={teamName}
                                    onChange={e => setTeamName(e.target.value)}
                                    className="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white placeholder:text-slate-500 transition-all font-medium"
                                    disabled={addingTeam}
                                />
                                <select
                                    value={teamGroup}
                                    onChange={e => setTeamGroup(e.target.value)}
                                    className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                >
                                    <option value="">No Grp</option>
                                    <option value="A">Grp A</option>
                                    <option value="B">Grp B</option>
                                    <option value="C">Grp C</option>
                                    <option value="D">Grp D</option>
                                    <option value="E">Grp E</option>
                                    <option value="F">Grp F</option>
                                    <option value="G">Grp G</option>
                                    <option value="H">Grp H</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={!teamName || addingTeam}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-md shadow-emerald-900/20 shrink-0 flex items-center gap-2"
                            >
                                {addingTeam ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />} Add
                            </button>
                        </form>
                    </div>

                    {/* Auto Scheduler */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-center hover:border-slate-700 transition-colors">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Generate Initial Fixtures</h3>
                        <p className="text-xs text-slate-500 mb-3 leading-relaxed">Round-robin between all teams. Ensure all teams are added first.</p>
                        <div className="flex gap-3">
                            <select
                                value={scheduleStage}
                                onChange={e => setScheduleStage(e.target.value)}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="League Stage">League Stage</option>
                                <option value="Group Stage">Group Stage</option>
                            </select>
                            <button
                                onClick={scheduleMatches}
                                disabled={scheduling || league.teams.length < 2 || league.matches.length > 0}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md shadow-indigo-900/20 shrink-0"
                            >
                                {scheduling ? <Loader2 size={16} className="animate-spin" /> : 'Generate'}
                            </button>
                        </div>
                    </div>

                    {/* Add Custom Match (Knockouts) */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:col-span-2 hover:border-slate-700 transition-colors">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Play size={16} className="text-rose-400" /> Create Knockout Match
                        </h3>
                        <form onSubmit={addCustomMatch} className="flex flex-col sm:flex-row gap-3 items-end">
                            <div className="flex-1 w-full flex flex-col gap-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Stage</label>
                                <select value={customStage} onChange={e => setCustomStage(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-rose-500/50 outline-none">
                                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="flex-1 w-full flex flex-col gap-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Home Team</label>
                                <select value={customHomeTeam} onChange={e => setCustomHomeTeam(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-rose-500/50 outline-none">
                                    <option value="" disabled>Select Team...</option>
                                    {league.teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="flex-none flex items-center justify-center pb-2 px-2 text-slate-500 font-bold w-full sm:w-auto">VS</div>
                            <div className="flex-1 w-full flex flex-col gap-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Away Team</label>
                                <select value={customAwayTeam} onChange={e => setCustomAwayTeam(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-rose-500/50 outline-none">
                                    <option value="" disabled>Select Team...</option>
                                    {league.teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <button type="submit" disabled={addingMatch || !customHomeTeam || !customAwayTeam} className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 whitespace-nowrap">
                                Create Match
                            </button>
                        </form>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-slate-900 border border-red-500/20 rounded-xl p-6 md:col-span-2 hover:border-red-500/40 transition-colors">
                        <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <AlertCircle size={16} className="text-red-500" /> Danger Zone
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={clearSchedule}
                                disabled={clearingSchedule || league.matches.length === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-900/30 border border-amber-700/40 text-amber-300 hover:bg-amber-800/50 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40"
                            >
                                {clearingSchedule ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />}
                                Clear All Matches
                            </button>
                            <button
                                onClick={deleteLeague}
                                className="flex items-center gap-2 px-4 py-2 bg-red-900/30 border border-red-700/40 text-red-400 hover:bg-red-800/50 rounded-lg text-sm font-semibold transition-colors"
                            >
                                <Trash2 size={15} /> Delete League
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex bg-slate-900/80 p-1.5 rounded-xl w-full sm:w-max border border-slate-800">
                <button
                    onClick={() => setActiveTab('table')}
                    className={`flex flex-1 justify-center sm:justify-start items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'table' ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                >
                    <LayoutList size={16} /> Standingss (Group Phase)
                </button>
                <button
                    onClick={() => setActiveTab('matches')}
                    className={`flex flex-1 justify-center sm:justify-start items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'matches' ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                >
                    <Calendar size={16} /> All Matches <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full ml-1">{league.matches.length}</span>
                </button>
            </div>

            {/* Content */}
            {activeTab === 'table' ? (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300 relative">
                    {Object.keys(groupedTableRows).sort().map((groupName) => (
                        <div key={groupName} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                            <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <h3 className="text-lg font-bold text-emerald-400">{groupName}</h3>
                                <p className="text-xs text-slate-400 font-medium">* Only showing Points from League / Group Stage matches.</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[600px] whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-widest text-slate-400">
                                            <th className="px-3 py-3 font-bold w-12 text-center align-middle">Pos</th>
                                            <th className="px-4 py-3 font-bold align-middle">Club</th>
                                            <th className="px-2 py-3 font-bold w-12 text-center align-middle" title="Matches Played">MP</th>
                                            <th className="px-2 py-3 font-bold w-12 text-center align-middle" title="Wins">W</th>
                                            <th className="px-2 py-3 font-bold w-12 text-center align-middle" title="Draws">D</th>
                                            <th className="px-2 py-3 font-bold w-12 text-center align-middle" title="Losses">L</th>
                                            <th className="px-2 py-3 font-bold w-12 text-center align-middle" title="Goals For">GF</th>
                                            <th className="px-2 py-3 font-bold w-12 text-center align-middle" title="Goals Against">GA</th>
                                            <th className="px-2 py-3 font-bold w-14 text-center align-middle" title="Goal Difference">GD</th>
                                            <th className="px-4 py-3 font-bold w-16 text-center text-emerald-400 bg-emerald-950/20 align-middle">Pts</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {groupedTableRows[groupName].length === 0 ? (
                                            <tr>
                                                <td colSpan={11} className="p-12 text-center text-slate-500 italic bg-slate-900/50 align-middle">No teams in this group yet.</td>
                                            </tr>
                                        ) : groupedTableRows[groupName].map((row, index) => (
                                            <tr key={row.id} className="border-b border-slate-800/30 hover:bg-slate-800/50 transition-colors group">
                                                <td className="px-3 py-3 text-center text-slate-400 font-medium group-hover:text-emerald-400 transition-colors align-middle">{index + 1}</td>
                                                <td className="px-4 py-3 font-bold text-white text-[15px] align-middle truncate max-w-[200px]">{row.name}</td>
                                                <td className="px-2 py-3 text-center text-slate-300 bg-slate-950/20 align-middle">{row.p}</td>
                                                <td className="px-2 py-3 text-center text-slate-300 align-middle">{row.w}</td>
                                                <td className="px-2 py-3 text-center text-slate-300 align-middle">{row.d}</td>
                                                <td className="px-2 py-3 text-center text-slate-300 align-middle">{row.l}</td>
                                                <td className="px-2 py-3 text-center text-slate-400 align-middle">{row.gf}</td>
                                                <td className="px-2 py-3 text-center text-slate-400 align-middle">{row.ga}</td>
                                                <td className={`px-2 py-3 text-center font-bold align-middle ${row.gd > 0 ? 'text-emerald-400' : row.gd < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                                                    {row.gd > 0 ? `+${row.gd}` : row.gd}
                                                </td>
                                                <td className="px-4 py-3 text-center font-black text-lg text-emerald-400 bg-emerald-950/10 group-hover:bg-emerald-950/30 transition-colors align-middle">{row.pts}</td>
                                                {isAdmin && (
                                                    <td className="px-2 py-3 text-center align-middle">
                                                        <button onClick={() => deleteTeam(row.id)} title="Delete team" className="text-red-500/60 hover:text-red-400 transition-colors">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                    {league.matches.length === 0 ? (
                        <div className="text-center p-16 bg-slate-900 border border-slate-800 rounded-xl shadow-inner">
                            <Calendar size={56} className="mx-auto text-slate-700 mb-5" />
                            <h3 className="text-2xl font-bold text-slate-300">No matches scheduled</h3>
                            {isAdmin && <p className="text-slate-500 mt-2">Generate fixtures using the schedule panel above.</p>}
                        </div>
                    ) : (
                        Object.keys(groupedMatches).map(stage => (
                            <div key={stage} className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden p-5">
                                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800">
                                    <div className="bg-indigo-500/10 p-2 rounded-lg"><Trophy size={18} className="text-indigo-400" /></div>
                                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">{stage}</h2>
                                    <span className="text-xs font-bold text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 ml-auto">{groupedMatches[stage].length} Matches</span>
                                </div>
                                <div className="grid lg:grid-cols-2 gap-4">
                                    {groupedMatches[stage].map((match: any) => (
                                        <MatchCard
                                            key={match.id}
                                            match={match}
                                            isAdmin={isAdmin}
                                            onUpdate={updateMatch}
                                            onDelete={deleteMatch}
                                            onReset={resetMatch}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )
            }
            <ToastContainer messages={toasts} removeToast={removeToast} />
            <Modal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                title={modalConfig.title}
                type={modalConfig.type}
                confirmLabel={modalConfig.confirmLabel}
                onConfirm={modalConfig.onConfirm}
                loading={modalConfig.loading}
            >
                {modalConfig.children}
            </Modal>
        </div >
    );
}

// Subcomponent for Match Card
function MatchCard({ match, isAdmin, onUpdate, onDelete, onReset }: { match: any, isAdmin: boolean, onUpdate: (id: string, hg: number, ag: number) => void, onDelete: (id: string) => void, onReset: (id: string) => void }) {
    const [editing, setEditing] = useState(false);
    const [homeGoals, setHomeGoals] = useState(match.homeGoals?.toString() || '0');
    const [awayGoals, setAwayGoals] = useState(match.awayGoals?.toString() || '0');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await onUpdate(match.id, parseInt(homeGoals), parseInt(awayGoals));
        setSaving(false);
        setEditing(false);
    };

    const isFinished = match.status === 'FINISHED';
    const homeWinner = isFinished && match.homeGoals > match.awayGoals;
    const awayWinner = isFinished && match.awayGoals > match.homeGoals;

    return (
        <div className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md ${isFinished ? 'border-slate-800 hover:border-slate-700/80 bg-slate-900/80' : 'border-slate-700/50 hover:border-emerald-500/30'}`}>
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800/50">
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full ${isFinished ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'}`}>
                    {isFinished ? 'Full Time' : 'Upcoming'}
                </span>
                {isAdmin && !editing && (
                    <div className="flex items-center gap-1.5">
                        {isFinished && (
                            <button onClick={() => onReset(match.id)} title="Reset result" className="text-xs text-amber-400 hover:text-amber-300 font-semibold px-2 py-1.5 rounded-md hover:bg-amber-500/10 transition-colors">
                                <RotateCcw size={13} />
                            </button>
                        )}
                        <button
                            onClick={() => setEditing(true)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-3 py-1.5 rounded-md hover:bg-indigo-500/10 transition-colors"
                        >
                            Edit Result
                        </button>
                        <button onClick={() => onDelete(match.id)} title="Delete match" className="text-red-500/60 hover:text-red-400 px-2 py-1.5 rounded-md hover:bg-red-500/10 transition-colors">
                            <Trash2 size={13} />
                        </button>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between gap-6 py-2 pb-4">
                {/* Home Team */}
                <div className={`flex-1 text-right truncate text-[15px] ${homeWinner ? 'font-bold text-white' : isFinished ? 'font-medium text-slate-400' : 'font-semibold text-slate-200'}`} title={match.homeTeam.name}>
                    {match.homeTeam.name}
                </div>

                {/* Score Area */}
                <div className="flex-shrink-0 flex items-center justify-center gap-3 bg-slate-950 rounded-xl px-5 py-3 min-w-[130px] shadow-inner ring-1 ring-slate-800/50">
                    {editing ? (
                        <>
                            <input type="number" min="0" value={homeGoals} onChange={e => setHomeGoals(e.target.value)} className="w-12 bg-slate-800 text-white text-center font-bold rounded py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
                            <span className="text-slate-500 font-bold">-</span>
                            <input type="number" min="0" value={awayGoals} onChange={e => setAwayGoals(e.target.value)} className="w-12 bg-slate-800 text-white text-center font-bold rounded py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
                        </>
                    ) : (
                        <>
                            <span className={`text-2xl font-black w-8 text-center ${homeWinner ? 'text-emerald-400' : isFinished ? 'text-white' : 'text-slate-600'}`}>{isFinished ? match.homeGoals : '-'}</span>
                            <span className="text-slate-600 font-black">:</span>
                            <span className={`text-2xl font-black w-8 text-center ${awayWinner ? 'text-emerald-400' : isFinished ? 'text-white' : 'text-slate-600'}`}>{isFinished ? match.awayGoals : '-'}</span>
                        </>
                    )}
                </div>

                {/* Away Team */}
                <div className={`flex-1 text-left truncate text-[15px] ${awayWinner ? 'font-bold text-white' : isFinished ? 'font-medium text-slate-400' : 'font-semibold text-slate-200'}`} title={match.awayTeam.name}>
                    {match.awayTeam.name}
                </div>
            </div>

            {editing && isAdmin && (
                <div className="mt-4 flex justify-end gap-2 border-t border-slate-800/80 pt-4 animate-in slide-in-from-top-2 duration-200">
                    <button
                        onClick={() => setEditing(false)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-5 py-2 rounded-lg text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Score
                    </button>
                </div>
            )}
        </div>
    );
}
