import React, { useEffect, useState } from 'react';
import { CheckCircle2, Cloud, Database, KeyRound, Settings, Shield, Wifi } from 'lucide-react';
import { api, apiUrl, getToken } from '../../lib/api';
import { AdminPageSkeleton } from '../common/AdminLoading';

type SettingsData = {
  apiPort: number;
  demoOtp: string;
  demoOtpAlt: string;
  adminPhones: string[];
  clientOrigins: string[];
  cloudinary: { ready: boolean; cloudName: string | null; folder: string };
  database: { configured: boolean; live: boolean };
  rules: { browse: string; chatBookPost: string; postCar: string; postTour: string };
};

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${
        ok ? 'bg-[#EBF7EE] text-[#00A86B] border-[#BDE8C7]' : 'bg-red-50 text-red-600 border-red-200'
      }`}
    >
      {ok ? <CheckCircle2 className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
      {label}
    </span>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-[#F0EAE0] py-3 first:border-t-0 first:pt-0">
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A8478]">{label}</p>
      <div className="text-right text-xs font-bold text-[#1C1C1C]">{value}</div>
    </div>
  );
}

export const SettingsView: React.FC = () => {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken()) {
      setError('Login as admin: 9999999999 / OTP 4829.');
      setLoading(false);
      return;
    }
    api<SettingsData>('/admin/settings')
      .then(setData)
      .catch((err: any) => setError(err?.message || 'Could not load settings.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#F15A24]" />
          Settings
        </h2>
        <p className="text-xs text-[#6B6B6B] mt-1">
          Live platform config. Secrets stay in server/.env — they are not shown here.
        </p>
      </div>

      {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-2xl">{error}</p>}
      {loading && <AdminPageSkeleton variant="cards" rows={3} />}

      {!loading && data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="rounded-3xl border border-[#EBE5D8] bg-[#FAF6EE] p-4 space-y-3">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A8478] inline-flex items-center gap-1">
              <Wifi className="h-3.5 w-3.5" /> Connections
            </p>
            <div className="flex flex-wrap gap-2">
              <StatusPill ok label={`API ${apiUrl()}`} />
              <StatusPill ok={data.database.live} label={data.database.live ? 'Neon live' : 'Neon down'} />
              <StatusPill ok={data.cloudinary.ready} label={data.cloudinary.ready ? 'Cloudinary ready' : 'Cloudinary off'} />
            </div>
            <Row label="API port" value={data.apiPort} />
            <Row label="Database" value={data.database.configured ? 'Configured' : 'Missing DATABASE_URL'} />
          </section>

          <section className="rounded-3xl border border-[#EBE5D8] bg-[#FAF6EE] p-4 space-y-3">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A8478] inline-flex items-center gap-1">
              <KeyRound className="h-3.5 w-3.5" /> Demo access
            </p>
            <Row label="Admin phone" value={data.adminPhones.map((p) => `+91 ${p}`).join(', ') || 'Not set'} />
            <Row label="Demo OTP" value={data.demoOtp} />
            <Row label="Alt OTP" value={data.demoOtpAlt} />
          </section>

          <section className="rounded-3xl border border-[#EBE5D8] bg-[#FAF6EE] p-4 space-y-3">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A8478] inline-flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" /> Allowed websites
            </p>
            {data.clientOrigins.map((origin) => (
              <Row key={origin} label="Origin" value={origin} />
            ))}
          </section>

          <section className="rounded-3xl border border-[#EBE5D8] bg-[#FAF6EE] p-4 space-y-3">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A8478] inline-flex items-center gap-1">
              <Cloud className="h-3.5 w-3.5" /> Cloudinary
            </p>
            <Row label="Cloud name" value={data.cloudinary.cloudName || '—'} />
            <Row label="Folder" value={data.cloudinary.folder} />
            <Row label="Uploads" value={data.cloudinary.ready ? 'Signed upload on' : 'Not configured'} />
          </section>

          <section className="rounded-3xl border border-[#EBE5D8] bg-[#FAF6EE] p-4 space-y-3 lg:col-span-2">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A8478] inline-flex items-center gap-1">
              <Database className="h-3.5 w-3.5" /> Marketplace rules
            </p>
            <Row label="Browse" value={data.rules.browse} />
            <Row label="Chat / book / post" value={data.rules.chatBookPost} />
            <Row label="Post car" value={data.rules.postCar} />
            <Row label="Post tour" value={data.rules.postTour} />
          </section>
        </div>
      )}
    </div>
  );
};
