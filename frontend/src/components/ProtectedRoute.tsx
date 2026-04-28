import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/NeonAuthContext'
import { useEffect, useState } from 'react'
import { getUserById } from '../api/neon'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRoleLoading(false)
        return
      }

      try {
        const { data } = await getUserById(user.id)
        setUserRole(data?.role || null)
      } catch (error) {
        console.error('Error fetching user role:', error)
      } finally {
        setRoleLoading(false)
      }
    }

    fetchUserRole()
  }, [user])

  if (loading || roleLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  if (!user) return <Navigate to="/login" replace />

  // Check role if required
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
