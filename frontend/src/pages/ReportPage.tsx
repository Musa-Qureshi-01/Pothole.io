import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePredictions } from '../context/PredictionsContext';
import { downloadReportAsPDF, downloadReportAsJSON } from '../lib/report';
import { generateAIReportWithManus } from '../lib/aiServices';
import { AIMetrics } from '../components/AIMetrics';
import { useAuth } from '../context/NeonAuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { FileText, Download, Share2, Send, Loader2, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { updateLeaderboard, updateReport } from '../api/reports';
import { ensureAppUser } from '../api/neon';

export function ReportPage() {
  const { predictions } = usePredictions();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(predictions[0]?.id ?? null);
  const [complaint, setComplaint] = useState('');
  const [userName, setUserName] = useState('Demo User');
  const [generated, setGenerated] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selected = predictions.find((p) => p.id === selectedId);
  const canGenerate = selected != null && !isGenerating;

  const handleGenerate = async () => {
    if (!selected) return;

    setIsGenerating(true);
    setError(null);
    setGenerated(null);

    try {
      // Capture location only when the user explicitly generates the AI report.
      let location = selected.location
      if (!location && navigator.geolocation) {
        location = await new Promise<{ lat: number; lng: number } | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => resolve(null),
            { enableHighAccuracy: true, timeout: 4000, maximumAge: 60000 }
          )
        })
      }

      const safeLocation = location || { lat: 0, lng: 0 }

      const severityUi = selected.isPothole && selected.metrics?.area_ratio != null
        ? selected.metrics.area_ratio >= 0.15 ? 'High' : selected.metrics.area_ratio >= 0.05 ? 'Medium' : 'Low'
        : 'N/A';

      const report = await generateAIReportWithManus(
        complaint,
        severityUi,
        safeLocation,
        selected
      );

      // Persist to Neon (if we have a DB report row id).
      if (selected.reportId && user) {
        const severityDb =
          severityUi === 'High' ? 'high' :
          severityUi === 'Medium' ? 'medium' :
          severityUi === 'Low' ? 'low' :
          'low'

        await updateReport(selected.reportId, {
          complaintText: complaint,
          aiSummary: JSON.stringify(report),
          severity: severityDb,
          metrics: selected.metrics,
          latitude: safeLocation.lat,
          longitude: safeLocation.lng,
        })

        const { data: appUser } = await ensureAppUser(user)

        if (appUser?.id) {
          await updateLeaderboard(appUser.id)
        }
      }

      setGenerated({
        report,
        summary: report.summary,
        severityExplanation: `Risk Level: ${report.riskLevel || 'Unknown'}. ${report.civicImpact || ''}`,
        suggestedAction: report.recommendedAction || 'Review required',
        severityLevel: severityUi
      });
    } catch (err) {
      console.error("Failed to generate report:", err);
      setError("Failed to generate AI report. Please check your connection and API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const shareableLink = generated
    ? `${window.location.origin}/report?ref=${selectedId}&t=${Date.now()}`
    : '';

  const copyLink = () => {
    if (!shareableLink) return;
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Toast state
  const [showToast, setShowToast] = useState(false);

  const sendToAdmin = () => {
    // In a real app, this would send data to backend
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-6xl mx-auto"
    >
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Report Generation</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
          Create professional, AI-enhanced reports for infrastructure maintenance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
              <CardDescription>Select a detection and add context.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Reporter Name</label>
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Detection</label>
                <select
                  value={selectedId ?? ''}
                  onChange={(e) => { setSelectedId(e.target.value || null); setGenerated(null); }}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">— Select a detection —</option>
                  {predictions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {new Date(p.timestamp).toLocaleDateString()} — {p.isPothole ? 'Detected Issue' : 'No Issue'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Observations / Notes</label>
                <textarea
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder="e.g. Large pothole on 100ft Road, Indiranagar. Causing slow traffic and potential hazard for two-wheelers..."
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : 'Generate AI Report'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-7">
          {!generated ? (
            <Card className="h-full flex items-center justify-center min-h-[400px] border-dashed">
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Report Generated</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Select a detection from the list and click generate to view the AI analysis.
                </p>
              </div>
            </Card>
          ) : (
            <Card className="border-emerald-100 dark:border-emerald-900/30 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-cyan-500" />
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">AI Analysis Result</CardTitle>
                    <CardDescription>Generated on {new Date().toLocaleDateString()}</CardDescription>
                  </div>
                  <Badge variant={
                    generated.severityLevel === 'High' ? 'destructive' :
                      generated.severityLevel === 'Medium' ? 'warning' : 'success'
                  }>
                    {generated.severityLevel} Severity
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* AI Metrics Block */}
                {selected && (
                  <div className="mb-6">
                    <AIMetrics
                      confidence={selected.confidence}
                      area_pixels={selected.metrics?.area_pixels ?? undefined}
                      area_ratio={selected.metrics?.area_ratio ?? undefined}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold uppercase text-slate-500 tracking-wider">Executive Summary</h4>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                    {generated.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                      <Info size={14} /> Risk Assessment
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {generated.severityExplanation}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                      <CheckCircle2 size={14} /> Recommended Action
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {generated.suggestedAction}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold uppercase text-slate-500 tracking-wider">Civic Impact</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {generated.report?.civicImpact || '—'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold uppercase text-slate-500 tracking-wider">Field Checklist</h4>
                    <ul className="text-sm text-slate-700 dark:text-slate-300 list-disc pl-5 space-y-1">
                      {(generated.report?.fieldChecklist || []).slice(0, 6).map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                      {(!generated.report?.fieldChecklist || generated.report.fieldChecklist.length === 0) && (
                        <li className="text-slate-500">—</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold uppercase text-slate-500 tracking-wider">Timeline</h4>
                  <div className="space-y-3">
                    {(generated.report?.timeline || []).slice(0, 4).map((t: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {t?.phase || 'Phase'} <span className="font-normal text-slate-500">· {t?.when || ''}</span>
                        </p>
                        <ul className="text-sm text-slate-700 dark:text-slate-300 list-disc pl-5 mt-2 space-y-1">
                          {(t?.actions || []).slice(0, 6).map((a: string, aIdx: number) => (
                            <li key={aIdx}>{a}</li>
                          ))}
                          {(t?.actions || []).length === 0 && (
                            <li className="text-slate-500">—</li>
                          )}
                        </ul>
                      </div>
                    ))}
                    {(!generated.report?.timeline || generated.report.timeline.length === 0) && (
                      <p className="text-sm text-slate-500">—</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold uppercase text-slate-500 tracking-wider">Assumptions</h4>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 list-disc pl-5 space-y-1">
                    {(generated.report?.assumptions || []).slice(0, 6).map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                    {(!generated.report?.assumptions || generated.report.assumptions.length === 0) && (
                      <li className="text-slate-500">—</li>
                    )}
                  </ul>
                </div>
              </CardContent>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-3">
                <Button size="sm" variant="outline" onClick={() => downloadReportAsPDF(selected!)}>
                  <Download className="w-4 h-4 mr-2" /> PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => downloadReportAsJSON(selected!)}>
                  <FileText className="w-4 h-4 mr-2" /> JSON
                </Button>
                <Button size="sm" variant="outline" onClick={copyLink}>
                  <Share2 className="w-4 h-4 mr-2" /> {copied ? 'Copied' : 'Share'}
                </Button>
                <Button size="sm" onClick={sendToAdmin} className="ml-auto bg-emerald-600 text-white hover:bg-emerald-700">
                  <Send className="w-4 h-4 mr-2" /> Submit
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
      {/* Custom Toast Notification */}
      {
        showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 z-50 bg-slate-900 dark:bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border border-slate-700"
          >
            <div className="bg-emerald-500 rounded-full p-1">
              <CheckCircle2 size={16} className="text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Report Submitted Successfully</h4>
              <p className="text-xs text-slate-400">Notified local municipal authority.</p>
            </div>
          </motion.div>
        )
      }
    </motion.div >
  );
}
