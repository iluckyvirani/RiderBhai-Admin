import React, { useEffect, useState } from 'react';
import { FileText, Plus, Save, Trash2 } from 'lucide-react';
import { api, getToken } from '../../lib/api';
import { AdminPageSkeleton, ButtonSpinner } from '../common/AdminLoading';

type PageSlug = 'terms' | 'privacy';
type InnerTab = PageSlug | 'support' | 'faq';

type SitePage = {
  slug: PageSlug;
  title: string;
  body: string;
  updatedAt?: string | null;
};

type SiteSettings = {
  supportPhone: string;
  supportEmail: string;
  emergencyPhone: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
  supportHours?: string;
};

type SiteFaq = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
};

const TABS: { id: InnerTab; label: string }[] = [
  { id: 'terms', label: 'Terms' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'support', label: 'Support contact' },
  { id: 'faq', label: 'FAQ' },
];

const field =
  'mt-1 w-full rounded-xl border border-[#EBE5D8] bg-[#FAF6EE] px-3 py-2.5 text-sm font-bold text-[#1C1C1C]';

function when(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export const LegalPagesView: React.FC = () => {
  const [tab, setTab] = useState<InnerTab>('terms');
  const [pages, setPages] = useState<Partial<Record<PageSlug, SitePage>>>({});
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [settings, setSettings] = useState<SiteSettings>({
    supportPhone: '',
    supportEmail: '',
    emergencyPhone: '',
    whatsappNumber: '',
    whatsappMessage: '',
    supportHours: '',
  });
  const [faqs, setFaqs] = useState<SiteFaq[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  const load = async () => {
    if (!getToken()) {
      setError('Login as admin: 9999999999 / OTP 4829.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [pageRows, site] = await Promise.all([
        api<SitePage[]>('/admin/pages'),
        api<{ settings: SiteSettings; faqs: SiteFaq[] }>('/admin/site'),
      ]);
      const next: Partial<Record<PageSlug, SitePage>> = {};
      for (const row of pageRows || []) {
        if (row.slug === 'terms' || row.slug === 'privacy') next[row.slug] = row;
      }
      setPages(next);
      const current = next[tab === 'privacy' ? 'privacy' : 'terms'];
      setTitle(current?.title || '');
      setBody(current?.body || '');
      setSettings(site.settings);
      setFaqs(site.faqs || []);
    } catch (err: any) {
      setError(err?.message || 'Could not load website content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab !== 'terms' && tab !== 'privacy') return;
    const current = pages[tab];
    if (!current) return;
    setTitle(current.title);
    setBody(current.body);
    setSaved('');
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const savePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab !== 'terms' && tab !== 'privacy') return;
    setSaving(true);
    setError('');
    setSaved('');
    try {
      const row = await api<SitePage>(`/admin/pages/${tab}`, {
        method: 'PATCH',
        json: { title: title.trim(), body: body.trim() },
      });
      setPages((prev) => ({ ...prev, [tab]: row }));
      setTitle(row.title);
      setBody(row.body);
      setSaved('Saved. The website page is updated.');
    } catch (err: any) {
      setError(err?.message || 'Could not save this page.');
    } finally {
      setSaving(false);
    }
  };

  const saveSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved('');
    try {
      const row = await api<SiteSettings>('/admin/site', {
        method: 'PATCH',
        json: settings,
      });
      setSettings(row);
      setSaved('Saved. Footer support details are updated.');
    } catch (err: any) {
      setError(err?.message || 'Could not save support details.');
    } finally {
      setSaving(false);
    }
  };

  const addFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved('');
    try {
      const row = await api<SiteFaq>('/admin/faqs', {
        method: 'POST',
        json: { question: newQuestion.trim(), answer: newAnswer.trim() },
      });
      setFaqs((prev) => [...prev, row]);
      setNewQuestion('');
      setNewAnswer('');
      setSaved('FAQ added. It shows on the website Questions section.');
    } catch (err: any) {
      setError(err?.message || 'Could not add FAQ.');
    } finally {
      setSaving(false);
    }
  };

  const saveFaq = async (faq: SiteFaq) => {
    setSaving(true);
    setError('');
    setSaved('');
    try {
      const row = await api<SiteFaq>(`/admin/faqs/${faq.id}`, {
        method: 'PATCH',
        json: {
          question: faq.question.trim(),
          answer: faq.answer.trim(),
          isActive: faq.isActive,
        },
      });
      setFaqs((prev) => prev.map((item) => (item.id === row.id ? row : item)));
      setSaved('FAQ updated.');
    } catch (err: any) {
      setError(err?.message || 'Could not save FAQ.');
    } finally {
      setSaving(false);
    }
  };

  const removeFaq = async (id: string) => {
    if (!window.confirm('Delete this FAQ from the website?')) return;
    setSaving(true);
    setError('');
    setSaved('');
    try {
      await api(`/admin/faqs/${id}`, { method: 'DELETE' });
      setFaqs((prev) => prev.filter((item) => item.id !== id));
      setSaved('FAQ deleted.');
    } catch (err: any) {
      setError(err?.message || 'Could not delete FAQ.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminPageSkeleton variant="list" />;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#F15A24]" />
          Website content
        </h2>
        <p className="text-xs text-[#6B6B6B] mt-1">
          Edit footer Terms, Privacy, support phone/email, and the Questions (FAQ) list.
        </p>
      </div>

      <div className="flex gap-2 bg-[#FAF6EE] p-1 rounded-2xl border border-[#EBE5D8] w-fit flex-wrap">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTab(item.id);
              setSaved('');
              setError('');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              tab === item.id ? 'bg-[#1C1C1C] text-white' : 'text-[#6B6B6B]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-2xl">{error}</p>}
      {saved && (
        <p className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
          {saved}
        </p>
      )}

      {(tab === 'terms' || tab === 'privacy') && (
        <form onSubmit={savePage} className="space-y-3">
          <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
            Page title
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={field} />
          </label>
          <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
            Page text
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={16}
              className={`${field} font-medium leading-relaxed`}
            />
          </label>
          <p className="text-[11px] text-[#6B6B6B]">
            {pages[tab]?.updatedAt ? `Last saved ${when(pages[tab]?.updatedAt)}` : 'Not saved yet'}
          </p>
          <button
            type="submit"
            disabled={saving || !title.trim() || body.trim().length < 20}
            className="px-6 py-3 rounded-2xl bg-[#F15A24] text-white text-sm font-extrabold disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {saving ? <ButtonSpinner /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save page'}
          </button>
        </form>
      )}

      {tab === 'support' && (
        <form onSubmit={saveSupport} className="space-y-3 max-w-lg">
          <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
            Support phone
            <input
              value={settings.supportPhone}
              onChange={(e) => setSettings((prev) => ({ ...prev, supportPhone: e.target.value }))}
              className={field}
              placeholder="+91 70550 54387"
            />
          </label>
          <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
            Support email
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings((prev) => ({ ...prev, supportEmail: e.target.value }))}
              className={field}
              placeholder="support@ridebhai.com"
            />
          </label>
          <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
            WhatsApp support number (optional)
            <input
              value={settings.whatsappNumber || ''}
              onChange={(e) => setSettings((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
              className={field}
              placeholder="+91 70550 54387"
            />
          </label>
          <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
            WhatsApp chat message (sticky widget)
            <textarea
              value={settings.whatsappMessage || ''}
              onChange={(e) => setSettings((prev) => ({ ...prev, whatsappMessage: e.target.value }))}
              rows={2}
              className={`${field} font-medium`}
              placeholder="Hi Ride Bhai! I need help with booking a car or tour."
            />
            <span className="mt-1 block text-[10px] font-medium normal-case text-[#9E9E9E]">
              Pre-fills the message when someone taps the WhatsApp bubble on the website.
            </span>
          </label>
          <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
            Support hours / timing
            <input
              value={settings.supportHours || ''}
              onChange={(e) => setSettings((prev) => ({ ...prev, supportHours: e.target.value }))}
              className={field}
              placeholder="24/7 Helpline · All India"
            />
          </label>
          <label className="block text-[11px] font-extrabold uppercase text-[#8A8478]">
            Emergency number
            <input
              value={settings.emergencyPhone}
              onChange={(e) => setSettings((prev) => ({ ...prev, emergencyPhone: e.target.value }))}
              className={field}
              placeholder="112"
            />
          </label>
          <button
            type="submit"
            disabled={saving || !settings.supportPhone.trim() || !settings.supportEmail.trim()}
            className="px-6 py-3 rounded-2xl bg-[#F15A24] text-white text-sm font-extrabold disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {saving ? <ButtonSpinner /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save support details'}
          </button>
        </form>
      )}

      {tab === 'faq' && (
        <div className="space-y-4">
          <form onSubmit={addFaq} className="rounded-3xl border border-[#EBE5D8] bg-[#FAF6EE] p-4 space-y-3">
            <p className="text-[11px] font-extrabold uppercase text-[#8A8478] inline-flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add question
            </p>
            <input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Question"
              className={field}
            />
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Answer"
              rows={3}
              className={`${field} font-medium`}
            />
            <button
              type="submit"
              disabled={saving || newQuestion.trim().length < 4 || newAnswer.trim().length < 4}
              className="px-5 py-2.5 rounded-2xl bg-[#1C1C1C] text-white text-xs font-extrabold disabled:opacity-60"
            >
              Add FAQ
            </button>
          </form>

          {faqs.length === 0 && (
            <p className="text-sm font-bold text-[#6B6B6B]">No FAQs yet. Add the first question above.</p>
          )}
          {faqs.map((faq) => (
            <div key={faq.id} className="rounded-3xl border border-[#EBE5D8] p-4 space-y-3">
              <label className="flex items-center gap-2 text-[11px] font-extrabold uppercase text-[#8A8478]">
                <input
                  type="checkbox"
                  checked={faq.isActive}
                  onChange={(e) =>
                    setFaqs((prev) =>
                      prev.map((item) => (item.id === faq.id ? { ...item, isActive: e.target.checked } : item))
                    )
                  }
                />
                Show on website
              </label>
              <input
                value={faq.question}
                onChange={(e) =>
                  setFaqs((prev) =>
                    prev.map((item) => (item.id === faq.id ? { ...item, question: e.target.value } : item))
                  )
                }
                className={field}
              />
              <textarea
                value={faq.answer}
                onChange={(e) =>
                  setFaqs((prev) =>
                    prev.map((item) => (item.id === faq.id ? { ...item, answer: e.target.value } : item))
                  )
                }
                rows={3}
                className={`${field} font-medium`}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => saveFaq(faq)}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-[#F15A24] text-white text-xs font-extrabold disabled:opacity-60 inline-flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
                <button
                  type="button"
                  onClick={() => removeFaq(faq.id)}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-[#FFF0EB] text-[#D64545] text-xs font-extrabold border border-[#FFD8CB] inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
