import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/NeonAuthContext'
import { useEffect, useState } from 'react'
import { createUser, getUserByEmail, getUserById } from '../api/neon'

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
        const userRow = data || (await getUserByEmail(user.email)).data
        if (userRow) setUserRole(userRow?.role || 'citizen')
        else {
          // User exists in auth but not in custom users table — auto-create by email.
          try {
            const { data: newUser } = await createUser({
              email: user.email,
              name: user.name || user.email.split('@')[0],
              role: 'citizen',
            })
            setUserRole(newUser?.role || 'citizen')
          } catch (createErr) {
            console.warn('Failed to auto-create user record:', createErr)
            setUserRole('citizen') // Default to citizen role
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
        setUserRole('citizen') // Default to citizen if query fails (e.g., 404 from API)
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
