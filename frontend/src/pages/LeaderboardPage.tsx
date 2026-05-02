import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Flame, User, TrendingUp, MapPin, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { fetchLeaderboard } from '../api/neon';
import { useAuth } from '../context/NeonAuthContext';

type Period = 'monthly' | 'yearly';

const PERIODS: { value: Period; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const rankIcon = (rank: number) => {
  if (rank === 1) return Trophy;
  if (rank === 2) return Medal;
  if (rank === 3) return Award;
  return Flame;
};

const displayName = (entry: any, index: number, currentEmail?: string) => {
  if (entry.users?.email && entry.users.email === currentEmail) return `${entry.users?.name || 'You'} (You)`;
  return `Community member ${index + 1}`;
};

export function LeaderboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>('monthly');
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const month = period === 'monthly' ? new Date().toISOString().slice(0, 7) : undefined;
      const { data } = await fetchLeaderboard(month);
      if (!cancelled) {
        setLeaders(data || []);
        setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [period]);

  const stats = useMemo(() => {
    const totalReports = leaders.reduce((sum, row) => sum + (row.reports_count || 0), 0);
    const totalResolved = leaders.reduce((sum, row) => sum + (row.resolved_count || 0), 0);
    const resolutionRate = totalReports ? Math.round((totalResolved / totalReports) * 100) : 0;

    return [
      { label: 'Reports tracked', value: totalReports.toString(), icon: TrendingUp, color: 'text-blue-500' },
      { label: 'Resolution rate', value: `${resolutionRate}%`, icon: CheckCircle2, color: 'text-emerald-500' },
      { label: 'Active reporters', value: leaders.length.toString(), icon: User, color: 'text-amber-500' },
      { label: 'Coverage mode', value: period === 'monthly' ? 'This month' : 'All year', icon: MapPin, color: 'text-cyan-500' },
    ];
  }, [leaders, period]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Leaderboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Community impact, ranked by reports and resolved road issues. Personal identities stay private.
          </p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p.value
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {stats.map((stat) => (
          <motion.div variants={item} key={stat.label}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color} opacity-80`} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-slate-200 dark:ring-slate-800">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
          <CardTitle>Top Contributors</CardTitle>
          <CardDescription>Names are anonymized except for your own account.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">Loading leaderboard...</div>
          ) : leaders.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              No leaderboard entries yet. Submit a report to start building impact.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Rank</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Reporter</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Reports</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Resolved</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Impact Score</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {leaders.map((row, index) => {
                    const rank = index + 1;
                    const Icon = rankIcon(rank);
                    const score = row.score || 0;

                    return (
                      <motion.tr
                        key={`${row.user_id}-${row.month || 'all'}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-110 ${rank === 1 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-200' :
                            rank === 2 ? 'bg-slate-200 text-slate-700' :
                              rank === 3 ? 'bg-orange-100 text-orange-700' :
                                'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                            {rank}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                          {displayName(row, index, user?.email)}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{row.reports_count || 0}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{row.resolved_count || 0}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, score)}%` }}
                                transition={{ duration: 0.8, delay: 0.2 + index * 0.05 }}
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                              />
                            </div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{score}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <Icon size={12} className="text-emerald-500" />
                            {rank <= 3 ? 'Top impact' : 'Contributor'}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
