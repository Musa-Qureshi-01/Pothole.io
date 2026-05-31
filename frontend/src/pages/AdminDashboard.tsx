import { useEffect, useState } from 'react'
import { fetchAllReports, updateReportStatus as updateReportStatusNeon } from '../api/neon'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { CheckCircle2, Clock, Calendar, Search, Filter, User, ChevronRight, MapPin, AlertTriangle } from 'lucide-react'
import { SeverityBadge } from '../components/SeverityBadge'

// ─── DEMO DATA ────────────────────────────────────────────────────────────────
// Shown when Neon DB returns no records (unauthenticated / demo mode).
const DEMO_REPORTS = [
  {
    id: 'demo-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    severity: 'Critical',
    status: 'pending',
    latitude: 28.6139,
    longitude: 77.2090,
    complaint_text: 'Large deep pothole (~40 cm wide, 15 cm deep) in the middle of the main carriageway. Multiple vehicles have already suffered tyre damage. Urgent repair required before further accidents occur.',
    ai_summary: 'AI analysis detects a high-density pothole cluster with a surface damage ratio of 0.74. Structural integrity of the sub-base appears compromised. Recommend emergency patching with bituminous macadam followed by surface dressing within 24 hours. NHAI NH-44 zone — escalate to PWD Cell immediately.',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    metrics: { damage_ratio: 0.74, confidence: 0.91 },
  },
  {
    id: 'demo-b2c3d4e5-f6a7-8901-bcde-f12345678901',
    severity: 'High',
    status: 'assigned',
    latitude: 19.0760,
    longitude: 72.8777,
    complaint_text: 'Severe cracking and rutting on NH-8 near the flyover junction. Road surface has subsided by approximately 8 cm causing vehicles to veer suddenly.',
    ai_summary: 'AI detects longitudinal cracking pattern consistent with fatigue failure. Damage ratio 0.58. Recommend mill-and-fill resurfacing across 120 m stretch. Estimated repair cost: ₹4.2 Lakhs. PWD Mumbai West Division assigned. ETA: 48 hours.',
    image_url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&q=80',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    metrics: { damage_ratio: 0.58, confidence: 0.87 },
  },
  {
    id: 'demo-c3d4e5f6-a7b8-9012-cdef-123456789012',
    severity: 'Medium',
    status: 'pending',
    latitude: 12.9716,
    longitude: 77.5946,
    complaint_text: 'Multiple potholes and edge-breaking along the service road running parallel to Outer Ring Road, Bengaluru. Pedestrians and two-wheelers at high risk.',
    ai_summary: 'Moderate surface deterioration detected with damage ratio 0.41. Alligator cracking visible across 60% of scanned area. Recommended action: cold-mix patching as immediate fix, followed by hot-mix overlay within 30 days. BBMP Ward 149 — assign to Zone 3 crew.',
    image_url: 'https://images.unsplash.com/photo-1473091534298-04dcbce3278c?w=600&q=80',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    metrics: { damage_ratio: 0.41, confidence: 0.82 },
  },
  {
    id: 'demo-d4e5f6a7-b8c9-0123-defa-234567890123',
    severity: 'Low',
    status: 'fixed',
    latitude: 22.5726,
    longitude: 88.3639,
    complaint_text: 'Minor surface cracking on the left shoulder of VIP Road near airport. Not causing immediate danger but should be monitored.',
    ai_summary: 'Early-stage hairline cracking detected. Damage ratio 0.18. No immediate structural risk. Preventive crack-sealing treatment recommended. KMC Road Division — estimated cost ₹35,000. Scheduled for next maintenance cycle.',
    image_url: 'https://images.unsplash.com/photo-1504711331083-9c895941bf81?w=600&q=80',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    metrics: { damage_ratio: 0.18, confidence: 0.79 },
  },
  {
    id: 'demo-e5f6a7b8-c9d0-1234-efab-345678901234',
    severity: 'High',
    status: 'pending',
    latitude: 17.3850,
    longitude: 78.4867,
    complaint_text: 'Deep pothole near Hitech City junction causing major traffic disruption. Vehicle bottoming out frequently during peak hours.',
    ai_summary: 'Critical single-point failure detected with depth estimated at 18 cm. Damage ratio 0.63. Immediate danger to vehicles. GHMC Madhapur zone — priority dispatch required within 6 hours. Estimated repair: ₹1.8 Lakhs for full base reconstruction.',
    image_url: 'https://images.unsplash.com/photo-1597762117709-859f744b84c3?w=600&q=80',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    metrics: { damage_ratio: 0.63, confidence: 0.89 },
  },
  {
    id: 'demo-f6a7b8c9-d0e1-2345-fabc-456789012345',
    severity: 'Critical',
    status: 'assigned',
    latitude: 13.0827,
    longitude: 80.2707,
    complaint_text: 'Road completely washed out after monsoon rains on Anna Salai arterial road. 3-meter section collapsed into storm drain below.',
    ai_summary: 'Catastrophic structural failure — road base fully compromised over 3m length. Damage ratio 0.91. Requires emergency road closure and full reconstruction including storm drain reinforcement. CMDA Chennai Zone-2 — escalate to State Highway Authority. Estimated cost: ₹18.5 Lakhs.',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    metrics: { damage_ratio: 0.91, confidence: 0.95 },
  },
]

const DEMO_WORKERS = [
  { id: 'w1', name: 'Rajesh Kumar — PWD Crew Lead' },
  { id: 'w2', name: 'Suresh Patel — NHAI Field Engineer' },
  { id: 'w3', name: 'Anita Sharma — BBMP Road Inspector' },
  { id: 'w4', name: 'Mohammed Ali — Municipal Repair Team' },
]
// ─────────────────────────────────────────────────────────────────────────────

export const AdminDashboard = () => {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)

  const [workers, setWorkers] = useState<any[]>([])
  const [selectedWorker, setSelectedWorker] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const { data, error } = await fetchAllReports()
      if (!error && data && data.length > 0) {
        setReports(data)
        setWorkers([])
        setIsDemoMode(false)
      } else {
        // No real data — load demo data
        setReports(DEMO_REPORTS)
        setWorkers(DEMO_WORKERS)
        setIsDemoMode(true)
      }
    } catch {
      setReports(DEMO_REPORTS)
      setWorkers(DEMO_WORKERS)
      setIsDemoMode(true)
    }
    setLoading(false)
  }

  const updateReportStatus = async (reportId: string, status: string) => {
    if (isDemoMode) {
      // Local state update for demo
      setReports(prev =>
        prev.map(r => r.id === reportId ? { ...r, status } : r)
      )
      if (selectedReport?.id === reportId) {
        setSelectedReport((prev: any) => ({ ...prev, status }))
      }
      if (status === 'fixed') setSelectedReport(null)
      return
    }
    const { error } = await updateReportStatusNeon(reportId, status)
    if (!error) {
      fetchReports()
      if (status === 'fixed') setSelectedReport(null)
    }
  }

  const assignToWorker = async (reportId: string, workerId: string) => {
    if (!workerId) return alert('Please select a worker')
    await updateReportStatus(reportId, 'assigned')
    setSelectedReport(null)
    setSelectedWorker('')
  }

  const filteredReports = reports.filter(r => {
    const matchesSearch =
      !searchQuery ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.severity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.complaint_text?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || r.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  const stats = [
    { label: 'Total Reports', value: reports.length, icon: Calendar, color: 'text-slate-600' },
    { label: 'Pending', value: reports.filter((r) => r.status === 'pending').length, icon: Clock, color: 'text-amber-500' },
    { label: 'Assigned', value: reports.filter((r) => r.status === 'assigned').length, icon: User, color: 'text-blue-500' },
    { label: 'Resolved', value: reports.filter((r) => r.status === 'fixed').length, icon: CheckCircle2, color: 'text-emerald-500' }
  ]

  const formatTimeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">

      {/* ⚠️ DEMO BYPASS BANNER */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-orange-500/70 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-red-500/10 dark:from-orange-900/30 dark:via-amber-900/20 dark:to-red-900/20 p-4 shadow-lg shadow-orange-500/10">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_8px,rgba(251,146,60,0.07)_8px,rgba(251,146,60,0.07)_16px)]" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-orange-800 dark:text-orange-300 font-bold text-sm uppercase tracking-widest">
              {isDemoMode ? '🧪 Demo Mode — Showing Sample Data' : '⚠️ Demo Mode — Auth Bypassed · Live Data'}
            </p>
            <p className="text-orange-700/80 dark:text-orange-400/80 text-xs mt-0.5 leading-relaxed">
              {isDemoMode
                ? 'No live DB data found — displaying realistic mock reports so all features are fully interactive. Status changes, assignments, and filters all work in-memory.'
                : 'Authenticated admin access is bypassed for demo. Showing real DB data. Re-enable ProtectedRoute before production deployment.'}
            </p>
          </div>
          <span className="shrink-0 text-[10px] font-black uppercase tracking-widest bg-orange-500 text-white px-2.5 py-1.5 rounded-lg shadow-md">
            {isDemoMode ? 'MOCK DATA' : 'NOT FOR PROD'}
          </span>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Manage civic road reports and monitor infrastructure maintenance progress.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color} opacity-80`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: REPORT LIST */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Recent Reports</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Search..."
                      className="h-9 w-[160px] pl-8 bg-white dark:bg-slate-800"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select
                    className="h-9 rounded-md border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 px-2 text-sm text-slate-700 dark:text-slate-300"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="fixed">Resolved</option>
                  </select>
                  <Button variant="outline" size="sm"><Filter size={14} /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-3 font-medium text-slate-500 dark:text-slate-400">ID</th>
                      <th className="px-6 py-3 font-medium text-slate-500 dark:text-slate-400">Severity</th>
                      <th className="px-6 py-3 font-medium text-slate-500 dark:text-slate-400">Status</th>
                      <th className="px-6 py-3 font-medium text-slate-500 dark:text-slate-400">Location</th>
                      <th className="px-6 py-3 font-medium text-slate-500 dark:text-slate-400">Time</th>
                      <th className="px-6 py-3 font-medium text-slate-500 dark:text-slate-400 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                          <Search size={32} className="mx-auto mb-2 opacity-40" />
                          No reports match your filter.
                        </td>
                      </tr>
                    ) : filteredReports.map((report) => (
                      <tr
                        key={report.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer ${selectedReport?.id === report.id ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}
                        onClick={() => setSelectedReport(report)}
                      >
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">#{report.id.substring(5, 13)}</td>
                        <td className="px-6 py-4">
                          <SeverityBadge severity={report.severity} />
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                            report.status === 'fixed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                              : report.status === 'assigned'
                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                          }`}>
                            {report.status === 'fixed' ? '✓ Resolved' : report.status === 'assigned' ? '↗ Assigned' : '⏳ Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} />
                            {report.latitude?.toFixed(3)}, {report.longitude?.toFixed(3)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {report.created_at ? formatTimeAgo(report.created_at) : '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelectedReport(report) }}>
                            View <ChevronRight size={16} className="ml-1" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: DETAILS PANEL */}
        <div className="lg:col-span-1">
          {selectedReport ? (
            <Card className="sticky top-24 border-emerald-500/50 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle>Report Details</CardTitle>
                    <CardDescription className="font-mono text-xs">ID: #{selectedReport.id.substring(5, 13)}</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)}>✕</Button>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <SeverityBadge severity={selectedReport.severity} size="md" />
                  {selectedReport.metrics?.confidence && (
                    <span className="text-xs text-slate-500">
                      {Math.round(selectedReport.metrics.confidence * 100)}% confidence
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {selectedReport.image_url && (
                  <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={selectedReport.image_url} alt="Road Damage" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Damage Ratio Bar */}
                {selectedReport.metrics?.damage_ratio !== undefined && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500 font-medium">Surface Damage Ratio</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {(selectedReport.metrics.damage_ratio * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          selectedReport.metrics.damage_ratio > 0.7 ? 'bg-red-500' :
                          selectedReport.metrics.damage_ratio > 0.5 ? 'bg-orange-500' :
                          selectedReport.metrics.damage_ratio > 0.3 ? 'bg-amber-400' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${selectedReport.metrics.damage_ratio * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Citizen Complaint</h4>
                    <p className="text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 leading-relaxed">
                      {selectedReport.complaint_text}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">🤖 AI Analysis Summary</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {selectedReport.ai_summary}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                  <h4 className="font-semibold text-sm">Admin Actions</h4>

                  {/* Worker Assignment Section */}
                  {selectedReport.status !== 'fixed' && selectedReport.status !== 'assigned' && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Assign to Field Worker</label>
                      <div className="flex gap-2">
                        <select
                          className="flex-1 h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          value={selectedWorker}
                          onChange={(e) => setSelectedWorker(e.target.value)}
                        >
                          <option value="">Select Worker...</option>
                          {workers.map(w => (
                            <option key={w.id} value={w.id}>{w.name || w.email}</option>
                          ))}
                        </select>
                        <Button size="sm" onClick={() => assignToWorker(selectedReport.id, selectedWorker)}>Assign</Button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    {selectedReport.status === 'pending' && (
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                        onClick={() => updateReportStatus(selectedReport.id, 'assigned')}
                      >
                        Mark as Assigned
                      </Button>
                    )}
                    {selectedReport.status !== 'fixed' && (
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                        onClick={() => updateReportStatus(selectedReport.id, 'fixed')}
                      >
                        ✓ Mark Resolved
                      </Button>
                    )}
                    {selectedReport.status === 'fixed' && (
                      <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Issue Resolved</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full min-h-[300px] flex items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-center">
              <div>
                <Search size={48} className="mx-auto mb-4 opacity-50" />
                <p className="font-medium">Click any report row to view details</p>
                <p className="text-xs mt-1 opacity-70">Severity badge, AI summary & actions will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
