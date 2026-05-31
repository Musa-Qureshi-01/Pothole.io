import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { SlidingBrandBar } from '../components/SlidingBrandBar';

import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../context/NeonAuthContext';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { CheckCircle2, ArrowRight, Zap, Target, TrendingUp, Users, BarChart3, Globe, Shield, Award, Camera, Microscope, Bot, ClipboardList, Wrench, Building2 } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/prediction', label: 'Prediction' },
  { to: '/report', label: 'Reports' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/profile', label: 'Profile' },
];

const STATS = [
  { value: 12, suffix: 'k+', label: 'Road Reports', icon: BarChart3 },
  { value: 94.2, suffix: '%', label: 'Detection Accuracy', icon: Target },
  { value: 48, suffix: '', label: 'Cities Monitored', icon: Globe },
  { value: 8.4, suffix: 'k+', label: 'Resolved Issues', icon: CheckCircle2 },
];

const STEPS = [
  { icon: Zap, title: 'Road Scan', desc: 'Capture road surface feed or upload inspection media' },
  { icon: Target, title: 'AI Surface Analysis', desc: 'Advanced YOLOv8 detects and segments defects automatically' },
  { icon: TrendingUp, title: 'Civic Action Plan', desc: 'AI Copilot generates professional, actionable engineering reports' },
  { icon: Users, title: 'Governance Closure', desc: 'Seamless handoff to municipal crews with tracking updates' },
];

export function HomePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 overflow-x-hidden flex flex-col font-sans">

      {/* ====== HERO SECTION ====== */}
      <section className="relative w-full min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">

        {/* Navbar inside Hero for seamless look */}
        <nav
          className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled
            ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 py-4 shadow-sm'
            : 'bg-transparent py-6'
            }`}
        >
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">


            <Link
              to="/"
              className="text-xl font-bold text-slate-900 dark:text-white tracking-tight shrink-0 flex items-center gap-2 group"
            >
              <Logo className="w-9 h-9 transition-transform group-hover:scale-110" />
              <span>RoadWatch AI</span>
            </Link>
            {/* Authenticated Navigation */}
            {user && (
              <div className="hidden lg:flex items-center gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors uppercase tracking-wider"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            <div className="ml-auto flex items-center gap-4 sm:ml-0">
              <ThemeToggle />
              {!user ? (
                <div className="flex items-center gap-4">
                  <Link
                    to="/login"
                    className="hidden h-10 items-center rounded-full px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white sm:inline-flex"
                  >
                    Sign In
                  </Link>
                  <Link to="/login">
                    <Button className="h-10 rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:bg-emerald-700 active:scale-95 sm:px-6">
                      Get Started
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="hidden lg:inline text-sm font-semibold text-slate-900 dark:text-white">
                    Hi, {user.name?.split(' ')[0] || 'User'}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm h-9 px-3"
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Background - Seamless */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.08)_1px,transparent_1px)] bg-[length:18px_18px] opacity-20 mix-blend-overlay"></div>
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent opacity-20" />

          <motion.div
            className="absolute top-[-20%] left-[20%] w-[35rem] h-[35rem] bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-[120px]"
            animate={{ y: [0, 30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 12, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-[10%] right-[10%] w-[30rem] h-[30rem] bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-[100px]"
            animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 15, repeat: Infinity, delay: 1 }}
          />
        </div>

        {/* Hero Content */}
        <div className="flex-grow flex items-center justify-center px-6 pt-32 pb-20 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-full mb-8 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">AI-Powered Road Intelligence</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.1] mb-8 text-slate-900 dark:text-white"
            >
              Building Smarter Cities,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400">
                One Road at a Time.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              AI-Powered Road Intelligence & Governance Platform. Detect, analyze, and monitor road quality in real time to streamline civic maintenance, manage budgets, and ensure public safety.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                onClick={() => navigate(user ? '/prediction' : '/login')}
                className="text-lg px-8 h-14 rounded-full shadow-xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white transition-all hover:scale-105"
              >
                Monitor Roads <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/report')}
                className="text-lg px-8 h-14 rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 text-slate-900 dark:text-white transition-all"
              >
                Explore Road Intelligence
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/contact')}
                className="text-lg px-8 h-14 rounded-full bg-transparent border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-600 dark:hover:border-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
              >
                Contact Support
              </Button>
            </motion.div>

            {/* Demo Admin Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="flex justify-center mt-4"
            >
              <button
                onClick={() => navigate('/admin')}
                className="group relative inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full border-2 border-orange-400/60 bg-orange-50/80 dark:bg-orange-950/30 dark:border-orange-500/50 text-orange-700 dark:text-orange-400 text-sm font-semibold hover:bg-orange-100 dark:hover:bg-orange-900/40 hover:border-orange-500 hover:scale-105 transition-all duration-200 shadow-md shadow-orange-200/40 dark:shadow-orange-900/20"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
                <span>Admin Dashboard</span>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-orange-500 text-white px-1.5 py-0.5 rounded-full ml-1">
                  Demo
                </span>
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-16 pt-8 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-slate-500 dark:text-slate-400"
            >
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Free Tier Available</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> API Access</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Mobile Ready</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====== STATS ====== */}
      <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 mb-4 text-emerald-600 dark:text-emerald-400 ring-1 ring-slate-100 dark:ring-slate-700">
                    <Icon size={24} />
                  </div>
                  <div className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-sm font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====== FEATURES ====== */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">Why Choose RoadWatch AI?</h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Our platform combines advanced computer vision, automated severity scoring, and predictive maintenance analysis to modernize road infrastructure monitoring and governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Target, title: 'AI Severity Scoring', desc: 'High-fidelity defect sizing and automated severity tiering for priority queue management.' },
            { icon: Zap, title: 'Authority Copilot', desc: 'AI-generated maintenance recommendations and civic impact reports with field worker guides.' },
            { icon: Users, title: 'Authority Assignment Workflow', desc: 'Seamless, automated handoffs between dispatchers, municipal supervisors, and repair crews.' },
            { icon: TrendingUp, title: 'Predictive Road Failure', desc: 'Pre-emptive forecasting of asphalt degradation using temporal satellite and physical monitoring.' },
            { icon: BarChart3, title: 'Repair Cost Estimation', desc: 'Fast budget projection based on localized material, surface sizing, and labor estimates.' },
            { icon: Award, title: 'Road Health Index', desc: 'Quantitative structural integrity metric calculated per block to guide long-term capital planning.' },
            { icon: Shield, title: 'RoadSoS Emergency Layer', desc: 'Real-time critical hazard warning dashboard for immediate safety alerts and barricading dispatch.' },
            { icon: Globe, title: 'Public Transparency Dashboard', desc: 'Civic hub showing open reports, ongoing repairs, and municipal compliance tracking.' },
            { icon: TrendingUp, title: 'Road Risk Heatmap', desc: 'Interactive density mapping of road hazards for targeted capital allocation and scheduling.' },
            { icon: CheckCircle2, title: 'Technical Validation', desc: 'Rigorous model specs (mAP, IoU, Dice coefficients) vetted for public safety standards.' }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:shadow-emerald-500/5 dark:hover:border-emerald-500/20 transition-all duration-305 group"
            >
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="py-32 bg-slate-100 dark:bg-slate-900/50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">How It Works</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">A unified workflow from automated road surface scanning to physical repair closure.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative p-8 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="absolute -top-5 -left-5 w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg transform -rotate-6">
                    {i + 1}
                  </div>
                  <div className="mt-4">
                    <Icon className="w-10 h-10 text-emerald-600 mb-6" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====== ROADWATCH INTELLIGENCE WORKFLOW ====== */}
      <section className="relative py-32 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        {/* Ambient background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200/50 dark:from-slate-900 dark:via-slate-950 dark:to-[#071a2e]" />
        
        {/* Subtle grid overlays for light and dark modes */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:40px_40px] dark:hidden" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] hidden dark:block" />

        {/* Glowing orbs */}
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"
          animate={{ x: [0, 40, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"
          animate={{ x: [0, -40, 0], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 14, repeat: Infinity }}
        />

        <div className="relative max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 px-4 py-2 bg-emerald-550 dark:bg-emerald-400/10 border border-emerald-200 dark:border-emerald-400/20 rounded-full mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Governance Lifecycle
            </span>
            <h2 className="text-4xl sm:text-5xl font-black mt-2 mb-6 text-slate-900 dark:text-white tracking-tight">
              RoadWatch Intelligence{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400">
                Workflow
              </span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              A fully automated, end-to-end operational pipeline — from AI road scanning to public transparency verification in real time.
            </p>
          </motion.div>

          {/* Workflow Steps */}
          <div className="relative">
            {/* Connecting line (desktop) */}
            <div className="absolute top-16 left-0 right-0 h-px hidden lg:block overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"
                initial={{ scaleX: 0, opacity: 0 }}
                whileInView={{ scaleX: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.3 }}
                style={{ transformOrigin: 'left' }}
              />
              {/* Animated travelling dot */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_4px_rgba(52,211,153,0.5)]"
                animate={{ left: ['0%', '100%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: 1.8 }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 lg:gap-3">
              {[
                {
                  step: '01',
                  icon: Camera,
                  title: 'Road Detection',
                  desc: 'Real-time CV scanning of road surfaces via mobile & fixed cameras',
                  tag: 'Computer Vision',
                  tagColor: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-400/10 border-sky-200 dark:border-sky-400/20',
                  glow: 'shadow-sky-500/5 dark:shadow-sky-500/20',
                },
                {
                  step: '02',
                  icon: Microscope,
                  title: 'Severity Analysis',
                  desc: 'AI rates damage ratio 0–1 and maps to Low / Medium / High / Critical',
                  tag: '94.2% Accuracy',
                  tagColor: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-400/10 border-violet-200 dark:border-violet-400/20',
                  glow: 'shadow-violet-500/5 dark:shadow-violet-500/20',
                },
                {
                  step: '03',
                  icon: Bot,
                  title: 'Authority Copilot',
                  desc: 'AI auto-generates department dispatch, cost estimates in ₹ & repair directives',
                  tag: 'AI-Generated',
                  tagColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-400/10 border-purple-200 dark:border-purple-400/20',
                  glow: 'shadow-purple-500/5 dark:shadow-purple-500/20',
                },
                {
                  step: '04',
                  icon: ClipboardList,
                  title: 'Issue Assignment',
                  desc: 'Report routed to verified field crew with SLA-bound ETA',
                  tag: 'Auto-Routed',
                  tagColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 border-amber-200 dark:border-amber-400/20',
                  glow: 'shadow-amber-500/5 dark:shadow-amber-500/20',
                },
                {
                  step: '05',
                  icon: Wrench,
                  title: 'Repair Tracking',
                  desc: 'Workers log before/after photos & progress status in real time',
                  tag: 'Photo Verified',
                  tagColor: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-400/10 border-orange-200 dark:border-orange-400/20',
                  glow: 'shadow-orange-500/5 dark:shadow-orange-500/20',
                },
                {
                  step: '06',
                  icon: CheckCircle2,
                  title: 'Resolution',
                  desc: 'Admin verifies surface repair closure. Issue marked resolved in system',
                  tag: 'Admin Signed-Off',
                  tagColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 border-emerald-200 dark:border-emerald-400/20',
                  glow: 'shadow-emerald-500/5 dark:shadow-emerald-500/20',
                },
                {
                  step: '07',
                  icon: Building2,
                  title: 'Public Dashboard',
                  desc: 'Civic transparency metrics updated — citizens see resolution status live',
                  tag: 'Open Data',
                  tagColor: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-400/10 border-cyan-200 dark:border-cyan-400/20',
                  glow: 'shadow-cyan-500/5 dark:shadow-cyan-500/20',
                },
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08, duration: 0.5 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className={`relative flex flex-col items-center text-center p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md shadow-sm dark:shadow-xl ${item.glow} hover:border-slate-300 dark:hover:border-white/20 hover:bg-white/80 dark:hover:bg-white/8 transition-all duration-300 cursor-default group`}
                  >
                    {/* Step number */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/20 text-[10px] font-black text-slate-500 dark:text-slate-400 font-mono">
                        {item.step}
                      </span>
                    </div>

                    {/* Icon with glow */}
                    <div className="mt-3 mb-4 w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-slate-100 dark:group-hover:bg-white/10 transition-all duration-300 shadow-sm dark:shadow-lg">
                      <IconComponent className="w-6 h-6 text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200" />
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2 leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-4 flex-1">
                      {item.desc}
                    </p>

                    {/* Tag pill */}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold border ${item.tagColor} uppercase tracking-wide`}>
                      {item.tag}
                    </span>

                    {/* Connector arrow (desktop) */}
                    {idx < 6 && (
                      <div className="absolute -right-2 top-16 text-emerald-500/40 text-lg hidden lg:block z-10 select-none">
                        ›
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </section>


      {/* ====== CTA (Reverted to simpler style) ====== */}
      <section className="py-24 relative overflow-hidden flex items-center justify-center min-h-[600px]">
        {/* Deep Gradient Background with Animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-800 to-slate-900 animate-gradient-xy"></div>

        {/* Floating Abstract Shapes (Background) */}
        <motion.div
          className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-400/20 rounded-full mix-blend-overlay blur-[100px]"
          animate={{
            y: [0, 50, 0],
            x: [0, 30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-300/10 rounded-full mix-blend-overlay blur-[100px]"
          animate={{
            y: [0, -60, 0],
            x: [0, -40, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Main Glass Card Container */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative backdrop-blur-2xl bg-white/10 dark:bg-black/20 border border-white/20 rounded-2xl sm:rounded-[3rem] p-6 sm:p-12 md:p-24 text-center overflow-hidden shadow-2xl"
          >
            {/* Floating Glass Icon Elements */}
            <motion.div
              className="absolute top-10 left-10 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hidden md:block"
              animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <Shield className="w-8 h-8 text-emerald-200" />
            </motion.div>

            <motion.div
              className="absolute bottom-10 right-10 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hidden md:block"
              animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <TrendingUp className="w-8 h-8 text-cyan-200" />
            </motion.div>

            <motion.div
              className="absolute top-20 right-20 w-4 h-4 bg-emerald-300 rounded-full blur-sm"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Content */}
            <div className="relative z-20">
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-black mb-6 sm:mb-8 tracking-tight text-white drop-shadow-sm">
                Ready to transition your city?
              </h2>
              <p className="text-emerald-50 mb-8 sm:mb-12 text-base sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-light">
                Join progressive municipalities leveraging <span className="font-bold text-white">data-driven road intelligence</span> and automated workflows.
              </p>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Button
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="h-14 px-8 text-base sm:h-20 sm:px-12 sm:text-2xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold rounded-full shadow-2xl shadow-emerald-900/30 border-2 sm:border-4 border-emerald-500/30 transition-all flex items-center gap-2 sm:gap-3"
                >
                  Get Started Now <ArrowRight className="w-6 h-6" />
                </Button>
              </motion.div>

              <p className="mt-6 text-sm text-emerald-200/60 font-medium tracking-widest uppercase">
                Free for Citizens • Vetted for Municipal Operations
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ====== BRANDS ====== */}
      <section className="py-16 border-t border-slate-200 dark:border-slate-800">
        <SlidingBrandBar />
      </section>

      {/* Footer is now Global in App.tsx */}
    </div >
  );
}
