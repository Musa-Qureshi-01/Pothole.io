import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/NeonAuthContext'
import { useEffect, useState } from 'react'
import { ensureAppUser } from '../api/neon'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchUserRole = async () => {
      if (!user) {
        setRoleLoading(false)
        return
      }

      setRoleLoading(true)
      try {
        const { data: userRow, error } = await ensureAppUser(user)
        if (error) console.warn('User profile lookup failed:', error)
        if (!cancelled) setUserRole(userRow?.role || 'citizen')
      } catch (error) {
        console.error('Error fetching user role:', error)
        if (!cancelled) setUserRole('citizen')
      } finally {
        if (!cancelled) setRoleLoading(false)
      }
    }

    fetchUserRole()
    return () => {
      cancelled = true
    }
  }, [user])

  if (loading || roleLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  if (!user) return <Navigate to="/login" replace />

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
