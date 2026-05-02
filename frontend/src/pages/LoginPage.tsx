import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/NeonAuthContext'
import { ThemeToggle } from '../components/ThemeToggle'
import { EmailVerificationPanel } from '../components/EmailVerificationPanel'
import { Target, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react'

export const LoginPage = () => {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const turnstileRef = useRef<HTMLDivElement>(null)
  const turnstileWidgetId = useRef<string | null>(null)
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY
  const isDevOrPreview = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.endsWith('.vercel.app')

  useEffect(() => {
    const authError = new URLSearchParams(location.search).get('error')
    if (!authError) return

    setError(
      authError
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    )
  }, [location.search])

  // On localhost or Vercel previews, auto-pass Turnstile (Cloudflare doesn't allow localhost domains)
  useEffect(() => {
    if (isDevOrPreview && siteKey) {
      setTurnstileToken('localhost-bypass')
      return
    }
    if (!siteKey || !turnstileRef.current) return

    const renderWidget = () => {
      if (turnstileRef.current && (window as any).turnstile) {
        if (turnstileWidgetId.current) {
          try { (window as any).turnstile.remove(turnstileWidgetId.current) } catch {}
        }
        turnstileWidgetId.current = (window as any).turnstile.render(turnstileRef.current, {
          sitekey: siteKey,
          callback: (token: string) => setTurnstileToken(token),
          'error-callback': () => setTurnstileToken(''),
          'expired-callback': () => setTurnstileToken(''),
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        })
      }
    }

    if (!(window as any).turnstile) {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoadLogin'
      script.async = true
      script.defer = true
      ;(window as any).onTurnstileLoadLogin = renderWidget
      document.head.appendChild(script)
    } else {
      renderWidget()
    }

    return () => {
      if (turnstileWidgetId.current) {
        try { (window as any).turnstile.remove(turnstileWidgetId.current) } catch {}
        turnstileWidgetId.current = null
      }
    }
  }, [siteKey, isDevOrPreview])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!turnstileToken) {
      setError('Please complete the verification challenge')
      return
    }

    setLoading(true)

    try {
      const result = await signIn(email, password)

      if (result.error) {
        if (result.needsVerification) {
          setEmailSent(true)
        } else {
          setError(result.error)
        }
      } else if (result.needsVerification) {
        setEmailSent(true)
      } else {
        setSuccess('Login successful!')
        setTimeout(() => navigate('/prediction'), 1000)
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 transition-colors font-sans relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-400/40 dark:bg-emerald-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-400/40 dark:bg-cyan-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-blue-400/40 dark:bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>
      <header className="px-6 py-6 flex justify-between items-center w-full max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-lg">
          <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-slate-900">
            <Target size={18} />
          </div>
          RoadWatch
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-1.5 font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-white/60 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl border border-white/80 dark:border-slate-700/50 p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/10 dark:from-slate-800/40 dark:to-slate-900/0 pointer-events-none" />
            <div className="relative z-10">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Sign in to your account</p>
              </div>

              {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm">
                  {success}
                </div>
              )}

              {emailSent ? (
                <EmailVerificationPanel
                  email={email}
                  onBack={() => { setEmailSent(false); setError('') }}
                  onVerified={() => {
                    setSuccess('Email verified successfully!')
                    navigate('/prediction')
                  }}
                />
              ) : (
              <>
              <button
                type="button"
                onClick={signInWithGoogle}
                className="w-full mb-6 py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-medium shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">Or continue with</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Human Verification</label>
                  {isDevOrPreview && siteKey ? (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center gap-3">
                      <ShieldCheck size={20} className="text-blue-500" />
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        Turnstile bypassed on dev/preview (active on production)
                      </span>
                    </div>
                  ) : siteKey ? (
                    <div ref={turnstileRef} className="flex justify-center" />
                  ) : (
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center gap-3">
                      <ShieldCheck size={20} className="text-amber-500" />
                      <span className="text-sm text-amber-700 dark:text-amber-300">
                        VITE_TURNSTILE_SITE_KEY not configured in environment variables
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Signing in...</>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Don't have an account?{' '}
                <Link to="/signup" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                  Sign up
                </Link>
              </p>
              </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
