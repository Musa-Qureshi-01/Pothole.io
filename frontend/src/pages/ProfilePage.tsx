import { useEffect, useState } from 'react'
import { getUserById, fetchUserReports, fetchLeaderboard } from '../api/neon'
import { useAuth } from '../context/NeonAuthContext'
import { User, Mail, Calendar, FileText, CheckCircle, Trophy, Loader2, AlertCircle, BarChart, Edit2, Clock, Phone, AlignLeft, Camera } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { motion } from 'framer-motion'

interface UserProfile {
  id: string
  email: string
  name: string
  role: 'citizen' | 'admin' | 'worker'
  created_at: string
  phone?: string
  bio?: string
  avatar_url?: string
}

interface UserStats {
  reportsSubmitted: number
  resolvedReports: number
  leaderboardScore: number
}

export const ProfilePage = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats>({
    reportsSubmitted: 0,
    resolvedReports: 0,
    leaderboardScore: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    if (!user) return

    const fetchProfileData = async () => {
      try {
        const { data: profileData } = await getUserById(user.id)
        
        // Merge Database profile with current Auth session 
        setProfile({
          id: user.id,
          name: profileData?.name || user.name || 'Citizen User',
          email: profileData?.email || user.email || 'No email attached',
          role: profileData?.role || 'citizen',
          created_at: profileData?.created_at || user.createdAt?.toISOString() || new Date().toISOString(),
          phone: profileData?.phone || '',
          bio: profileData?.bio || '',
          avatar_url: profileData?.avatar_url || user.image || ''
        })

        const { data: reportsData } = await fetchUserReports(user.id)
        const reportsCount = reportsData?.length || 0
        const resolvedCount = reportsData?.filter((r: any) => r.status === 'fixed').length || 0

        const { data: leaderboardData } = await fetchLeaderboard()
        const userScore = leaderboardData?.find((l: any) => l.user_id === user.id)?.score || 0

        setHistory(reportsData?.slice(0, 5) || [])

        setStats({
          reportsSubmitted: reportsCount,
          resolvedReports: resolvedCount,
          leaderboardScore: userScore,
        })
      } catch (err: any) {
        console.error('Error fetching profile:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [user])

  // Calculate Profile Completion
  const calculateCompletion = () => {
    if (!profile) return 0
    const fields = [
      profile.name,
      profile.email,
      profile.phone,
      profile.bio,
      profile.avatar_url
    ]
    const filledFields = fields.filter(f => f && f.length > 0).length
    return Math.round((filledFields / fields.length) * 100)
  }

  const completionPercent = calculateCompletion()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
          <p className="text-slate-500 font-medium text-sm">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
          <CardContent className="flex items-center gap-3 text-red-600 dark:text-red-400 p-6">
            <AlertCircle size={20} />
            <p className="font-medium">Error loading profile: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8 font-sans pb-10"
    >
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Profile Card */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-md">
            <div className="h-28 bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 relative">
               <button className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 backdrop-blur-md rounded-full text-white transition-colors">
                  <Camera size={16} />
               </button>
            </div>
            <CardContent className="relative pt-0 pb-6 px-6 flex flex-col items-center">
              <div className="-mt-14 mb-4">
                <div className="w-28 h-28 rounded-full bg-white dark:bg-slate-950 p-1.5 shadow-xl relative group">
                  <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 overflow-hidden relative">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : profile?.name ? (
                      <span className="text-4xl font-bold text-slate-700 dark:text-slate-300">{profile.name.charAt(0).toUpperCase()}</span>
                    ) : (
                      <User size={48} />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                       <Camera className="text-white" size={24} />
                    </div>
                  </div>
                </div>
              </div>

              <h1 className="text-xl font-bold text-slate-900 dark:text-white text-center flex items-center gap-2 justify-center mb-1">
                {profile?.name}
              </h1>
              
              <Badge variant={
                profile?.role === 'admin' ? 'destructive' :
                  profile?.role === 'worker' ? 'secondary' : 'success'
              } className="capitalize text-xs mb-4">
                {profile?.role} Account
              </Badge>
              
              <div className="w-full space-y-3 mt-4 text-sm">
                 <div className="flex items-center text-slate-600 dark:text-slate-300 gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <Mail size={16} className="text-emerald-500" />
                    <span className="truncate">{profile?.email}</span>
                 </div>
                 
                 <div className="flex items-center text-slate-600 dark:text-slate-300 gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <Calendar size={16} className="text-emerald-500" />
                    <span>Member since {new Date(profile?.created_at || '').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                 </div>
              </div>

              <Button className="w-full mt-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 gap-2">
                <Edit2 size={16} /> Edit Profile Data
              </Button>
            </CardContent>
          </Card>

          {/* Profile Completion Card */}
          <Card className="border-slate-200 dark:border-slate-800">
             <CardHeader className="pb-3">
                <CardTitle className="text-lg">Profile Completion</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="flex items-center gap-6">
                   <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                         <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
                         <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={`${2 * Math.PI * 36}`} strokeDashoffset={`${2 * Math.PI * 36 * (1 - completionPercent / 100)}`} className="text-emerald-500 transition-all duration-1000 ease-out" strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-lg font-bold text-slate-800 dark:text-slate-200">{completionPercent}%</span>
                   </div>
                   <div className="flex-1">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Enhance your profile to unlock more civic trust points!</p>
                      {completionPercent < 100 && (
                         <div className="flex flex-col gap-1.5 mt-3">
                            {!profile?.phone && <span className="text-xs font-medium text-amber-600 flex items-center gap-1.5"><AlertCircle size={12}/> Needs Phone number</span>}
                            {!profile?.bio && <span className="text-xs font-medium text-amber-600 flex items-center gap-1.5"><AlertCircle size={12}/> Needs Short bio</span>}
                            {!profile?.avatar_url && <span className="text-xs font-medium text-amber-600 flex items-center gap-1.5"><AlertCircle size={12}/> Needs Profile picture</span>}
                         </div>
                      )}
                   </div>
                </div>
             </CardContent>
          </Card>
        </div>

        {/* Right Column: Stats & Missing Info & Activity */}
        <div className="w-full lg:w-2/3 space-y-6">
          
          {/* Missing Info Prompt */}
          {completionPercent < 100 && (
             <Card className="border-dashed border-2 bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800/60 shadow-none">
                <CardHeader>
                   <CardTitle className="text-emerald-800 dark:text-emerald-300 text-lg flex items-center gap-2">
                       <ShieldCheck size={20} className="text-emerald-500" /> Personalize Your Experience
                   </CardTitle>
                   <CardDescription className="text-emerald-600/80 dark:text-emerald-400/80">Add more details to help the city understand your civic reports better.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2"><Phone size={12}/> Phone Number</label>
                      <input type="tel" placeholder="Add phone (Optional)" defaultValue={profile?.phone} className="w-full bg-transparent text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none border-b border-slate-200 dark:border-slate-800 pb-1 focus:border-emerald-500 transition-colors" />
                   </div>
                   <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2"><AlignLeft size={12}/> Short Bio</label>
                      <input type="text" placeholder="Add bio (Optional)" defaultValue={profile?.bio} className="w-full bg-transparent text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none border-b border-slate-200 dark:border-slate-800 pb-1 focus:border-emerald-500 transition-colors" />
                   </div>
                   <div className="col-span-1 md:col-span-2 flex justify-end mt-2">
                     <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">Save Details</Button>
                   </div>
                </CardContent>
             </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <FileText size={18} />
                  <p className="text-xs font-bold uppercase tracking-wider">Reports</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white leading-none mt-1">{stats.reportsSubmitted}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle size={18} />
                  <p className="text-xs font-bold uppercase tracking-wider">Fixed</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white leading-none mt-1">{stats.resolvedReports}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Trophy size={18} />
                  <p className="text-xs font-bold uppercase tracking-wider">Impact Score</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white leading-none mt-1">{stats.leaderboardScore}</p>
              </CardContent>
            </Card>
          </div>

          {/* Activity History */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart size={18} className="text-emerald-600" />
                Recent Report Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-slate-400" /></div>
              ) : history.length > 0 ? (
                <div className="space-y-3">
                  {history.map((item: any) => (
                    <div key={item.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                      <div className="flex items-start sm:items-center gap-4 mb-3 sm:mb-0">
                        <div className={`p-2.5 rounded-full shrink-0 ${item.status === 'fixed' ? 'bg-emerald-100 text-emerald-600' :
                          item.status === 'assigned' ? 'bg-blue-100 text-blue-600' :
                            'bg-amber-100 text-amber-600'
                          }`}>
                          {item.status === 'fixed' ? <CheckCircle size={18} /> :
                            item.status === 'assigned' ? <User size={18} /> :
                              <Clock size={18} />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base leading-tight">
                            {item.complaint_text || 'Pothole Report'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                            <Calendar size={12} /> {new Date(item.created_at).toLocaleDateString()}
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mx-1"></span>
                            <span className="capitalize">{item.severity} severity</span>
                          </p>
                        </div>
                      </div>
                      <Badge variant={item.status === 'fixed' ? 'success' : 'secondary'} className="self-start sm:self-auto uppercase tracking-wide text-[10px]">
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                     <FileText size={20} className="text-slate-400" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">No reports submitted yet</p>
                  <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">When you log potholes, they will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
        </div>
      </div>
    </motion.div>
  )
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
