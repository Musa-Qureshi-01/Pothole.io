import { Badge } from './ui/Badge';
import { AlertTriangle, ShieldAlert, ShieldCheck, Info } from 'lucide-react';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

interface SeverityBadgeProps {
  /** Pass area_ratio (0–1) to auto-compute severity, OR pass severity directly */
  areaRatio?: number;
  severity?: SeverityLevel;
  /** Show a larger badge with icon (for detail views) */
  size?: 'sm' | 'md';
  className?: string;
}

const SEVERITY_CONFIG = {
  low: {
    label: 'LOW',
    variant: 'severity_low' as const,
    icon: ShieldCheck,
    dot: 'bg-green-500',
  },
  medium: {
    label: 'MEDIUM',
    variant: 'severity_medium' as const,
    icon: Info,
    dot: 'bg-amber-500',
  },
  high: {
    label: 'HIGH',
    variant: 'severity_high' as const,
    icon: AlertTriangle,
    dot: 'bg-orange-500',
  },
  critical: {
    label: 'CRITICAL',
    variant: 'severity_critical' as const,
    icon: ShieldAlert,
    dot: 'bg-red-500',
  },
};

export function computeSeverity(areaRatio: number): SeverityLevel {
  if (areaRatio > 0.05) return 'critical';
  if (areaRatio > 0.02) return 'high';
  if (areaRatio > 0.005) return 'medium';
  return 'low';
}

export function SeverityBadge({ areaRatio, severity, size = 'sm', className = '' }: SeverityBadgeProps) {
  const rawLevel = severity ?? (areaRatio !== undefined ? computeSeverity(areaRatio) : 'medium');
  const level = (typeof rawLevel === 'string' ? rawLevel.toLowerCase() : 'medium') as SeverityLevel;
  const config = SEVERITY_CONFIG[level] || SEVERITY_CONFIG.medium;
  const Icon = config.icon;

  if (size === 'md') {
    return (
      <Badge variant={config.variant} className={`gap-1.5 px-3 py-1 text-xs font-bold tracking-wide ${className}`}>
        <span className={`relative flex h-2 w-2`}>
          {(level === 'critical' || level === 'high') && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dot} opacity-75`} />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
        </span>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </Badge>
    );
  }

  return (
    <Badge variant={config.variant} className={`gap-1 text-[10px] font-bold tracking-wider ${className}`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </Badge>
  );
}
