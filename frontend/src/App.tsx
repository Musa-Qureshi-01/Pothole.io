import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { PredictionsProvider } from './context/PredictionsContext'
import { Layout } from './components/Layout'
import { Chatbot } from './components/ChatBot'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Footer } from './components/Footer'
import { useAuth } from './context/SupabaseAuthContext'

// Lazy load pages for performance
const HomePage = lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })))
const PredictionPage = lazy(() => import('./pages/PredictionPage').then(module => ({ default: module.PredictionPage })))
const ReportPage = lazy(() => import('./pages/ReportPage').then(module => ({ default: module.ReportPage })))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage').then(module => ({ default: module.LeaderboardPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })))
const ContactPage = lazy(() => import('./pages/ContactPage').then(module => ({ default: module.ContactPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })))
const SignupPage = lazy(() => import('./pages/SignupPage').then(module => ({ default: module.SignupPage })))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })))
const WorkerTaskPage = lazy(() => import('./pages/WorkerTaskPage').then(module => ({ default: module.WorkerTaskPage })))

// Loading Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh] w-full">
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 text-sm font-medium animate-pulse">Loading...</p>
    </div>
  </div>
)

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Initializing App...</p>
        </div>
      </div>
    )
  }

  return (
    <PredictionsProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          {user ? (
            <>
              <Chatbot />
              <Routes>
                {/* Home Page: Full width, no Layout wrapper */}
                <Route path="/" element={<HomePage />} />

                {/* Dashboard Pages: Wrapped in Layout */}
                <Route
                  path="/*"
                  element={
                    <Layout>
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          <Route
                            path="/prediction"
                            element={
                              <ProtectedRoute>
                                <PredictionPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/report"
                            element={
                              <ProtectedRoute>
                                <ReportPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/leaderboard"
                            element={
                              <ProtectedRoute>
                                <LeaderboardPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/profile"
                            element={
                              <ProtectedRoute>
                                <ProfilePage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/admin"
                            element={
                              <ProtectedRoute requiredRole="admin">
                                <AdminDashboard />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/worker"
                            element={
                              <ProtectedRoute requiredRole="worker">
                                <WorkerTaskPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/contact" element={<ContactPage />} />
                          {/* Redirect login/signup to dashboard if already logged in */}
                          <Route path="/signup" element={<Navigate to="/prediction" />} />
                          {/* Catch-all for dashboard routes */}
                          <Route path="*" element={<Navigate to="/prediction" />} />
                        </Routes>
                      </Suspense>
                    </Layout>
                  }
                />
              </Routes>
            </>
          ) : (
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          )}
          <Footer />
        </Suspense>
      </BrowserRouter>
    </PredictionsProvider>
  )
}
