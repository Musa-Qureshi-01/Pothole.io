import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PredictionPage as OriginalPredictionPage } from './PredictionPage'
import { useAuth } from '../context/NeonAuthContext'
import { updateLeaderboard, updateReport } from '../api/reports'
import { generateAIReport } from '../lib/gemini'
import { usePredictions } from '../context/PredictionsContext'
import { createUser, getUserByEmail } from '../api/neon'

export const EnhancedPredictionPage = () => {
  const { user } = useAuth()
  const { predictions } = usePredictions()
  const [showReportForm, setShowReportForm] = useState(false)
  const [severity, setSeverity] = useState('medium')
  const [complaintText, setComplaintText] = useState('')
  const [reportLoading, setReportLoading] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)

  const latestPrediction = predictions[0]
  const canSubmit = Boolean(user && latestPrediction?.reportId)

  const resolvedSeverity = useMemo(() => {
    // The DB schema uses lowercase severities.
    const s = (severity || '').toLowerCase()
    if (s === 'low' || s === 'medium' || s === 'high' || s === 'critical') return s
    return 'medium'
  }, [severity])

  const handleSubmitReport = async () => {
    if (!user) {
      alert('Please login to submit a report')
      return
    }
    if (!latestPrediction?.reportId) {
      alert('No DB report found for this prediction yet. Run detection first.')
      return
    }

    setReportLoading(true)

    try {
      // Use pre-captured location from prediction.
      const safeLocation = latestPrediction.location || { lat: 0, lng: 0 }
 
      // Generate AI report from the saved prediction.
      const aiReport = await generateAIReport(
        complaintText,
        resolvedSeverity,
        safeLocation,
        latestPrediction
      )

      // Ensure we can update the leaderboard by attaching to the correct `users.id`.
      // Like PredictionPage, we resolve the DB user by email.
      const { data: existingUser } = await getUserByEmail(user.email)
      const dbUserId =
        existingUser?.id ||
        (await createUser({
          email: user.email,
          name: user.name || user.email.split('@')[0],
          role: 'citizen',
        }))?.data?.id

      if (!dbUserId) {
        throw new Error('Failed to resolve user record for report persistence.')
      }

      await updateReport(latestPrediction.reportId, {
        complaintText,
        aiSummary: JSON.stringify(aiReport),
        severity: resolvedSeverity,
        metrics: latestPrediction.metrics,
        latitude: safeLocation.lat,
        longitude: safeLocation.lng,
        // Keep status as pending until admin/worker updates it.
      })

      // Update leaderboard using DB user id.
      await updateLeaderboard(dbUserId)

      setReportSuccess(true)
      setTimeout(() => {
        setReportSuccess(false)
        setComplaintText('')
        setSeverity('medium')
        setShowReportForm(false)
      }, 3000)
    } catch (error: any) {
      alert('Error submitting report: ' + error.message)
    } finally {
      setReportLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <OriginalPredictionPage />

      {/* Open report form for the latest detection */}
      {!showReportForm && latestPrediction?.reportId && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-glass border border-slate-200/50 dark:border-slate-700/50"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Generate AI Report</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Add context and we will create a structured, municipality-ready report.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowReportForm(true)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              Write & Submit
            </button>
          </div>
        </motion.div>
      )}

      {/* Report Submission Form */}
      {showReportForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-glass border border-slate-200/50 dark:border-slate-700/50"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Submit Pothole Report</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Severity Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
              <textarea
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Describe the pothole condition, traffic impact, etc."
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmitReport}
                disabled={reportLoading || !complaintText || !canSubmit}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-50"
              >
                {reportLoading ? 'Submitting...' : 'Submit Report'}
              </button>
              <button
                onClick={() => setShowReportForm(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {reportSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
             <span className="text-xl">✓</span>
             <span className="font-medium">Report submitted successfully! Admins will review it shortly.</span>
          </div>
          <button
            onClick={async () => {
              const { downloadReportAsPDF } = await import('../lib/report');
              downloadReportAsPDF(latestPrediction);
            }}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
          >
            Download Report PDF
          </button>
        </motion.div>
      )}
    </div>
  )
}
