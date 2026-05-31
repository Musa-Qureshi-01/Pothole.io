import { motion } from 'framer-motion';
import { Building2, IndianRupee, Clock, AlertCircle, Wrench, Sparkles, ShieldCheck } from 'lucide-react';
import { computeSeverity } from './SeverityBadge';
import type { SeverityLevel } from './SeverityBadge';

interface AuthorityCopilotCardProps {
  areaRatio?: number;
  severity?: SeverityLevel;
}

const COPILOT_CONFIG: Record<SeverityLevel, {
  authority: string;
  priority: string;
  costRange: string;
  eta: string;
  recs: string[];
  alertStyle: string;
  badgeStyle: string;
}> = {
  critical: {
    authority: 'Public Works Department (PWD) - Emergency Task Force',
    priority: 'P1 (Critical - Emergency)',
    costRange: '₹35,000 - ₹55,000 (Base + Deep Milling)',
    eta: '12 to 24 Hours',
    recs: [
      'Deploy safety barricades and warning signs immediately.',
      'Perform deep excavation to inspect aggregate base course.',
      'Lay heavy-duty hot-mix asphalt (HMA) base and binder course.',
      'Compact with a 10-ton double-drum vibratory roller.'
    ],
    alertStyle: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300',
    badgeStyle: 'bg-red-600 text-white'
  },
  high: {
    authority: 'Municipal Road Infrastructure Corporation',
    priority: 'P2 (High Priority)',
    costRange: '₹22,000 - ₹35,000 (Base + Tack Coat)',
    eta: '48 Hours',
    recs: [
      'Schedule utility line clearance inspection.',
      'Mill the surface surrounding the defect to 50mm depth.',
      'Apply high-viscosity tack coat emulsion for optimal bonding.',
      'Compact dense-graded asphalt concrete (AC) surface overlay.'
    ],
    alertStyle: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900 text-orange-800 dark:text-orange-300',
    badgeStyle: 'bg-orange-600 text-white'
  },
  medium: {
    authority: 'Zonal Highway Maintenance Division',
    priority: 'P3 (Medium Priority)',
    costRange: '₹8,500 - ₹15,000 (Standard patching)',
    eta: '3 to 5 Days',
    recs: [
      'Clear dirt, loose aggregate, and water from cavity.',
      'Apply cold-mix polymer-modified asphalt patching compound.',
      'Compact composite mixture with mechanized plate tamper.',
      'Seal joints and borders with liquid asphalt emulsion.'
    ],
    alertStyle: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300',
    badgeStyle: 'bg-amber-600 text-white'
  },
  low: {
    authority: 'Municipal Patching & Local Crew',
    priority: 'P4 (Low Priority - Routine)',
    costRange: '₹2,500 - ₹5,000 (Surface Sealing)',
    eta: '7 to 10 Days',
    recs: [
      'Clean hairline fractures and surface distress.',
      'Inject rubberized asphalt crack sealant.',
      'Conduct routine bi-weekly inspections to monitor expansion.',
      'No immediate structural intervention required.'
    ],
    alertStyle: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 text-green-800 dark:text-green-300',
    badgeStyle: 'bg-green-600 text-white'
  }
};

export function AuthorityCopilotCard({ areaRatio, severity }: AuthorityCopilotCardProps) {
  const level = severity ?? (areaRatio !== undefined ? computeSeverity(areaRatio) : 'medium');
  const config = COPILOT_CONFIG[level];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
    >
      {/* Top Banner indicating Government AI Copilot System */}
      <div className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Building2 size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Authority Copilot
              <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full tracking-wider">
                <Sparkles size={10} /> GOV AI
              </span>
            </h3>
            <p className="text-xs text-slate-500">Autonomous infrastructure dispatch & resource estimation copilot</p>
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${config.badgeStyle}`}>
          {level}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Assigned Department</span>
            <p className="text-sm font-semibold text-slate-850 dark:text-slate-250 mt-1 leading-snug">{config.authority}</p>
          </div>

          <div className="bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Priority Level</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-semibold text-slate-850 dark:text-slate-250">{config.priority}</span>
            </div>
          </div>

          <div className="bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Estimated Cost</span>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <IndianRupee size={12} />
              </div>
              <span className="text-sm font-bold text-slate-850 dark:text-slate-250">{config.costRange}</span>
            </div>
          </div>

          <div className="bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Target ETA</span>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Clock size={12} />
              </div>
              <span className="text-sm font-bold text-slate-850 dark:text-slate-250">{config.eta}</span>
            </div>
          </div>
        </div>

        {/* Dispatch Action Plan */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
            <Wrench size={14} className="text-slate-400" />
            AI-Generated Maintenance Directives
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {config.recs.map((rec, index) => (
              <div
                key={index}
                className="flex items-start gap-2.5 bg-slate-50/40 dark:bg-slate-900/10 p-3 rounded-lg border border-slate-100 dark:border-slate-850"
              >
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Government Action Alert Banner */}
        <div className={`p-4 rounded-xl border flex gap-3 ${config.alertStyle}`}>
          {level === 'critical' || level === 'high' ? (
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck size={20} className="shrink-0 mt-0.5" />
          )}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider">Governance Mandate Directive</h5>
            <p className="text-xs mt-1 leading-relaxed">
              {level === 'critical'
                ? 'CRITICAL ALERT: Hazard exceeds safe urban threshold. Autonomic dispatch alert has been logged. Public works emergency barricades recommended within 3 hours.'
                : level === 'high'
                ? 'HIGH PRIORITY: Scheduled dispatch to zonal supervisor. Repair crew to clear utility permits. Ensure AC overlay is rolled with proper pavement cooling.'
                : level === 'medium'
                ? 'STANDARD SCHEDULE: Task added to local patching queue. Standard cold-mix patching with moisture-proofing seals recommended during night shift.'
                : 'MONITOR PROTOCOL: Defect is within minor tolerances. Road risk remains within safe civil bounds. No dispatch created.'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
