import React, { useEffect, useMemo, useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Tag,
  Users,
  Car,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { api, getToken } from '../../lib/api';
import { AdminPageSkeleton, ButtonSpinner } from '../common/AdminLoading';
import { EmptyState } from '../common/EmptyState';

export type CarType = {
  id: string;
  label: string;
  seats: number;
  description?: string | null;
  display_order?: number;
  is_active?: boolean;
  car_count?: number;
};

type CarTypeForm = {
  id: string;
  label: string;
  seats: string;
  description: string;
  display_order: string;
  is_active: boolean;
};

const fieldClass =
  'mt-1 w-full rounded-xl border border-[#EBE5D8] bg-[#FAF6EE] px-3.5 py-2.5 text-xs font-bold text-[#1C1C1C] focus:outline-none focus:border-[#F15A24] focus:bg-white transition-all';

function emptyTypeForm(): CarTypeForm {
  return {
    id: '',
    label: '',
    seats: '5',
    description: '',
    display_order: '0',
    is_active: true,
  };
}

function formFromType(type: CarType): CarTypeForm {
  return {
    id: type.id,
    label: type.label,
    seats: String(type.seats || 5),
    description: type.description || '',
    display_order: String(type.display_order || 0),
    is_active: type.is_active !== false,
  };
}

interface CarTypesViewProps {
  onNavigateCatalog?: () => void;
}

export const CarTypesView: React.FC<CarTypesViewProps> = ({ onNavigateCatalog }) => {
  const [types, setTypes] = useState<CarType[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [editing, setEditing] = useState<CarType | 'new' | null>(null);
  const [form, setForm] = useState<CarTypeForm>(emptyTypeForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleting, setDeleting] = useState<CarType | null>(null);
  const [removing, setRemoving] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const load = async () => {
    if (!getToken()) {
      setError('Login as admin: 9999999999 / OTP 4829.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api<CarType[]>('/admin/car-types');
      setTypes(data || []);
    } catch (err: any) {
      setError(err?.message || 'Could not load vehicle types.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setForm(emptyTypeForm());
    setFormError('');
    setEditing('new');
  };

  const openEdit = (t: CarType) => {
    setForm(formFromType(t));
    setFormError('');
    setEditing(t);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = form.id.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '');
    const label = form.label.trim();
    const seats = Number(form.seats);
    const display_order = Number(form.display_order) || 0;

    if (!id || !label) {
      setFormError('Type ID and Display Label are required.');
      return;
    }
    if (!Number.isFinite(seats) || seats < 1 || seats > 70) {
      setFormError('Default seats must be between 1 and 70.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      if (editing === 'new') {
        await api('/admin/car-types', {
          method: 'POST',
          json: {
            id,
            label,
            seats,
            description: form.description.trim() || null,
            display_order,
            is_active: form.is_active,
          },
        });
      } else if (editing) {
        await api(`/admin/car-types/${editing.id}`, {
          method: 'PATCH',
          json: {
            label,
            seats,
            description: form.description.trim() || null,
            display_order,
            is_active: form.is_active,
          },
        });
      }
      setEditing(null);
      await load();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save vehicle type.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setRemoving(true);
    setDeleteError('');
    try {
      await api(`/admin/car-types/${deleting.id}`, { method: 'DELETE' });
      setDeleting(null);
      await load();
    } catch (err: any) {
      setDeleteError(err?.message || 'Could not delete type.');
    } finally {
      setRemoving(false);
    }
  };

  const filtered = useMemo(() => {
    return types.filter((t) => {
      const active = t.is_active !== false;
      if (statusFilter === 'active' && !active) return false;
      if (statusFilter === 'inactive' && active) return false;

      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        t.id.toLowerCase().includes(q) ||
        t.label.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
      );
    });
  }, [types, search, statusFilter]);

  const activeCount = types.filter((t) => t.is_active !== false).length;
  const totalCars = types.reduce((sum, t) => sum + (Number(t.car_count) || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2 text-[#1C1C1C]">
            <div className="w-9 h-9 rounded-2xl bg-[#FFF0EB] border border-[#FFD8CB] flex items-center justify-center text-[#F15A24] shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <span>Car Types & Body Categories</span>
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Manage body types (e.g. Hatchback, Sedan, SUV, EV). Used across car catalog, driver vehicles, and tour search.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onNavigateCatalog && (
            <button
              type="button"
              onClick={onNavigateCatalog}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-[#EBE5D8] text-xs font-bold text-[#1C1C1C] hover:bg-[#FAF6EE] shadow-2xs transition active-press"
            >
              <Car className="w-4 h-4 text-[#F15A24]" />
              <span>Go to Car Catalog</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#6B6B6B]" />
            </button>
          )}

          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-[#F15A24] hover:bg-[#E04F1D] px-4 py-2.5 text-xs font-extrabold text-white shadow-md transition active-press"
          >
            <Plus className="w-4 h-4" /> Add Car Type
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-white border border-[#EBE5D8] space-y-1 shadow-2xs">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A8478]">Total Types</p>
          <p className="text-2xl font-black text-[#1C1C1C]">{types.length}</p>
          <p className="text-[10px] font-bold text-[#6B6B6B]">Categories defined</p>
        </div>
        <div className="p-4 rounded-3xl bg-[#EBF7EE] border border-[#BDE8C7] space-y-1 shadow-2xs">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#00A86B]">Active on Web</p>
          <p className="text-2xl font-black text-[#00A86B]">{activeCount}</p>
          <p className="text-[10px] font-bold text-[#00A86B]">Shown to users</p>
        </div>
        <div className="p-4 rounded-3xl bg-white border border-[#EBE5D8] space-y-1 shadow-2xs">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A8478]">Hidden Types</p>
          <p className="text-2xl font-black text-[#6B6B6B]">{types.length - activeCount}</p>
          <p className="text-[10px] font-bold text-[#6B6B6B]">Inactive</p>
        </div>
        <div className="p-4 rounded-3xl bg-[#FFF8F4] border border-[#FFD8CB] space-y-1 shadow-2xs">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#F15A24]">Catalog Models</p>
          <p className="text-2xl font-black text-[#F15A24]">{totalCars}</p>
          <p className="text-[10px] font-bold text-[#F15A24]">Total cars mapped</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#6B6B6B]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search type name, key code (e.g. suv, sedan), description…"
            className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] text-xs font-bold focus:outline-none focus:border-[#F15A24] focus:bg-white transition"
          />
        </div>
        <div className="flex flex-wrap gap-1 bg-[#FAF6EE] p-1 rounded-2xl border border-[#EBE5D8]">
          {(['all', 'active', 'inactive'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition ${
                statusFilter === key
                  ? 'bg-[#1C1C1C] text-white shadow-xs'
                  : 'text-[#6B6B6B] hover:text-[#1C1C1C]'
              }`}
            >
              {key === 'inactive' ? 'Hidden' : key}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && <AdminPageSkeleton variant="table" rows={6} />}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={Layers}
          title="No car types found"
          description={
            search
              ? 'No vehicle type matches this search query.'
              : 'No car types created yet. Click "+ Add Car Type" to create one.'
          }
        />
      )}

      {/* Data Table */}
      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-3xl border border-[#EBE5D8] bg-white shadow-sm">
          <table className="w-full text-left text-xs border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-[#EBE5D8] text-[#6B6B6B] uppercase font-bold text-[10px] tracking-wider bg-[#FAF6EE]/50">
                <th className="py-3.5 px-4">Type Key / Code</th>
                <th className="py-3.5 px-4">Display Label</th>
                <th className="py-3.5 px-4">Default Seats</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 text-center">Catalog Cars</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE1]">
              {filtered.map((type) => {
                const isActive = type.is_active !== false;
                const carsCount = Number(type.car_count || 0);

                return (
                  <tr key={type.id} className="hover:bg-[#FFFDF9] transition-colors">
                    {/* Key Code */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono font-extrabold bg-[#FAF6EE] border border-[#EBE5D8] text-[#1C1C1C] shadow-2xs">
                        <Tag className="w-3 h-3 text-[#F15A24]" />
                        {type.id}
                      </span>
                    </td>

                    {/* Label */}
                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-[#1C1C1C] text-sm">{type.label}</p>
                    </td>

                    {/* Default Seats */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-white border border-[#EBE5D8] text-[#1C1C1C]">
                        <Users className="w-3.5 h-3.5 text-[#F15A24]" />
                        <span>{type.seats} seats</span>
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 max-w-[280px]">
                      <p className="text-[11px] text-[#6B6B6B] line-clamp-2">
                        {type.description || '—'}
                      </p>
                    </td>

                    {/* Car count */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#FFF0EB] text-[#F15A24] border border-[#FFD8CB]">
                        <Car className="w-3 h-3" />
                        <span>{carsCount} cars</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          isActive
                            ? 'bg-[#EBF7EE] text-[#00A86B] border-[#BDE8C7]'
                            : 'bg-[#FAF6EE] text-[#8A8478] border-[#EBE5D8]'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00A86B] animate-pulse"></span>
                            <span>Active</span>
                          </>
                        ) : (
                          <span>Hidden</span>
                        )}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(type)}
                          title="Edit vehicle type"
                          className="p-2 rounded-xl text-[#6B6B6B] hover:text-[#1C1C1C] hover:bg-[#FAF6EE] transition active-press"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError('');
                            setDeleting(type);
                          }}
                          title="Delete vehicle type"
                          className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition active-press"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[#EBE5D8] shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between border-b border-[#EBE5D8] px-6 py-4 bg-[#FAF6EE]/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF0EB] text-[#F15A24] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-[#1C1C1C]">
                  {editing === 'new' ? 'Add New Car Type' : `Edit '${editing.label}'`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="p-1.5 rounded-xl text-[#6B6B6B] hover:text-[#1C1C1C] hover:bg-[#FAF6EE] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* ID Key (disabled on edit) */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#8A8478]">
                  Type Code / ID *
                </label>
                <input
                  value={form.id}
                  disabled={editing !== 'new'}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  placeholder="e.g. sedan, suv, ev_sedan, luxury"
                  className={`${fieldClass} font-mono ${editing !== 'new' ? 'opacity-60 cursor-not-allowed' : ''}`}
                  required
                />
                <p className="text-[10px] text-[#8A8478] mt-1">
                  Unique internal key used in databases (lowercase, letters and underscores).
                </p>
              </div>

              {/* Display Label */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#8A8478]">
                  Display Label *
                </label>
                <input
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="e.g. Sedan, SUV, Electric Vehicle, Bus"
                  className={fieldClass}
                  required
                />
              </div>

              {/* Seats and Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#8A8478]">
                    Default Seats *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={70}
                    value={form.seats}
                    onChange={(e) => setForm({ ...form, seats: e.target.value })}
                    className={fieldClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#8A8478]">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: e.target.value })}
                    className={fieldClass}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#8A8478]">
                  Description (Optional)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className={fieldClass}
                  placeholder="Common models or use case (e.g. 4+1 seater with trunk luggage space for city & outstation trips)"
                />
              </div>

              {/* Active Toggle */}
              <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-[#F15A24] focus:ring-[#F15A24] accent-[#F15A24]"
                />
                <span className="text-xs font-bold text-[#1C1C1C]">
                  Active on Website & Booking Filters
                </span>
              </label>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#EBE5D8] bg-[#FAF6EE] text-xs font-bold text-[#6B6B6B] hover:text-[#1C1C1C] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#F15A24] hover:bg-[#E04F1D] text-xs font-extrabold text-white shadow-sm flex items-center gap-1.5 transition disabled:opacity-60 active-press"
                >
                  {saving ? (
                    <>
                      <ButtonSpinner />
                      <span>Saving...</span>
                    </>
                  ) : editing === 'new' ? (
                    'Create Car Type'
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#EBE5D8] shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#1C1C1C]">
                  Delete type &apos;{deleting.label}&apos;?
                </h3>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  ID: <span className="font-mono font-bold text-[#1C1C1C]">{deleting.id}</span>
                </p>
              </div>
            </div>

            {Number(deleting.car_count || 0) > 0 ? (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Cannot delete this type while in use</span>
                </p>
                <p>
                  There are currently <strong>{deleting.car_count} cars</strong> in the catalog assigned to &apos;{deleting.label}&apos;.
                  Please reassign or delete those cars first, or toggle this type to <strong>Hidden</strong> instead.
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                Are you sure you want to delete this vehicle type? This action cannot be undone.
              </p>
            )}

            {deleteError && (
              <p className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600">
                {deleteError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="px-4 py-2.5 rounded-xl border border-[#EBE5D8] bg-[#FAF6EE] text-xs font-bold text-[#6B6B6B] hover:text-[#1C1C1C] transition"
              >
                Cancel
              </button>
              {Number(deleting.car_count || 0) === 0 && (
                <button
                  type="button"
                  disabled={removing}
                  onClick={handleDelete}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-extrabold text-white shadow-sm flex items-center gap-1.5 transition disabled:opacity-60 active-press"
                >
                  {removing ? (
                    <>
                      <ButtonSpinner />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    'Delete Type'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
