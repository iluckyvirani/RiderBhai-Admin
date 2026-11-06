import React, { useEffect, useRef, useState } from 'react';
import { Building2, ImagePlus, Pencil, Plus, Search, Star, Trash2, Video, X } from 'lucide-react';
import { api, getToken } from '../../lib/api';
import { uploadToCloudinary } from '../../lib/upload';
import { AdminPageSkeleton, ButtonSpinner } from '../common/AdminLoading';
import { EmptyState } from '../common/EmptyState';

type Hotel = {
  id: string;
  title: string;
  description?: string;
  phone: string;
  address?: string;
  city: string;
  state: string;
  price_low: number;
  price_high: number;
  rating: number;
  rating_count: number;
  image_urls: string[] | string;
  video_url?: string;
  status: 'active' | 'inactive';
};

type HotelForm = {
  title: string;
  description: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  priceLow: string;
  priceHigh: string;
  rating: string;
  ratingCount: string;
  imageUrls: string[];
  videoUrl: string;
  status: 'active' | 'inactive';
};

const field =
  'mt-1 w-full rounded-xl border border-[#EBE5D8] bg-[#FAF6EE] px-3 py-2 text-xs font-bold text-[#1C1C1C]';

function imagesOf(hotel: Hotel): string[] {
  if (Array.isArray(hotel.image_urls)) return hotel.image_urls;
  try {
    const parsed = JSON.parse(hotel.image_urls || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function emptyForm(): HotelForm {
  return {
    title: '',
    description: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    priceLow: '',
    priceHigh: '',
    rating: '0',
    ratingCount: '0',
    imageUrls: [],
    videoUrl: '',
    status: 'active',
  };
}

function formFromHotel(hotel: Hotel): HotelForm {
  return {
    title: hotel.title,
    description: hotel.description || '',
    phone: hotel.phone,
    address: hotel.address || '',
    city: hotel.city,
    state: hotel.state,
    priceLow: String(hotel.price_low ?? ''),
    priceHigh: String(hotel.price_high ?? ''),
    rating: String(hotel.rating ?? 0),
    ratingCount: String(hotel.rating_count ?? 0),
    imageUrls: imagesOf(hotel),
    videoUrl: hotel.video_url || '',
    status: hotel.status === 'inactive' ? 'inactive' : 'active',
  };
}

export const HotelsManager: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Hotel | 'new' | null>(null);
  const [form, setForm] = useState<HotelForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<Hotel | null>(null);
  const [removing, setRemoving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    if (!getToken()) {
      setError('Login as admin: 9999999999 / OTP 4829.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      setHotels(await api<Hotel[]>('/admin/hotels'));
    } catch (err: any) {
      setError(err?.message || 'Could not load hotels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = hotels.filter((hotel) => {
    if (statusFilter !== 'all' && hotel.status !== statusFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${hotel.title} ${hotel.city} ${hotel.state}`.toLowerCase().includes(q);
  });

  const openNew = () => {
    setForm(emptyForm());
    setFormError('');
    setEditing('new');
  };

  const openEdit = (hotel: Hotel) => {
    setForm(formFromHotel(hotel));
    setFormError('');
    setEditing(hotel);
  };

  const pickImages = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploadingImages(true);
    setFormError('');
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const { url } = await uploadToCloudinary(file);
        urls.push(url);
      }
      setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ...urls] }));
    } catch (err: any) {
      setFormError(err?.message || 'Could not upload image.');
    } finally {
      setUploadingImages(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const pickVideo = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    setFormError('');
    try {
      const { url } = await uploadToCloudinary(file);
      setForm((prev) => ({ ...prev, videoUrl: url }));
    } catch (err: any) {
      setFormError(err?.message || 'Could not upload video.');
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const saveHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = form.title.trim();
    const phone = form.phone.trim();
    const city = form.city.trim();
    const state = form.state.trim();
    const priceLow = Number(form.priceLow);
    const priceHigh = Number(form.priceHigh);
    if (!title || !phone || !city || !state) {
      setFormError('Title, phone, city and state are required.');
      return;
    }
    if (!Number.isFinite(priceLow) || !Number.isFinite(priceHigh) || priceLow < 0 || priceHigh < priceLow) {
      setFormError('Enter a valid price range (high must be ≥ low).');
      return;
    }
    const payload = {
      title,
      description: form.description.trim(),
      phone,
      address: form.address.trim(),
      city,
      state,
      priceLow,
      priceHigh,
      rating: Number(form.rating) || 0,
      ratingCount: Number(form.ratingCount) || 0,
      imageUrls: form.imageUrls,
      videoUrl: form.videoUrl || '',
      status: form.status,
    };
    setSaving(true);
    setFormError('');
    try {
      if (editing === 'new') {
        await api('/admin/hotels', { method: 'POST', json: payload });
      } else if (editing) {
        await api(`/admin/hotels/${editing.id}`, { method: 'PATCH', json: payload });
      }
      setEditing(null);
      await load();
    } catch (err: any) {
      setFormError(err?.message || 'Could not save hotel.');
    } finally {
      setSaving(false);
    }
  };

  const removeHotel = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await api(`/admin/hotels/${deleting.id}`, { method: 'DELETE' });
      setDeleting(null);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not delete hotel.');
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
            <Building2 className="w-6 h-6 text-[#F15A24]" />
            Hotels
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Hotels shown on the website hotels page, with photos, video, pricing and rating.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#F15A24] px-4 py-2.5 text-xs font-extrabold text-white"
        >
          <Plus className="w-4 h-4" /> Add hotel
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'active', 'inactive'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-extrabold border capitalize ${
              statusFilter === s ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' : 'bg-white text-[#6B6B6B] border-[#EBE5D8]'
            }`}
          >
            {s === 'all' ? `All (${hotels.length})` : s}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B6B6B]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title, city or state…"
          className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#EBE5D8] text-xs font-bold"
        />
      </div>

      {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-2xl">{error}</p>}
      {loading && <AdminPageSkeleton variant="table" rows={6} />}
      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={Building2}
          title="No record found"
          description={search || statusFilter !== 'all' ? 'No hotel matches this filter.' : 'Add the first hotel.'}
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-[#EBE5D8]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6EE] text-[10px] uppercase tracking-wider text-[#8A8478]">
              <tr>
                <th className="px-3 py-2.5 font-extrabold">Hotel</th>
                <th className="px-3 py-2.5 font-extrabold">City / State</th>
                <th className="px-3 py-2.5 font-extrabold">Price</th>
                <th className="px-3 py-2.5 font-extrabold">Rating</th>
                <th className="px-3 py-2.5 font-extrabold">Status</th>
                <th className="px-3 py-2.5 font-extrabold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((hotel) => {
                const images = imagesOf(hotel);
                return (
                  <tr key={hotel.id} className="border-t border-[#EBE5D8]">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#FAF6EE] border border-[#EBE5D8] overflow-hidden flex items-center justify-center shrink-0">
                          {images[0] ? (
                            <img src={images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-4 h-4 text-[#D8D0C2]" />
                          )}
                        </div>
                        <span className="font-extrabold">{hotel.title}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-bold text-[#6B6B6B]">
                      {hotel.city}, {hotel.state}
                    </td>
                    <td className="px-3 py-2.5 font-bold">
                      ₹{Number(hotel.price_low).toLocaleString('en-IN')}
                      {hotel.price_high > hotel.price_low ? ` – ₹${Number(hotel.price_high).toLocaleString('en-IN')}` : ''}
                    </td>
                    <td className="px-3 py-2.5 font-bold">
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {Number(hotel.rating || 0).toFixed(1)}
                        <span className="text-[#9E9E9E]">({hotel.rating_count || 0})</span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                          hotel.status === 'inactive'
                            ? 'bg-white text-[#8A8478] border border-[#EBE5D8]'
                            : 'bg-[#EBF7EE] text-[#00A86B]'
                        }`}
                      >
                        {hotel.status === 'inactive' ? 'Hidden' : 'Live'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(hotel)}
                          className="inline-flex items-center gap-1 rounded-xl border border-[#EBE5D8] bg-white px-2.5 py-1.5 text-[11px] font-extrabold hover:border-[#F15A24] hover:text-[#F15A24]"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(hotel)}
                          className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-extrabold text-red-600 hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
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

      {editing && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4 overflow-y-auto">
          <form onSubmit={saveHotel} className="w-full max-w-lg space-y-3 rounded-3xl bg-white p-5 my-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold">{editing === 'new' ? 'Add hotel' : `Edit ${editing.title}`}</h3>
              <button type="button" onClick={() => setEditing(null)} className="rounded-xl bg-[#FAF6EE] p-2">
                <X className="h-4 w-4" />
              </button>
            </div>
            {formError && <p className="rounded-xl bg-red-50 p-2.5 text-xs font-bold text-red-600">{formError}</p>}

            <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
              Title
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Hotel Royal Residency"
                className={field}
              />
            </label>

            <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
              Description
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className={`${field} font-medium`}
                placeholder="Amenities, nearby landmarks, room types…"
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
                Contact number
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className={field}
                />
              </label>
              <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
                Status
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
                  className={field}
                >
                  <option value="active">Live</option>
                  <option value="inactive">Hidden</option>
                </select>
              </label>
            </div>

            <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
              Address
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street, locality"
                className={field}
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
                City
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. Jaipur"
                  className={field}
                />
              </label>
              <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
                State
                <input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="e.g. Rajasthan"
                  className={field}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
                Price / night (low)
                <input
                  type="number"
                  min={0}
                  value={form.priceLow}
                  onChange={(e) => setForm({ ...form, priceLow: e.target.value })}
                  placeholder="2500"
                  className={field}
                />
              </label>
              <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
                Price / night (high)
                <input
                  type="number"
                  min={0}
                  value={form.priceHigh}
                  onChange={(e) => setForm({ ...form, priceHigh: e.target.value })}
                  placeholder="5000"
                  className={field}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
                Rating (0–5)
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  className={field}
                />
              </label>
              <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
                Review count
                <input
                  type="number"
                  min={0}
                  value={form.ratingCount}
                  onChange={(e) => setForm({ ...form, ratingCount: e.target.value })}
                  className={field}
                />
              </label>
            </div>

            <div>
              <p className="text-[11px] font-extrabold uppercase text-[#8A8478] mb-1.5">Photos</p>
              <div className="flex flex-wrap gap-2">
                {form.imageUrls.map((url, i) => (
                  <div key={url + i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#EBE5D8]">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, imageUrls: prev.imageUrls.filter((_, idx) => idx !== i) }))}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImages}
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-[#EBE5D8] flex flex-col items-center justify-center text-[#8A8478] gap-1 disabled:opacity-60"
                >
                  {uploadingImages ? <ButtonSpinner /> : <ImagePlus className="w-4 h-4" />}
                  <span className="text-[9px] font-extrabold">Add</span>
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => pickImages(e.target.files)}
                />
              </div>
            </div>

            <div>
              <p className="text-[11px] font-extrabold uppercase text-[#8A8478] mb-1.5">Video (optional)</p>
              {form.videoUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-[#EBE5D8] bg-black">
                  <video src={form.videoUrl} controls className="w-full h-32 object-contain bg-black" />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, videoUrl: '' }))}
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploadingVideo}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-[#EBE5D8] flex items-center justify-center gap-1.5 text-[#8A8478] disabled:opacity-60"
                >
                  {uploadingVideo ? <ButtonSpinner /> : <Video className="w-4 h-4" />}
                  <span className="text-[11px] font-extrabold">Upload video</span>
                </button>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => pickVideo(e.target.files)}
              />
            </div>

            <button
              type="submit"
              disabled={saving || uploadingImages || uploadingVideo}
              className="w-full rounded-2xl bg-[#F15A24] py-2.5 text-xs font-extrabold text-white disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {saving && <ButtonSpinner />}
              {editing === 'new' ? 'Add hotel' : 'Save changes'}
            </button>
          </form>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-sm space-y-3 rounded-3xl bg-white p-5">
            <h3 className="text-sm font-extrabold">Delete {deleting.title}?</h3>
            <p className="text-xs text-[#6B6B6B]">It will disappear from the website hotels page immediately.</p>
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
                onClick={removeHotel}
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
