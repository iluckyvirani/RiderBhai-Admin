import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Shield } from 'lucide-react'
import { Logo } from '../common/Logo'
import { ButtonSpinner } from '../common/AdminLoading'
import { api, setToken } from '../../lib/api'

const DEMO_PHONE = '9999999999'
const DEMO_OTP = '4829'

const OPS = [
  { title: 'User KYC', desc: 'Review Aadhaar + selfie and approve accounts' },
  { title: 'Ride Bhai deals', desc: 'Close mediated bookings as success or cancelled' },
  { title: 'Listings', desc: 'Hide cars or tours that should not stay live' },
]

interface AdminLoginPageProps {
  onLoginSuccess: (admin: { phone: string; email: string; name: string; role: string }) => void
}

export function AdminLoginPage({ onLoginSuccess }: AdminLoginPageProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState(DEMO_PHONE)
  const [digits, setDigits] = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendIn, setResendIn] = useState(0)
  const otpRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (resendIn <= 0) return
    const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [resendIn])

  const requestOtp = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const next = phone.replace(/\D/g, '').slice(0, 10)
    if (next.length !== 10) {
      setError('Enter a valid 10-digit Indian mobile number')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api('/auth/otp/request', { method: 'POST', json: { phone: next } })
      setPhone(next)
      setDigits(['', '', '', ''])
      setStep('otp')
      setResendIn(30)
      window.setTimeout(() => otpRefs.current[0]?.focus(), 40)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send OTP')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (code: string) => {
    if (code.length !== 4 || loading) return
    setLoading(true)
    setError('')
    try {
      const data = await api<{
        token: string
        isAdmin: boolean
        user: { phone: string; email?: string; name?: string }
      }>('/auth/otp/verify', { method: 'POST', json: { phone, code } })
      if (!data.isAdmin) {
        setError('This phone is not an admin. Use 9999999999.')
        setDigits(['', '', '', ''])
        otpRefs.current[0]?.focus()
        return
      }
      setToken(data.token)
      onLoginSuccess({
        phone: data.user.phone,
        email: data.user.email || 'admin@ridebhai.in',
        name: data.user.name || 'Ride Bhai Admin',
        role: 'super_admin',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP')
      setDigits(['', '', '', ''])
      otpRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const onDigit = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, '')
    if (value.length > 1) {
      const next = value.slice(0, 4).split('')
      while (next.length < 4) next.push('')
      setDigits(next)
      otpRefs.current[Math.min(next.filter(Boolean).length, 3)]?.focus()
      if (next.join('').length === 4) void verifyOtp(next.join(''))
      return
    }
    const next = [...digits]
    next[index] = value
    setDigits(next)
    if (value && index < 3) otpRefs.current[index + 1]?.focus()
    if (next.join('').length === 4) void verifyOtp(next.join(''))
  }

  const onOtpKey = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="h-screen overflow-y-auto bg-[#F3EEE4] lg:grid lg:grid-cols-2 lg:overflow-hidden">
      <aside className="relative hidden overflow-hidden bg-[#1C1C1C] px-10 py-10 text-white lg:flex lg:h-screen lg:flex-col">
        <div className="pointer-events-none absolute -left-20 top-16 h-72 w-72 rounded-full bg-[#F15A24]/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#F15A24]/15 blur-3xl" />
        <Logo variant="light" showTagline={false} className="relative" />
        <div className="relative mt-16 max-w-md">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#F15A24]">Ride Bhai operations</p>
          <h1 className="mt-3 text-4xl font-black leading-tight">
            Admin console
            <span className="block text-white/45">for KYC, deals and listings.</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            Same phone OTP as the website. Only the admin number can enter this panel.
          </p>
        </div>
        <ul className="relative mt-12 space-y-4">
          {OPS.map((item) => (
            <li key={item.title} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F15A24]">
                <Check size={13} strokeWidth={3} />
              </span>
              <div>
                <p className="text-sm font-bold">{item.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-white/50">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="relative mt-auto pt-10 text-xs text-white/35">Restricted access · Ride Bhai demo</p>
      </aside>

      <main className="flex min-h-screen items-center justify-center px-4 py-10 lg:h-screen lg:overflow-y-auto">
        <div className="w-full max-w-[440px]">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Logo />
            <span className="rounded-full bg-[#F15A24]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#F15A24]">
              Admin
            </span>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-[#E8E0D0] bg-white shadow-[0_24px_60px_rgba(28,28,28,0.08)]">
            <div className="border-b border-[#F0EAE0] px-7 py-6">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8A8478]">
                  {step === 'phone' ? 'Step 1 of 2' : 'Step 2 of 2'}
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF6EE] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#F15A24]">
                  <Shield size={11} />
                  Secure login
                </span>
              </div>
              <div className="mt-3 flex gap-1.5">
                <span className="h-1 flex-1 rounded-full bg-[#F15A24]" />
                <span className={`h-1 flex-1 rounded-full ${step === 'otp' ? 'bg-[#F15A24]' : 'bg-[#EBE5D8]'}`} />
              </div>
              <h2 className="mt-5 text-[28px] font-black tracking-tight text-[#1C1C1C]">
                {step === 'phone' ? 'Sign in' : 'Enter OTP'}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[#6B6560]">
                {step === 'phone'
                  ? 'Use the admin mobile number. We will send a 4-digit OTP.'
                  : `Code sent to +91 ${phone}. Same OTP as the website.`}
              </p>
            </div>

            <div className="px-7 py-6">
              {step === 'phone' ? (
                <form onSubmit={requestOtp} className="space-y-5">
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-[#8A8478]">
                      Admin phone
                    </span>
                    <div className="flex overflow-hidden rounded-2xl border border-[#E8E0D0] bg-[#FAF6EE] focus-within:border-[#F15A24] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#F15A24]/10">
                      <span className="flex items-center gap-2 border-r border-[#E8E0D0] px-3.5 text-sm font-bold text-[#1C1C1C]">
                        <span className="text-base leading-none" aria-hidden>
                          🇮🇳
                        </span>
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                          setError('')
                        }}
                        className="h-13 w-full bg-transparent px-4 text-[16px] font-semibold tracking-wide text-[#1C1C1C] outline-none"
                        placeholder="9999999999"
                      />
                    </div>
                  </label>
                  {error && (
                    <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={loading || phone.length !== 10}
                    className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#F15A24] to-[#FF7A45] text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(241,90,36,0.28)] transition hover:brightness-105 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <ButtonSpinner />
                        Sending OTP
                      </>
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    void verifyOtp(digits.join(''))
                  }}
                  className="space-y-5"
                >
                  <div className="flex justify-between gap-2.5">
                    {digits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          otpRefs.current[i] = el
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => onDigit(i, e.target.value)}
                        onKeyDown={(e) => onOtpKey(i, e)}
                        className="h-16 w-full rounded-2xl border border-[#E8E0D0] bg-[#FAF6EE] text-center text-2xl font-black text-[#1C1C1C] outline-none transition focus:border-[#F15A24] focus:bg-white focus:ring-4 focus:ring-[#F15A24]/10"
                      />
                    ))}
                  </div>
                  {error && (
                    <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={loading || digits.join('').length !== 4}
                    className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#F15A24] to-[#FF7A45] text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(241,90,36,0.28)] transition hover:brightness-105 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <ButtonSpinner />
                        Verifying
                      </>
                    ) : (
                      'Verify & enter'
                    )}
                  </button>
                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('phone')
                        setError('')
                        setDigits(['', '', '', ''])
                      }}
                      className="inline-flex items-center gap-1.5 font-semibold text-[#6B6560] hover:text-[#1C1C1C]"
                    >
                      <ArrowLeft size={15} />
                      Change number
                    </button>
                    <button
                      type="button"
                      disabled={resendIn > 0 || loading}
                      onClick={() => void requestOtp()}
                      className="font-semibold text-[#F15A24] disabled:text-[#B8B2A6]"
                    >
                      {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend OTP'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = DEMO_OTP.split('')
                      setDigits(next)
                      void verifyOtp(DEMO_OTP)
                    }}
                    className="w-full text-center text-xs font-semibold text-[#8A8478] hover:text-[#F15A24]"
                  >
                    Auto-fill demo OTP {DEMO_OTP}
                  </button>
                </form>
              )}
            </div>

            <div className="border-t border-[#F0EAE0] bg-[#FAF6EE] px-7 py-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#F15A24]">Demo admin</p>
              <p className="mt-1 text-sm text-[#6B6560]">
                Phone <span className="font-bold text-[#1C1C1C]">{DEMO_PHONE}</span>
                <span className="mx-2 text-[#C8C0B0]">·</span>
                OTP <span className="font-bold text-[#1C1C1C]">{DEMO_OTP}</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
