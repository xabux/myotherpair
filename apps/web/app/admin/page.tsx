'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// ─── Design tokens (match app dashboard) ─────────────────────────────────────

const BG      = 'var(--app-bg)';
const SURFACE = 'var(--app-surface)';
const ACCENT  = '#e63946';
const BORDER  = 'var(--app-border)';

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminTab = 'overview' | 'users' | 'listings' | 'matches';

interface UserRow {
  id: string;
  name: string;
  email: string;
  created_at: string;
  listing_count: number;
  match_count: number;
}

interface ListingRow {
  id: string;
  user_id: string;
  shoe_brand: string;
  shoe_model: string;
  size: string;
  foot_side: string;
  condition: string;
  status: string;
  created_at: string;
  owner_email?: string;
}

interface MatchRow {
  id: string;
  user_id_1: string;
  user_id_2: string;
  status: string;
  created_at: string;
  user1_email?: string;
  user2_email?: string;
  listing1_brand?: string;
  listing1_model?: string;
  listing2_brand?: string;
  listing2_model?: string;
}

// ─── Shared chart options ─────────────────────────────────────────────────────

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1c1c24', titleColor: '#fff', bodyColor: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.07)', borderWidth: 1 } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 11 } } },
  },
};

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-1" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
      <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--app-text-muted)' }}>{label}</p>
      <p className="text-3xl font-extrabold text-white font-syne">{value}</p>
      {sub && <p className="text-xs" style={{ color: 'var(--app-text-faint)' }}>{sub}</p>}
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const [stats, setStats]       = useState({ users: 0, listings: 0, matches: 0, completed: 0, newUsers: 0 });
  const [signups, setSignups]   = useState<{ date: string; count: number }[]>([]);
  const [brands, setBrands]     = useState<{ brand: string; count: number }[]>([]);
  const [sizes, setSizes]       = useState<{ size: string; count: number }[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      const [
        { count: users },
        { count: listings },
        { count: matches },
        { count: completed },
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('matches').select('*', { count: 'exact', head: true }),
        supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      ]);

      // New signups last 7 days
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: newUsers } = await supabase
        .from('users').select('*', { count: 'exact', head: true }).gte('created_at', since);

      setStats({ users: users ?? 0, listings: listings ?? 0, matches: matches ?? 0, completed: completed ?? 0, newUsers: newUsers ?? 0 });

      // Signups per day last 7 days
      const { data: signupData } = await supabase
        .from('users').select('created_at').gte('created_at', since).order('created_at');
      const byDay: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        byDay[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0;
      }
      for (const row of (signupData ?? []) as { created_at: string }[]) {
        const key = new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (key in byDay) byDay[key]++;
      }
      setSignups(Object.entries(byDay).map(([date, count]) => ({ date, count })));

      // Top brands
      const { data: listingData } = await supabase.from('listings').select('shoe_brand, size').eq('status', 'active');
      const brandMap: Record<string, number> = {};
      for (const r of (listingData ?? []) as { shoe_brand: string }[]) {
        brandMap[r.shoe_brand] = (brandMap[r.shoe_brand] ?? 0) + 1;
      }
      setBrands(Object.entries(brandMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([brand, count]) => ({ brand, count })));

      // Top sizes
      const sizeMap: Record<string, number> = {};
      for (const r of (listingData ?? []) as { shoe_brand: string; size?: string }[]) {
        const s = String((r as Record<string, unknown>).size ?? '');
        if (s) sizeMap[s] = (sizeMap[s] ?? 0) + 1;
      }
      setSizes(Object.entries(sizeMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([size, count]) => ({ size, count })));

      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  const signupChartData = {
    labels: signups.map(s => s.date),
    datasets: [{ data: signups.map(s => s.count), fill: true, tension: 0.4,
      borderColor: ACCENT, backgroundColor: `${ACCENT}20`, pointBackgroundColor: ACCENT }],
  };

  const brandChartData = {
    labels: brands.map(b => b.brand),
    datasets: [{ data: brands.map(b => b.count),
      backgroundColor: `${ACCENT}cc`, borderColor: ACCENT, borderWidth: 1, borderRadius: 6 }],
  };

  const sizeChartData = {
    labels: sizes.map(s => s.size),
    datasets: [{ data: sizes.map(s => s.count),
      backgroundColor: 'rgba(99,179,237,0.8)', borderColor: 'rgb(99,179,237)', borderWidth: 1, borderRadius: 6 }],
  };

  return (
    <div className="p-6 space-y-6">
      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total Users"    value={stats.users}     />
        <StatCard label="Active Listings" value={stats.listings}  />
        <StatCard label="Total Matches"  value={stats.matches}   />
        <StatCard label="Swaps Completed" value={stats.completed} />
        <StatCard label="New (7 days)"   value={stats.newUsers}  />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Signups sparkline */}
        <div className="lg:col-span-1 rounded-2xl p-5" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <p className="text-sm font-bold text-white mb-4 font-syne">New signups — last 7 days</p>
          <div className="h-40">
            <Line data={signupChartData} options={{ ...chartDefaults, scales: { ...chartDefaults.scales, x: { ...chartDefaults.scales.x, ticks: { ...chartDefaults.scales.x.ticks, maxTicksLimit: 4 } } } }} />
          </div>
        </div>

        {/* Most listed brands */}
        <div className="rounded-2xl p-5" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <p className="text-sm font-bold text-white mb-4 font-syne">Most listed brands</p>
          <div className="h-40">
            <Bar data={brandChartData} options={chartDefaults} />
          </div>
        </div>

        {/* Most common sizes */}
        <div className="rounded-2xl p-5" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <p className="text-sm font-bold text-white mb-4 font-syne">Most common sizes</p>
          <div className="h-40">
            <Bar data={sizeChartData} options={chartDefaults} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Users tab ────────────────────────────────────────────────────────────────

function UsersTab() {
  const [users,   setUsers]   = useState<UserRow[]>([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(0);
  const [selected, setSelected] = useState<UserRow | null>(null);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (data) {
      const rows = await Promise.all((data as Omit<UserRow, 'listing_count' | 'match_count'>[]).map(async u => {
        const [{ count: lc }, { count: mc }] = await Promise.all([
          supabase.from('listings').select('*', { count: 'exact', head: true }).eq('user_id', u.id).eq('status', 'active'),
          supabase.from('matches').select('*', { count: 'exact', head: true }).or(`user_id_1.eq.${u.id},user_id_2.eq.${u.id}`),
        ]);
        return { ...u, listing_count: lc ?? 0, match_count: mc ?? 0 };
      }));
      setUsers(rows);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u =>
    !search || `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  async function deleteUser(id: string) {
    if (!confirm('Delete this user and all their data?')) return;
    await supabase.from('users').delete().eq('id', id);
    await supabase.auth.admin?.deleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
    setSelected(null);
  }

  if (selected) {
    return <UserDetail user={selected} onBack={() => setSelected(null)} onDelete={deleteUser} />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-5">
        <h2 className="text-lg font-bold text-white font-syne">Users</h2>
        <div className="flex-1 max-w-xs relative">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full bg-white/5 border text-sm text-white placeholder-white/25 px-4 py-2.5 rounded-2xl outline-none focus:border-red-400 transition-colors font-dmsans"
            style={{ borderColor: BORDER }} />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
                  {['Name', 'Email', 'Joined', 'Listings', 'Matches', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--app-text-faint)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} className="cursor-pointer hover:bg-white/[0.03] transition-colors"
                    style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : undefined }}
                    onClick={() => setSelected(u)}>
                    <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--app-text-muted)' }}>{u.email}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--app-text-faint)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center text-white">{u.listing_count}</td>
                    <td className="px-4 py-3 text-center text-white">{u.match_count}</td>
                    <td className="px-4 py-3">
                      <button className="text-xs text-red-400 hover:text-red-300 transition-colors" onClick={e => { e.stopPropagation(); deleteUser(u.id); }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              className="text-xs font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-30"
              style={{ background: SURFACE, border: `1px solid ${BORDER}`, color: 'var(--app-text-muted)' }}>
              Previous
            </button>
            <span className="text-xs" style={{ color: 'var(--app-text-faint)' }}>Page {page + 1}</span>
            <button disabled={filtered.length < PAGE_SIZE} onClick={() => setPage(p => p + 1)}
              className="text-xs font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-30"
              style={{ background: SURFACE, border: `1px solid ${BORDER}`, color: 'var(--app-text-muted)' }}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function UserDetail({ user, onBack, onDelete }: { user: UserRow; onBack: () => void; onDelete: (id: string) => void }) {
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [matches,  setMatches]  = useState<MatchRow[]>([]);

  useEffect(() => {
    supabase.from('listings').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => setListings((data ?? []) as ListingRow[]));
    supabase.from('matches').select('*').or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`).order('created_at', { ascending: false })
      .then(({ data }) => setMatches((data ?? []) as MatchRow[]));
  }, [user.id]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-white/50 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-lg font-bold text-white font-syne">{user.name}</h2>
        <span className="text-sm" style={{ color: 'var(--app-text-muted)' }}>{user.email}</span>
        <button onClick={() => onDelete(user.id)} className="ml-auto text-xs text-red-400 border border-red-400/30 px-3 py-1.5 rounded-xl hover:bg-red-400/10 transition-all">Delete user</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Joined" value={new Date(user.created_at).toLocaleDateString()} />
        <StatCard label="Listings" value={user.listing_count} />
        <StatCard label="Matches"  value={user.match_count} />
      </div>

      <div className="rounded-2xl p-5" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
        <p className="text-sm font-bold text-white mb-3 font-syne">Listings</p>
        {listings.length === 0 ? <p className="text-sm" style={{ color: 'var(--app-text-faint)' }}>No listings.</p> : (
          <div className="space-y-2">
            {listings.map(l => (
              <div key={l.id} className="flex items-center justify-between text-sm">
                <span className="text-white">{l.shoe_brand} {l.shoe_model} — US {l.size} ({l.foot_side})</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${l.status === 'active' ? 'text-green-400 bg-green-400/10' : 'text-white/30 bg-white/5'}`}>{l.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl p-5" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
        <p className="text-sm font-bold text-white mb-3 font-syne">Match history</p>
        {matches.length === 0 ? <p className="text-sm" style={{ color: 'var(--app-text-faint)' }}>No matches.</p> : (
          <div className="space-y-2">
            {matches.map(m => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <span className="text-white/70">Match {m.id.slice(0, 8)}…</span>
                <span className="text-xs text-white/40">{new Date(m.created_at).toLocaleDateString()}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === 'completed' ? 'text-green-400 bg-green-400/10' : 'text-blue-300 bg-blue-400/10'}`}>{m.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Listings tab ─────────────────────────────────────────────────────────────

function AdminListingsTab() {
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filters, setFilters] = useState({ brand: '', condition: '', foot: '', active: 'all' });

  useEffect(() => {
    (async () => {
      setLoading(true);
      let q = supabase.from('listings').select('*, users!listings_user_id_fkey(email)').order('created_at', { ascending: false });
      if (filters.brand)     q = q.eq('shoe_brand', filters.brand);
      if (filters.condition) q = q.eq('condition', filters.condition);
      if (filters.foot)      q = q.eq('foot_side', filters.foot);
      if (filters.active !== 'all') q = q.eq('status', filters.active === 'active' ? 'active' : 'sold');
      const { data } = await q;
      if (data) {
        setListings((data as unknown as (ListingRow & { users?: { email?: string } })[]).map(r => ({
          ...r,
          owner_email: r.users?.email,
        })));
      }
      setLoading(false);
    })();
  }, [filters]);

  async function toggleActive(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'sold' : 'active';
    await supabase.from('listings').update({ status: newStatus }).eq('id', id);
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
  }

  async function deleteListing(id: string) {
    if (!confirm('Delete this listing?')) return;
    await supabase.from('listings').delete().eq('id', id);
    setListings(prev => prev.filter(l => l.id !== id));
  }

  const inputCls = 'bg-white/5 border text-xs text-white placeholder-white/25 px-3 py-2 rounded-xl outline-none focus:border-red-400 transition-colors font-dmsans';

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h2 className="text-lg font-bold text-white font-syne">Listings</h2>
        <select value={filters.brand} onChange={e => setFilters(f => ({ ...f, brand: e.target.value }))}
          className={inputCls + ' appearance-none'} style={{ borderColor: BORDER }}>
          <option value="">All brands</option>
          {['Nike','Adidas','Jordan','New Balance','Vans','Converse','Puma','Reebok'].map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={filters.condition} onChange={e => setFilters(f => ({ ...f, condition: e.target.value }))}
          className={inputCls + ' appearance-none'} style={{ borderColor: BORDER }}>
          <option value="">All conditions</option>
          {['New','Like New','Good','Fair','Poor'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.foot} onChange={e => setFilters(f => ({ ...f, foot: e.target.value }))}
          className={inputCls + ' appearance-none'} style={{ borderColor: BORDER }}>
          <option value="">Both sides</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
        <select value={filters.active} onChange={e => setFilters(f => ({ ...f, active: e.target.value }))}
          className={inputCls + ' appearance-none'} style={{ borderColor: BORDER }}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
                {['Brand / Model', 'Size', 'Foot', 'Condition', 'Owner', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--app-text-faint)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listings.map((l, i) => (
                <tr key={l.id} style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : undefined }}>
                  <td className="px-4 py-3 font-medium text-white">{l.shoe_brand} {l.shoe_model}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--app-text-muted)' }}>US {l.size}</td>
                  <td className="px-4 py-3 capitalize" style={{ color: 'var(--app-text-muted)' }}>{l.foot_side}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--app-text-muted)' }}>{l.condition}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--app-text-faint)' }}>{l.owner_email ?? l.user_id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${l.status === 'active' ? 'text-green-400 bg-green-400/10' : 'text-white/30 bg-white/5'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleActive(l.id, l.status)}
                        className="text-xs" style={{ color: 'var(--app-text-muted)' }}>
                        {l.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => deleteListing(l.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Matches tab ──────────────────────────────────────────────────────────────

function AdminMatchesTab() {
  const [matches,  setMatches]  = useState<MatchRow[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('matches')
        .select(`
          id, status, created_at, user_id_1, user_id_2,
          p1:user_id_1(email),
          p2:user_id_2(email),
          l1:listing_id_1(shoe_brand, shoe_model),
          l2:listing_id_2(shoe_brand, shoe_model)
        `)
        .order('created_at', { ascending: false });

      if (data) {
        setMatches((data as Record<string, unknown>[]).map(r => ({
          id:              r.id as string,
          user_id_1:       r.user_id_1 as string,
          user_id_2:       r.user_id_2 as string,
          status:          r.status as string,
          created_at:      r.created_at as string,
          user1_email:     (r.p1 as { email?: string } | null)?.email,
          user2_email:     (r.p2 as { email?: string } | null)?.email,
          listing1_brand:  (r.l1 as { shoe_brand?: string } | null)?.shoe_brand,
          listing1_model:  (r.l1 as { shoe_model?: string } | null)?.shoe_model,
          listing2_brand:  (r.l2 as { shoe_brand?: string } | null)?.shoe_brand,
          listing2_model:  (r.l2 as { shoe_model?: string } | null)?.shoe_model,
        })));
      }
      setLoading(false);
    })();
  }, []);

  async function markCompleted(id: string) {
    await supabase.from('matches').update({ status: 'completed' }).eq('id', id);
    setMatches(prev => prev.map(m => m.id === id ? { ...m, status: 'completed' } : m));
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold text-white font-syne mb-5">Matches</h2>

      {loading ? <LoadingSpinner /> : (
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
                {['User 1', 'Their shoe', 'User 2', 'Their shoe', 'Date', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--app-text-faint)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matches.map((m, i) => (
                <tr key={m.id} style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : undefined }}>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--app-text-muted)' }}>{m.user1_email ?? m.user_id_1.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-white">{m.listing1_brand} {m.listing1_model}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--app-text-muted)' }}>{m.user2_email ?? m.user_id_2.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-white">{m.listing2_brand} {m.listing2_model}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--app-text-faint)' }}>{new Date(m.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === 'completed' ? 'text-green-400 bg-green-400/10' : m.status === 'confirmed' ? 'text-blue-300 bg-blue-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {m.status !== 'completed' && (
                      <button onClick={() => markCompleted(m.id)} className="text-xs text-green-400 hover:text-green-300 transition-colors">Mark completed</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24" style={{ color: ACCENT }}>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

// ─── Main admin page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [tab,       setTab]       = useState<AdminTab>('overview');
  const [checking,  setChecking]  = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/'); return; }

      const { data } = await supabase
        .from('admins')
        .select('email')
        .eq('email', session.user.email ?? '')
        .single();

      if (!data) { router.replace('/'); return; }

      setAuthorized(true);
      setChecking(false);
    })();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24" style={{ color: ACCENT }}>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!authorized) return null;

  const TABS: { id: AdminTab; label: string }[] = [
    { id: 'overview',  label: 'Overview'  },
    { id: 'users',     label: 'Users'     },
    { id: 'listings',  label: 'Listings'  },
    { id: 'matches',   label: 'Matches'   },
  ];

  return (
    <div className="min-h-screen font-dmsans" style={{ background: BG, color: 'var(--app-text)' }}>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b flex items-center justify-between px-6 h-14"
        style={{ background: SURFACE, borderColor: BORDER }}>
        <div className="flex items-center gap-6">
          <a href="/" className="text-base font-extrabold tracking-tight font-syne">
            <span className="text-white">myother</span><span style={{ color: ACCENT }}>pair</span>
            <span className="text-xs font-semibold ml-2 px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: `${ACCENT}20`, color: ACCENT }}>Admin</span>
          </a>
          <nav className="flex items-center gap-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="px-3 py-1.5 text-sm font-semibold rounded-xl transition-all"
                style={{
                  background: tab === t.id ? `${ACCENT}20` : 'transparent',
                  color:      tab === t.id ? ACCENT : 'var(--app-text-muted)',
                }}>
                {t.label}
              </button>
            ))}
          </nav>
        </div>
        <a href="/app" className="text-xs font-semibold px-4 py-2 rounded-xl transition-all"
          style={{ background: SURFACE, border: `1px solid ${BORDER}`, color: 'var(--app-text-muted)' }}>
          ← Back to app
        </a>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto">
        {tab === 'overview' && <OverviewTab />}
        {tab === 'users'    && <UsersTab />}
        {tab === 'listings' && <AdminListingsTab />}
        {tab === 'matches'  && <AdminMatchesTab />}
      </main>
    </div>
  );
}
