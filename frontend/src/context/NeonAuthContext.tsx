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
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string }>
  verifyEmail: (email: string, otp: string) => Promise<{ error?: string }>
  resendOtp: (email: string) => Promise<{ error?: string }>
  signInWithGoogle: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  verifyEmail: async () => ({}),
  resendOtp: async () => ({}),
  signInWithGoogle: () => {},
  signOut: async () => {},
})

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
      const result = await neonClient.auth.signIn.email({ email, password })
      if (result.error) {
        return { error: result.error.message || 'Sign in failed' }
      }
      await checkSession()
      return {}
    } catch (err: any) {
      return { error: err?.message || 'Sign in failed' }
    }
  }

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const result = await neonClient.auth.signUp.email({ name, email, password })
      if (result.error) {
        return { error: result.error.message || 'Sign up failed' }
      }
      await checkSession()
      return {}
    } catch (err: any) {
      return { error: err?.message || 'Sign up failed' }
    }
  }

  const verifyEmail = async (email: string, otp: string) => {
    try {
      const result = await neonClient.auth.emailOtp.verifyEmail({ email, otp })
      if (result.error) {
        return { error: result.error.message || 'Verification failed' }
      }
      await checkSession()
      return {}
    } catch (err: any) {
      return { error: err?.message || 'Verification failed' }
    }
  }

  const resendOtp = async (email: string) => {
    try {
      const result = await neonClient.auth.emailOtp.sendVerificationOtp({ email, type: "email-verification" })
      if (result?.error) {
        return { error: result.error.message || 'Failed to send OTP' }
      }
      return {}
    } catch (err: any) {
      return { error: err?.message || 'Failed to send OTP' }
    }
  }

  const signInWithGoogle = async () => {
    try {
      await neonClient.auth.signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/prediction`
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
    <AuthContext.Provider value={{ user, loading, signIn, signUp, verifyEmail, resendOtp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
