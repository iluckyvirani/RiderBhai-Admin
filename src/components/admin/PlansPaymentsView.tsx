import React, { useEffect, useState } from 'react';
import { CreditCard, Search, Sparkles, Pencil, Trash2, Plus, X, Check, Tag } from 'lucide-react';
import { api, getToken } from '../../lib/api';
import { formatUserId } from '../../lib/displayId';
import { AdminPageSkeleton, ButtonSpinner } from '../common/AdminLoading';
import { EmptyState } from '../common/EmptyState';

type Plan = {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  post_limit: number;
  badge_text?: string;
  benefits?: string[] | string;
  is_active?: boolean;
  popular?: boolean;
};

type Sub = {
  id: string;
  user_id?: string;
  user_display_id?: string;
  plan_name: string;
  price: number;
  duration_days: number;
  post_limit: number;
  posts_remaining: number;
  purchased_at: string;
  expires_at: string;
  user_name?: string;
  user_phone?: string;
  user_email?: string;
  payment_method?: string;
  txn_ref?: string;
};

function money(n: number) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

function when(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium' });
}

function benefitsList(raw?: Plan['benefits']): string[] {
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

type PlanForm = {
  name: string;
  price: string;
  duration_days: string;
  post_limit: string;
  badge_text: string;
  benefits: string;
  is_active: boolean;
  popular: boolean;
};

function emptyForm(): PlanForm {
  return {
    name: '',
    price: '',
    duration_days: '30',
    post_limit: '10',
    badge_text: '',
    benefits: '',
    is_active: true,
    popular: false,
  };
}

function formFromPlan(plan: Plan): PlanForm {
  return {
    name: plan.name,
    price: String(plan.price),
    duration_days: String(plan.duration_days),
    post_limit: String(plan.post_limit),
    badge_text: plan.badge_text || '',
    benefits: benefitsList(plan.benefits).join('\n'),
    is_active: plan.is_active !== false,
    popular: Boolean(plan.popular),
  };
}

export const PlansCatalogView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Plan | 'new' | null>(null);
  const [form, setForm] = useState<PlanForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<Plan | null>(null);
  const [removing, setRemoving] = useState(false);

  const load = async () => {
    if (!getToken()) {
      setError('Login as admin: 9999999999 / OTP 4829.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      setPlans(await api<Plan[]>('/admin/plans'));
    } catch (err: any) {
      setError(err?.message || 'Could not load plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setForm(emptyForm());
    setFormError('');
    setEditing('new');
  };

  const openEdit = (plan: Plan) => {
    setForm(formFromPlan(plan));
    setFormError('');
    setEditing(plan);
  };

  const savePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const price = Number(form.price);
    const duration_days = Number(form.duration_days);
    const post_limit = Number(form.post_limit);
    if (!name || !Number.isFinite(price) || price < 0 || duration_days < 1 || post_limit < 1) {
      setFormError('Name, price, days and post limit are required.');
      return;
    }
    const payload = {
      name,
      price,
      duration_days,
      post_limit,
      badge_text: form.badge_text.trim(),
      benefits: form.benefits
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      is_active: form.is_active,
      popular: form.popular,
    };
    setSaving(true);
    setFormError('');
    try {
      if (editing === 'new') {
        await api('/admin/plans', { method: 'POST', json: payload });
      } else if (editing) {
        await api(`/admin/plans/${editing.id}`, { method: 'PATCH', json: payload });
      }
      setEditing(null);
      await load();
    } catch (err: any) {
      setFormError(err?.message || 'Could not save plan.');
    } finally {
      setSaving(false);
    }
  };

  const removePlan = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await api(`/admin/plans/${deleting.id}`, { method: 'DELETE' });
      setDeleting(null);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not delete plan.');
      setDeleting(null);
    } finally {
      setRemoving(false);
    }
  };

  const q = search.toLowerCase();
  const filtered = plans.filter((plan) => !q || plan.name.toLowerCase().includes(q));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#F15A24]" />
            Plans
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-1">Plan catalog sold on the website. Add, edit or hide a plan anytime.</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#F15A24] px-4 py-2.5 text-xs font-extrabold text-white"
        >
          <Plus className="w-4 h-4" /> Add plan
        </button>
      </div>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B6B6B]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search plan name…"
          className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] text-xs font-bold"
        />
      </div>
      {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-2xl">{error}</p>}
      {loading && <AdminPageSkeleton variant="cards" rows={3} />}
      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title="No record found"
          description={search ? 'No plan matches this search.' : 'No plans yet. Add the first plan.'}
        />
      )}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((plan) => {
            const benefits = benefitsList(plan.benefits);
            const posts = Number(plan.post_limit) >= 9999 ? 'Unlimited posts' : `${plan.post_limit} posts`;
            return (
              <article
                key={plan.id}
                className={`relative rounded-3xl border p-5 space-y-3 ${
                  plan.popular ? 'border-[#F15A24] bg-[#FFF8F4]' : 'border-[#EBE5D8] bg-[#FAF6EE]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-black text-[#1C1C1C]">{plan.name}</h3>
                    {plan.badge_text && (
                      <p className="mt-0.5 text-[11px] font-extrabold text-[#F15A24]">{plan.badge_text}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {plan.popular && (
                      <span className="rounded-full bg-[#F15A24] px-2 py-0.5 text-[9px] font-extrabold uppercase text-white">
                        Popular
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                        plan.is_active === false
                          ? 'bg-white text-[#8A8478] border border-[#EBE5D8]'
                          : 'bg-[#EBF7EE] text-[#00A86B]'
                      }`}
                    >
                      {plan.is_active === false ? 'Hidden' : 'Live'}
                    </span>
                  </div>
                </div>
                <p className="text-3xl font-black text-[#F15A24]">{money(plan.price)}</p>
                <p className="text-[11px] font-extrabold text-[#6B6B6B]">
                  {plan.duration_days} days · {posts}
                </p>
                <ul className="space-y-1 min-h-[56px]">
                  {benefits.slice(0, 4).map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-[11px] font-bold text-[#1C1C1C]">
                      <Check className="w-3.5 h-3.5 text-[#00A86B] shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                  {benefits.length === 0 && <li className="text-[11px] font-bold text-[#B8B2A6]">No benefits listed</li>}
                </ul>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openEdit(plan)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-[#EBE5D8] bg-white py-2 text-[11px] font-extrabold hover:border-[#F15A24] hover:text-[#F15A24]"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(plan)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 py-2 text-[11px] font-extrabold text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4">
          <form onSubmit={savePlan} className="w-full max-w-md max-h-[90vh] overflow-y-auto space-y-3 rounded-3xl bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold">{editing === 'new' ? 'Add plan' : `Edit ${editing.name}`}</h3>
              <button type="button" onClick={() => setEditing(null)} className="rounded-xl bg-[#FAF6EE] p-2">
                <X className="h-4 w-4" />
              </button>
            </div>
            {formError && <p className="rounded-xl bg-red-50 p-2.5 text-xs font-bold text-red-600">{formError}</p>}
            <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#EBE5D8] bg-[#FAF6EE] px-3 py-2 text-xs font-bold text-[#1C1C1C]"
                placeholder="e.g. Starter Pack"
              />
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
                Price ₹
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#EBE5D8] bg-[#FAF6EE] px-3 py-2 text-xs font-bold text-[#1C1C1C]"
                />
              </label>
              <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
                Days
                <input
                  type="number"
                  min={1}
                  value={form.duration_days}
                  onChange={(e) => setForm({ ...form, duration_days: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#EBE5D8] bg-[#FAF6EE] px-3 py-2 text-xs font-bold text-[#1C1C1C]"
                />
              </label>
              <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
                Posts
                <input
                  type="number"
                  min={1}
                  value={form.post_limit}
                  onChange={(e) => setForm({ ...form, post_limit: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#EBE5D8] bg-[#FAF6EE] px-3 py-2 text-xs font-bold text-[#1C1C1C]"
                />
              </label>
            </div>
            <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
              Badge
              <input
                value={form.badge_text}
                onChange={(e) => setForm({ ...form, badge_text: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#EBE5D8] bg-[#FAF6EE] px-3 py-2 text-xs font-bold text-[#1C1C1C]"
                placeholder="e.g. Verified Partner"
              />
            </label>
            <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
              Benefits (one per line)
              <textarea
                value={form.benefits}
                onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                rows={4}
                className="mt-1 w-full rounded-xl border border-[#EBE5D8] bg-[#FAF6EE] px-3 py-2 text-xs font-bold text-[#1C1C1C]"
                placeholder={'Post up to 10 listings\nIn-app chat\nRide Bhai deal support'}
              />
            </label>
            <div className="flex gap-3 text-[11px] font-extrabold">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                Live on website
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.popular}
                  onChange={(e) => setForm({ ...form, popular: e.target.checked })}
                />
                Popular
              </label>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#F15A24] text-xs font-extrabold text-white disabled:opacity-60"
            >
              {saving ? <><ButtonSpinner /> Saving</> : editing === 'new' ? 'Create plan' : 'Save changes'}
            </button>
          </form>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md space-y-3 rounded-3xl bg-white p-5">
            <h3 className="text-sm font-extrabold">Delete {deleting.name}?</h3>
            <p className="text-xs font-medium text-[#6B6B6B]">
              This removes the plan from the catalog. Plans that already have purchases cannot be deleted — hide them instead.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={removePlan}
                disabled={removing}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 py-2.5 text-xs font-extrabold text-white disabled:opacity-60"
              >
                {removing ? <><ButtonSpinner /> Deleting</> : 'Delete plan'}
              </button>
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="flex-1 rounded-2xl bg-[#FAF6EE] py-2.5 text-xs font-extrabold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function paymentMethodLabel(method?: string) {
  if (!method) return 'UPI';
  const m = method.toLowerCase();
  if (m === 'card') return 'Card';
  if (m === 'netbanking') return 'Netbanking';
  if (m === 'wallet') return 'Wallet';
  return 'UPI';
}

export const AllPaymentsView: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'upi' | 'card'>('all');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken()) {
      setError('Login as admin: 9999999999 / OTP 4829.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    api<Sub[]>('/admin/subscriptions?filter=all')
      .then(setRows)
      .catch((err: any) => setError(err?.message || 'Could not load payments.'))
      .finally(() => setLoading(false));
  }, []);

  const q = search.toLowerCase();
  const filtered = rows.filter((row) => {
    const method = paymentMethodLabel(row.payment_method).toLowerCase();
    if (filter === 'upi' && method !== 'upi') return false;
    if (filter === 'card' && method !== 'card') return false;
    if (!q) return true;
    const uid = (row.user_display_id || formatUserId(row.user_id || row.id)).toLowerCase();
    return (
      uid.includes(q) ||
      (row.user_name || '').toLowerCase().includes(q) ||
      (row.user_phone || '').includes(search) ||
      (row.user_email || '').toLowerCase().includes(q) ||
      row.plan_name.toLowerCase().includes(q) ||
      (row.txn_ref || '').toLowerCase().includes(q)
    );
  });

  const counts = {
    all: rows.length,
    upi: rows.filter((row) => paymentMethodLabel(row.payment_method) === 'UPI').length,
    card: rows.filter((row) => paymentMethodLabel(row.payment_method) === 'Card').length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-[#F15A24]" />
          All payments
        </h2>
        <p className="text-xs text-[#6B6B6B] mt-1">
          Package purchase transaction records.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B6B6B]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search User ID (e.g. RB-US-1001), user, phone, plan, txn…"
            className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] text-xs font-bold"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {(
            [
              ['all', `All (${counts.all})`],
              ['upi', `UPI (${counts.upi})`],
              ['card', `Card (${counts.card})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`px-3 py-2 rounded-xl text-[11px] font-extrabold transition-all active-press ${
                filter === id ? 'bg-[#1C1C1C] text-white shadow-xs' : 'bg-[#FAF6EE] text-[#6B6B6B] hover:text-[#1C1C1C]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-2xl">{error}</p>}
      {loading && <AdminPageSkeleton variant="table" rows={5} />}
      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={CreditCard}
          title="No record found"
          description={
            search
              ? 'No payment matches this search.'
              : 'No plan purchase transactions recorded yet.'
          }
        />
      )}
      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-3xl border border-[#EBE5D8] bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#EBE5D8] text-[#6B6B6B] uppercase font-bold text-[10px] tracking-wider bg-[#FAF6EE]/50">
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">User ID</th>
                <th className="py-3.5 px-4">Subscriber</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Package</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE1]">
              {filtered.map((row) => {
                const method = paymentMethodLabel(row.payment_method);
                return (
                  <tr key={row.id} className="hover:bg-[#FFFDF9] transition-colors">
                    {/* Transaction ID */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono font-extrabold bg-white border border-[#EBE5D8] text-[#1C1C1C] shadow-2xs">
                        <Tag className="w-3 h-3 text-[#00A86B]" />
                        {row.txn_ref || `TXN-${(row.id || '').slice(0, 8).toUpperCase()}`}
                      </span>
                    </td>

                    {/* User ID */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono font-extrabold bg-white border border-[#EBE5D8] text-[#1C1C1C] shadow-2xs">
                        <Tag className="w-3 h-3 text-[#F15A24]" />
                        {row.user_display_id || formatUserId(row.user_id || row.id)}
                      </span>
                    </td>

                    {/* Subscriber */}
                    <td className="py-3.5 px-4 font-extrabold text-[#1C1C1C] whitespace-nowrap">
                      {row.user_name || 'Unnamed'}
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[#6B6B6B] whitespace-nowrap">
                      {row.user_phone ? `+91 ${row.user_phone}` : '—'}
                    </td>

                    {/* Package */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#FFF0EB] text-[#F15A24] border border-[#FFD8CB]">
                        <Sparkles className="w-2.5 h-2.5" />
                        {row.plan_name}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-black text-sm text-[#F15A24] whitespace-nowrap">
                      {money(row.price)}
                    </td>

                    {/* Method */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-[#FAF6EE] text-[#1C1C1C] border border-[#EBE5D8]">
                        {method}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-right text-xs text-[#6B6B6B] whitespace-nowrap font-medium">
                      {when(row.purchased_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
