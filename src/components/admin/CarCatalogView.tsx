import React, { useEffect, useMemo, useState } from 'react';
import { Car, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { api, getToken } from '../../lib/api';
import { AdminPageSkeleton, ButtonSpinner } from '../common/AdminLoading';
import { EmptyState } from '../common/EmptyState';

type BodyType = 'hatchback' | 'sedan' | 'suv' | 'muv' | 'traveler' | 'bus' | 'commercial';

type TaxiCar = {
  id: string;
  body: BodyType;
  make: string;
  model: string;
  seats: number;
  is_active?: boolean;
};

type CarForm = {
  body: BodyType;
  make: string;
  model: string;
  seats: string;
  is_active: boolean;
};

const BODY_TYPES: { id: BodyType; label: string }[] = [
  { id: 'hatchback', label: 'Hatchback' },
  { id: 'sedan', label: 'Sedan' },
  { id: 'suv', label: 'SUV' },
  { id: 'muv', label: 'MUV / Innova class' },
  { id: 'traveler', label: 'Traveller' },
  { id: 'bus', label: 'Bus' },
  { id: 'commercial', label: 'Commercial' },
];

const field =
  'mt-1 w-full rounded-xl border border-[#EBE5D8] bg-[#FAF6EE] px-3 py-2 text-xs font-bold text-[#1C1C1C]';

function emptyForm(): CarForm {
  return { body: 'sedan', make: '', model: '', seats: '5', is_active: true };
}

function formFromCar(car: TaxiCar): CarForm {
  return {
    body: car.body,
    make: car.make,
    model: car.model,
    seats: String(car.seats || 5),
    is_active: car.is_active !== false,
  };
}

function bodyLabel(body: BodyType) {
  return BODY_TYPES.find((t) => t.id === body)?.label || body;
}

export const CarCatalogView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [bodyFilter, setBodyFilter] = useState<BodyType | ''>('');
  const [cars, setCars] = useState<TaxiCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<TaxiCar | 'new' | null>(null);
  const [form, setForm] = useState<CarForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<TaxiCar | null>(null);
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
      setCars(await api<TaxiCar[]>('/admin/taxi-cars'));
    } catch (err: any) {
      setError(err?.message || 'Could not load car catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const makes = useMemo(
    () => [...new Set(cars.map((c) => c.make))].sort((a, b) => a.localeCompare(b)),
    [cars]
  );

  const filtered = cars.filter((car) => {
    if (bodyFilter && car.body !== bodyFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${car.make} ${car.model} ${car.body}`.toLowerCase().includes(q);
  });

  const openNew = () => {
    setForm(emptyForm());
    setFormError('');
    setEditing('new');
  };

  const openEdit = (car: TaxiCar) => {
    setForm(formFromCar(car));
    setFormError('');
    setEditing(car);
  };

  const saveCar = async (e: React.FormEvent) => {
    e.preventDefault();
    const make = form.make.trim();
    const model = form.model.trim();
    const seats = Number(form.seats);
    if (!make || !model || !Number.isFinite(seats) || seats < 1) {
      setFormError('Type, make, model and seats are required.');
      return;
    }
    const payload = {
      body: form.body,
      make,
      model,
      seats,
      is_active: form.is_active,
    };
    setSaving(true);
    setFormError('');
    try {
      if (editing === 'new') {
        await api('/admin/taxi-cars', { method: 'POST', json: payload });
      } else if (editing) {
        await api(`/admin/taxi-cars/${editing.id}`, { method: 'PATCH', json: payload });
      }
      setEditing(null);
      await load();
    } catch (err: any) {
      setFormError(err?.message || 'Could not save car.');
    } finally {
      setSaving(false);
    }
  };

  const removeCar = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await api(`/admin/taxi-cars/${deleting.id}`, { method: 'DELETE' });
      setDeleting(null);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not delete car.');
      setDeleting(null);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Car className="w-6 h-6 text-[#F15A24]" />
            Car catalog
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Makes and models shown on the website. Users can only select from this list.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#F15A24] px-4 py-2.5 text-xs font-extrabold text-white"
        >
          <Plus className="w-4 h-4" /> Add car
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setBodyFilter('')}
          className={`rounded-full px-3 py-1.5 text-[11px] font-extrabold border ${
            !bodyFilter ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' : 'bg-white text-[#6B6B6B] border-[#EBE5D8]'
          }`}
        >
          All ({cars.length})
        </button>
        {BODY_TYPES.map((t) => {
          const n = cars.filter((c) => c.body === t.id).length;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setBodyFilter(t.id)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-extrabold border ${
                bodyFilter === t.id
                  ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]'
                  : 'bg-white text-[#6B6B6B] border-[#EBE5D8]'
              }`}
            >
              {t.label} ({n})
            </button>
          );
        })}
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B6B6B]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search make or model…"
          className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] text-xs font-bold"
        />
      </div>

      {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-2xl">{error}</p>}
      {loading && <AdminPageSkeleton variant="table" rows={8} />}
      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={Car}
          title="No record found"
          description={search || bodyFilter ? 'No car matches this filter.' : 'Add the first taxi car.'}
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-[#EBE5D8]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6EE] text-[10px] uppercase tracking-wider text-[#8A8478]">
              <tr>
                <th className="px-3 py-2.5 font-extrabold">Type</th>
                <th className="px-3 py-2.5 font-extrabold">Make</th>
                <th className="px-3 py-2.5 font-extrabold">Model</th>
                <th className="px-3 py-2.5 font-extrabold">Seats</th>
                <th className="px-3 py-2.5 font-extrabold">Status</th>
                <th className="px-3 py-2.5 font-extrabold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((car) => (
                <tr key={car.id} className="border-t border-[#EBE5D8]">
                  <td className="px-3 py-2.5 font-bold text-[#6B6B6B]">{bodyLabel(car.body)}</td>
                  <td className="px-3 py-2.5 font-extrabold">{car.make}</td>
                  <td className="px-3 py-2.5 font-extrabold">{car.model}</td>
                  <td className="px-3 py-2.5 font-bold">{car.seats}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                        car.is_active === false
                          ? 'bg-white text-[#8A8478] border border-[#EBE5D8]'
                          : 'bg-[#EBF7EE] text-[#00A86B]'
                      }`}
                    >
                      {car.is_active === false ? 'Hidden' : 'Live'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(car)}
                        className="inline-flex items-center gap-1 rounded-xl border border-[#EBE5D8] bg-white px-2.5 py-1.5 text-[11px] font-extrabold hover:border-[#F15A24] hover:text-[#F15A24]"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(car)}
                        className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-extrabold text-red-600 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4">
          <form onSubmit={saveCar} className="w-full max-w-md space-y-3 rounded-3xl bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold">
                {editing === 'new' ? 'Add car' : `Edit ${editing.make} ${editing.model}`}
              </h3>
              <button type="button" onClick={() => setEditing(null)} className="rounded-xl bg-[#FAF6EE] p-2">
                <X className="h-4 w-4" />
              </button>
            </div>
            {formError && <p className="rounded-xl bg-red-50 p-2.5 text-xs font-bold text-red-600">{formError}</p>}
            <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
              Type
              <select
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value as BodyType })}
                className={field}
              >
                {BODY_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
                Make
                <input
                  value={form.make}
                  onChange={(e) => setForm({ ...form, make: e.target.value })}
                  list="rb-catalog-makes"
                  placeholder="e.g. Maruti Suzuki"
                  className={field}
                />
                <datalist id="rb-catalog-makes">
                  {makes.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </label>
              <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
                Model
                <input
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  placeholder="e.g. Dzire"
                  className={field}
                />
              </label>
            </div>
            <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
              Seats
              <input
                type="number"
                min={1}
                max={20}
                value={form.seats}
                onChange={(e) => setForm({ ...form, seats: e.target.value })}
                className={field}
              />
            </label>
            <label className="flex items-center gap-2 text-xs font-extrabold text-[#1C1C1C]">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Show on website
            </label>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-[#F15A24] py-2.5 text-xs font-extrabold text-white disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {saving && <ButtonSpinner />}
              {editing === 'new' ? 'Add to catalog' : 'Save changes'}
            </button>
          </form>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-sm space-y-3 rounded-3xl bg-white p-5">
            <h3 className="text-sm font-extrabold">Delete {deleting.make} {deleting.model}?</h3>
            <p className="text-xs text-[#6B6B6B]">
              It will disappear from add-car and tour desired-car dropdowns.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="flex-1 rounded-2xl border border-[#EBE5D8] py-2.5 text-xs font-extrabold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={removing}
                onClick={removeCar}
                className="flex-1 rounded-2xl bg-red-600 py-2.5 text-xs font-extrabold text-white disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {removing && <ButtonSpinner />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
