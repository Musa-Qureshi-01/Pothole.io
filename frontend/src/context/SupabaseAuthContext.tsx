import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type User = any

const AuthContext = createContext<{ user: User | null; loading: boolean; signIn: any; signOut: any }>({
  user: null,
  loading: true,
  signIn: async () => { },
  signOut: async () => { },
})

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        }
        setUser(session?.user ?? null)
        setLoading(false)
      } catch (err) {
        console.error('Failed to get session:', err)
        setLoading(false)
      }
    }

    getInitialSession()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Aggressively fetch profile to ensure name and role display
    if (user) {
      const ensureUserProfile = async () => {
        // If metadata name/role is missing or we just want to sync with DB
        const { data } = await supabase
          .from('users')
          .select('name, role')
          .eq('id', user.id)
          .single()

        if (data) {
          // Update local state to reflect the DB name/role immediately
          setUser((prev: any) => {
            if (!prev) return prev;
            // Only update if something changed to avoid render loops
            if (prev.user_metadata?.name === data.name && prev.user_metadata?.role === data.role) {
              return prev;
            }
            return {
              ...prev,
              user_metadata: {
                ...prev.user_metadata,
                name: data.name,
                role: data.role
              }
            };
          });
        }
      };

      ensureUserProfile();
    }

    // Cleanup subscription
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [user?.id]) // specific dependency on user.id to avoid infinite loop when updating user object

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        console.error('Sign in error:', error)
      } else {
        setUser(data.user)
      }
      return error
    } catch (err) {
      console.error('Sign in exception:', err)
      return err
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
