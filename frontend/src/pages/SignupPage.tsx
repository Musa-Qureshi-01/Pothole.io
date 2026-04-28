import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/NeonAuthContext'
import { neonClient } from '../lib/neonClient'
import { ThemeToggle } from '../components/ThemeToggle'
import { Target, Loader2, ArrowLeft } from 'lucide-react'

export const SignupPage = () => {
  const { signUp, verifyEmail, resendOtp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Verification step state
  const [showVerification, setShowVerification] = useState(false)
  const [otp, setOtp] = useState('')

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      // Neon's Better Auth creates the user. We can update custom fields like phone through our DB endpoint after, but for now we just capture it.
      const result = await signUp(name, email, password)
      
      // If we had a direct DB hook here, we'd update the phone number in our users table
      if (!result.error && phone) {
        try {
          // Attempting to patch the profile
          await neonClient.from('users').update({ phone }).eq('email', email)
        } catch(e) {}
      }

      if (result.error) {
        if (result.error.toLowerCase().includes('already exist')) {
           setError('Account with this email already exists. If not verified, try to log in to request a verification code.')
        } else {
           setError(result.error)
        }
      } else {
        // If signup was successful, proceed to verification step
        setShowVerification(true)
      }
    } catch (err: any) {
      setError(err?.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (otp.length < 6) {
      setError('Please enter a valid OTP code')
      return
    }

    setLoading(true)

    try {
      const result = await verifyEmail(email, otp)
      if (result.error) {
        setError(result.error)
      } else {
        // Verification successful, navigate to app
        navigate('/prediction')
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed')
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
            
            {showVerification ? (
              // Verification Form
              <>
                <button 
                  onClick={() => setShowVerification(false)}
                  className="mb-6 flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft size={16} className="mr-1" /> Back
                </button>
                
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Verify your email</h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                    We've sent a code to <span className="font-semibold">{email}</span>
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerifySubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex justify-center">Enter Code</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={6}
                      placeholder="123456"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all text-center text-2xl tracking-widest font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 size={18} className="animate-spin" /> Verifying...</>
                    ) : (
                      'Verify Account'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => resendOtp(email)}
                    className="w-full mt-2 py-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Didn't get a code? Resend
                  </button>
                </form>
              </>
            ) : (
              // Signup Form
              <>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create an account</h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Get started with Pothole AI</p>
                </div>

                {error && (
                  <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}
                
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
                  Sign up with Google
                </button>
                
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">Or continue with</span>
                  </div>
                </div>

                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Your name"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all"
                    />
                  </div>

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
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex justify-between">
                       <span>Phone Number</span>
                       <span className="text-slate-400 font-normal">Optional</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
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
                      placeholder="At least 8 characters"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 size={18} className="animate-spin" /> Creating account...</>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                    Sign in
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
