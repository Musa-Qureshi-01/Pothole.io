import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { neonClient } from '../lib/neonClient'

interface NeonUser {
  id: string
  email: string
  name: string
  image?: string | null
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

interface AuthContextValue {
  user: NeonUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string; needsVerification?: boolean }>
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string; needsVerification?: boolean }>
  verifyEmailOtp: (email: string, otp: string) => Promise<{ error?: string }>
  resendVerificationCode: (email: string) => Promise<{ error?: string }>
  signInWithGoogle: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  verifyEmailOtp: async () => ({}),
  resendVerificationCode: async () => ({}),
  signInWithGoogle: () => {},
  signOut: async () => {},
})

const getAuthCallbackUrl = () => '/auth/callback'
const getAuthErrorUrl = () => '/login'

const getAuthErrorMessage = (fallback: string, message?: string) => {
  const normalized = (message || '').toLowerCase()
  if (normalized.includes('invalid origin') || normalized.includes('origin')) {
    return 'This app domain is not allowed in Neon Auth. Add the current site URL to Neon Auth trusted origins.'
  }
  return message || fallback
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<NeonUser | null>(() => {
    const saved = localStorage.getItem('neon_user')
    if (saved) {
      try { return JSON.parse(saved) } catch(e) {}
    }
    return null
  })
  const [loading, setLoading] = useState(true)

  const checkSession = useCallback(async () => {
    try {
      const result = await neonClient.auth.getSession()
      if (result.data?.session && result.data?.user) {
        setUser(result.data.user as unknown as NeonUser)
        localStorage.setItem('neon_user', JSON.stringify(result.data.user))
      } else {
        setUser(null)
        localStorage.removeItem('neon_user')
      }
    } catch (err) {
      console.error('Session check failed:', err)
      setUser(null)
      localStorage.removeItem('neon_user')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  const signIn = async (email: string, password: string) => {
    try {
      const result = await neonClient.auth.signIn.email({
        email,
        password,
        callbackURL: getAuthCallbackUrl(),
      })
      if (result.error) {
        const msg = (result.error.message || 'Sign in failed').toLowerCase()
        if (msg.includes('verif') || msg.includes('not verified') || msg.includes('email_not_verified')) {
          return { error: 'Please verify your email first. Check your inbox for the verification code or link.', needsVerification: true }
        }
        return { error: getAuthErrorMessage('Sign in failed', result.error.message) }
      }
      await checkSession()

      // Check if session user is unverified
      try {
        const sessionResult = await neonClient.auth.getSession()
        const sessionUser = sessionResult.data?.user as (NeonUser & { emailVerified?: boolean }) | undefined
        if (sessionUser && sessionUser.emailVerified === false) {
          return { needsVerification: true }
        }
      } catch (e) {
        // Fall back to normal login
      }

      return {}
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase()
      if (msg.includes('verif') || msg.includes('not verified') || msg.includes('email_not_verified')) {
        return { error: 'Please verify your email first. Check your inbox for the verification code or link.', needsVerification: true }
      }
      return { error: getAuthErrorMessage('Sign in failed', err?.message) }
    }
  }

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const result = await neonClient.auth.signUp.email({
        name,
        email,
        password,
        callbackURL: getAuthCallbackUrl(),
      })
      if (result.error) {
        return { error: getAuthErrorMessage('Sign up failed', result.error.message) }
      }
      // After signup, check if email verification is needed
      const sessionResult = await neonClient.auth.getSession()
      if (sessionResult.data?.session && sessionResult.data?.user) {
        setUser(sessionResult.data.user as unknown as NeonUser)
        localStorage.setItem('neon_user', JSON.stringify(sessionResult.data.user))
        if ((sessionResult.data.user as any).emailVerified === false) {
          return { needsVerification: true }
        }
        return {}
      } else {
        // Account created but no session = verification email sent
        return { needsVerification: true }
      }
    } catch (err: any) {
      return { error: getAuthErrorMessage('Sign up failed', err?.message) }
    }
  }

  const verifyEmailOtp = async (email: string, otp: string) => {
    const cleanedOtp = otp.replace(/\s/g, '')
    if (!cleanedOtp) {
      return { error: 'Enter the verification code from your email.' }
    }

    try {
      const result = await (neonClient.auth as any).emailOtp.verifyEmail({
        email,
        otp: cleanedOtp,
      })

      if (result.error) {
        return { error: result.error.message || 'Invalid or expired verification code.' }
      }

      await checkSession()

      const sessionResult = await neonClient.auth.getSession()
      if (sessionResult.data?.session && sessionResult.data?.user) {
        setUser(sessionResult.data.user as unknown as NeonUser)
        localStorage.setItem('neon_user', JSON.stringify(sessionResult.data.user))
        return {}
      }

      const verifiedUser = result.data?.user
      if (verifiedUser) {
        setUser(verifiedUser as unknown as NeonUser)
        localStorage.setItem('neon_user', JSON.stringify(verifiedUser))
      }

      return {}
    } catch (err: any) {
      return { error: err?.message || 'Unable to verify the code. Please try again.' }
    }
  }

  const resendVerificationCode = async (email: string) => {
    try {
      const result = await (neonClient.auth as any).emailOtp.sendVerificationOtp({
        email,
        type: 'email-verification',
      })

      if (result.error) {
        return { error: result.error.message || 'Unable to resend verification code.' }
      }

      return {}
    } catch (err: any) {
      return { error: err?.message || 'Unable to resend verification code.' }
    }
  }

  const signInWithGoogle = async () => {
    try {
      await neonClient.auth.signIn.social({
        provider: 'google',
        callbackURL: getAuthCallbackUrl(),
        newUserCallbackURL: getAuthCallbackUrl(),
        errorCallbackURL: getAuthErrorUrl(),
      })
    } catch (err) {
      console.error('Google Auth Failed', err)
    }
  }

  const signOut = async () => {
    try {
      await neonClient.auth.signOut()
    } catch (err) {
      console.error('Sign out error:', err)
    } finally {
      setUser(null)
      localStorage.removeItem('neon_user')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, verifyEmailOtp, resendVerificationCode, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
