import { useState } from 'react'
import { Mail, RefreshCw, ShieldCheck, Loader2 } from 'lucide-react'
import { useAuth } from '../context/NeonAuthContext'

type EmailVerificationPanelProps = {
  email: string
  title?: string
  onBack: () => void
  onVerified: () => void
}

export function EmailVerificationPanel({
  email,
  title = 'Verify your email',
  onBack,
  onVerified,
}: EmailVerificationPanelProps) {
  const { verifyEmailOtp, resendVerificationCode } = useAuth()
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setVerifying(true)

    try {
      const result = await verifyEmailOtp(email, otp)
      if (result.error) {
        setError(result.error)
        return
      }
      onVerified()
    } finally {
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setNotice('')
    setResending(true)

    try {
      const result = await resendVerificationCode(email)
      if (result.error) {
        setError(result.error)
        return
      }
      setNotice('A new verification code has been sent.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <Mail className="w-8 h-8 text-amber-600 dark:text-amber-400" />
      </div>

      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">
        Enter the verification code sent to
      </p>
      <p className="text-amber-600 dark:text-amber-400 font-semibold text-sm mb-5 break-all">{email}</p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-left text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {notice && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-left text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
          {notice}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4 text-left">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Verification code
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^\d\s-]/g, '').slice(0, 12))}
            required
            placeholder="Enter code"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-lg font-semibold tracking-[0.18em] text-slate-900 placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-400"
          />
        </div>

        <button
          type="submit"
          disabled={verifying}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {verifying ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <ShieldCheck size={18} />
              Verify Code
            </>
          )}
        </button>
      </form>

      <div className="mt-5 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 disabled:opacity-50 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          {resending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Resend code
        </button>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-6 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Back to Sign In
        </button>
      </div>
    </div>
  )
}
