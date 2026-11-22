import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ImagePlus, Images, Pencil, Plus, Trash2, X } from 'lucide-react';
import { api, getToken } from '../../lib/api';
import { uploadToCloudinary } from '../../lib/upload';
import { AdminPageSkeleton, ButtonSpinner } from '../common/AdminLoading';
import { EmptyState } from '../common/EmptyState';

type Placement = 'tours' | 'cars' | 'hotels';

type Banner = {
  id: string;
  title?: string;
  image_url: string;
  link_url?: string;
  placement: Placement;
  sort_order: number;
  is_active: boolean;
};

type BannerForm = {
  title: string;
  imageUrl: string;
  linkUrl: string;
  placement: Placement;
  sortOrder: string;
  isActive: boolean;
};

const PLACEMENT_LABEL: Record<Placement, string> = {
  tours: 'Tours page',
  cars: 'Cars page',
  hotels: 'Hotels page',
};

const field =
  'mt-1 w-full rounded-xl border border-[#EBE5D8] bg-[#FAF6EE] px-3 py-2 text-xs font-bold text-[#1C1C1C]';

function emptyForm(): BannerForm {
  return { title: '', imageUrl: '', linkUrl: '', placement: 'tours', sortOrder: '0', isActive: true };
}

function formFromBanner(b: Banner): BannerForm {
  return {
    title: b.title || '',
    imageUrl: b.image_url,
    linkUrl: b.link_url || '',
    placement: b.placement,
    sortOrder: String(b.sort_order ?? 0),
    isActive: b.is_active !== false,
  };
}

export const BannersManager: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [placementFilter, setPlacementFilter] = useState<'all' | Placement>('all');
  const [editing, setEditing] = useState<Banner | 'new' | null>(null);
  const [form, setForm] = useState<BannerForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<Banner | null>(null);
  const [removing, setRemoving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    if (!getToken()) {
      setError('Login as admin: 9999999999 / OTP 4829.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      setBanners(await api<Banner[]>('/admin/banners'));
    } catch (err: any) {
      setError(err?.message || 'Could not load banners.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = banners.filter((b) => placementFilter === 'all' || b.placement === placementFilter);

  const openNew = () => {
    setForm(emptyForm());
    setFormError('');
    setEditing('new');
  };

  const openEdit = (b: Banner) => {
    setForm(formFromBanner(b));
    setFormError('');
    setEditing(b);
  };

  const pickImage = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    setFormError('');
    try {
      const { url } = await uploadToCloudinary(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err: any) {
      setFormError(err?.message || 'Could not upload image.');
    } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const saveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl) {
      setFormError('Upload a banner image.');
      return;
    }
    const payload = {
      title: form.title.trim(),
      imageUrl: form.imageUrl,
      linkUrl: form.linkUrl.trim(),
      placement: form.placement,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    };
    setSaving(true);
    setFormError('');
    try {
      if (editing === 'new') {
        await api('/admin/banners', { method: 'POST', json: payload });
      } else if (editing) {
        await api(`/admin/banners/${editing.id}`, { method: 'PATCH', json: payload });
      }
      setEditing(null);
      await load();
    } catch (err: any) {
      setFormError(err?.message || 'Could not save banner.');
    } finally {
      setSaving(false);
    }
  };

  const removeBanner = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await api(`/admin/banners/${deleting.id}`, { method: 'DELETE' });
      setDeleting(null);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not delete banner.');
      setDeleting(null);
    } finally {
      setRemoving(false);
    }
  };

  if (editing) {
    return (
      <div className="space-y-4 max-w-lg">
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="text-xs font-extrabold text-[#F15A24] inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> All banners
        </button>

        <div className="rounded-3xl border border-[#EBE5D8] bg-white p-5 sm:p-6">
          <h3 className="text-lg font-black text-[#1C1C1C]">{editing === 'new' ? 'Add banner' : 'Edit banner'}</h3>
          <p className="text-xs text-[#6B6B6B] mt-1 mb-4">
            Shown as a horizontal slider at the top of the page you pick. Tap opens the link.
          </p>

          <form onSubmit={saveBanner} className="space-y-3">
            {formError && <p className="rounded-xl bg-red-50 p-2.5 text-xs font-bold text-red-600">{formError}</p>}

            <div>
              <p className="text-[11px] font-extrabold uppercase text-[#8A8478] mb-1.5">Banner image</p>
              {form.imageUrl ? (
                <div className="relative w-full h-28 rounded-xl overflow-hidden border border-[#EBE5D8]">
                  <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, imageUrl: '' }))}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-6 rounded-xl border-2 border-dashed border-[#EBE5D8] flex flex-col items-center justify-center gap-1.5 text-[#8A8478] disabled:opacity-60"
                >
                  {uploading ? <ButtonSpinner /> : <ImagePlus className="w-5 h-5" />}
                  <span className="text-[11px] font-extrabold">Upload banner image</span>
                </button>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickImage(e.target.files)}
              />
            </div>

            <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
              Title (for your reference, not shown)
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Diwali offer banner"
                className={field}
              />
            </label>

            <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
              Link URL (opens when tapped)
              <input
                type="url"
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                placeholder="https://…"
                className={field}
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
                Show on
                <select
                  value={form.placement}
                  onChange={(e) => setForm({ ...form, placement: e.target.value as Placement })}
                  className={field}
                >
                  {(Object.keys(PLACEMENT_LABEL) as Placement[]).map((p) => (
                    <option key={p} value={p}>
                      {PLACEMENT_LABEL[p]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
                Order (lower shows first)
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                  className={field}
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-xs font-extrabold text-[#1C1C1C]">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Show on website
            </label>

            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full rounded-2xl bg-[#F15A24] py-2.5 text-xs font-extrabold text-white disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {saving && <ButtonSpinner />}
              {editing === 'new' ? 'Add banner' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Images className="w-6 h-6 text-[#F15A24]" />
            Promo banners
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Horizontal banner slider shown at the top of the website pages you pick.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#F15A24] px-4 py-2.5 text-xs font-extrabold text-white"
        >
          <Plus className="w-4 h-4" /> Add banner
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'tours', 'cars', 'hotels'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPlacementFilter(p)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-extrabold border capitalize ${
              placementFilter === p ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' : 'bg-white text-[#6B6B6B] border-[#EBE5D8]'
            }`}
          >
            {p === 'all' ? `All (${banners.length})` : PLACEMENT_LABEL[p]}
          </button>
        ))}
      </div>

      {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-2xl">{error}</p>}
      {loading && <AdminPageSkeleton variant="table" rows={4} />}
      {!loading && filtered.length === 0 && (
        <EmptyState icon={Images} title="No record found" description="Add the first promo banner." />
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((b) => (
            <div key={b.id} className="rounded-2xl border border-[#EBE5D8] bg-white overflow-hidden">
              <div className="w-full h-24 bg-[#FAF6EE]">
                <img src={b.image_url} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="p-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase text-[#8A8478]">
                    {PLACEMENT_LABEL[b.placement]} · order {b.sort_order}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                      b.is_active ? 'bg-[#EBF7EE] text-[#00A86B]' : 'bg-white text-[#8A8478] border border-[#EBE5D8]'
                    }`}
                  >
                    {b.is_active ? 'Live' : 'Hidden'}
                  </span>
                </div>
                {b.title && <p className="text-xs font-extrabold truncate">{b.title}</p>}
                {b.link_url && <p className="text-[11px] text-[#6B6B6B] truncate">{b.link_url}</p>}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openEdit(b)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-[#EBE5D8] bg-white px-2.5 py-1.5 text-[11px] font-extrabold hover:border-[#F15A24] hover:text-[#F15A24]"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(b)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-extrabold text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-sm space-y-3 rounded-3xl bg-white p-5">
            <h3 className="text-sm font-extrabold">Delete this banner?</h3>
            <p className="text-xs text-[#6B6B6B]">It will disappear from the website immediately.</p>
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
                onClick={removeBanner}
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
