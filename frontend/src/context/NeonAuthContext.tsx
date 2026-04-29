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
  signInWithGoogle: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
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
        const msg = (result.error.message || 'Sign in failed').toLowerCase()
        if (msg.includes('verif') || msg.includes('not verified') || msg.includes('email_not_verified')) {
          return { error: 'Please verify your email first. Check your inbox for the verification link.', needsVerification: true }
        }
        return { error: result.error.message || 'Sign in failed' }
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
        return { error: 'Please verify your email first. Check your inbox for the verification link.', needsVerification: true }
      }
      return { error: err?.message || 'Sign in failed' }
    }
  }

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const result = await neonClient.auth.signUp.email({ name, email, password })
      if (result.error) {
        return { error: result.error.message || 'Sign up failed' }
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
      return { error: err?.message || 'Sign up failed' }
    }
  }

  const signInWithGoogle = async () => {
    try {
      await neonClient.auth.signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/auth/callback`
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
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
