import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { SlidingBrandBar } from '../components/SlidingBrandBar';

import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../context/SupabaseAuthContext';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { CheckCircle2, ArrowRight, Zap, Target, TrendingUp, Users, BarChart3, Globe, Shield, Award } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/prediction', label: 'Prediction' },
  { to: '/report', label: 'Reports' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/profile', label: 'Profile' },
];

const STATS = [
  { value: 12, suffix: 'k+', label: 'Reports Submitted', icon: BarChart3 },
  { value: 94, suffix: '%', label: 'Detection Accuracy', icon: Target },
  { value: 48, suffix: '', label: 'Cities Served', icon: Globe },
  { value: 8, suffix: 'k+', label: 'Potholes Fixed', icon: CheckCircle2 },
];

const STEPS = [
  { icon: Zap, title: 'Upload Image', desc: 'Take or upload a photo of the pothole in seconds' },
  { icon: Target, title: 'AI Detection', desc: 'Advanced YOLOv8 detects and segments automatically' },
  { icon: TrendingUp, title: 'Generate Report', desc: 'Gemini AI creates professional, actionable reports' },
  { icon: Users, title: 'Authorities Fix', desc: 'Seamless handoff to city maintenance teams' },
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
              className="text-xl font-bold text-slate-900 dark:text-white tracking-tight shrink-0 flex items-center gap-2"
            >
              <Logo className="w-9 h-9" />
              Pothole AI
            </Link>
            {/* Authenticated Navigation */}
            {user && (
              <div className="hidden md:flex items-center gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4">
              <ThemeToggle />
              {!user ? (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="hidden sm:inline-flex text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400">Sign In</Button>
                  </Link>
                  <Link to="/login">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 rounded-full px-6">Get Started</Button>
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="hidden sm:inline text-sm font-medium text-slate-900 dark:text-white">
                    Hi, {user.user_metadata?.name || user.user_metadata?.full_name || 'User'}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
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
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">AI-Powered Safer Roads</span>
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
              className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Detect, analyze, and report road defects instantly with our enterprise-grade AI.
              Streamline maintenance and improve civic safety.
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
                Start Detection <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/report')}
                className="text-lg px-8 h-14 rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 text-slate-900 dark:text-white transition-all"
              >
                Public Report
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
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">Why Choose Pothole AI?</h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Our platform combines cutting-edge computer vision with easy-to-use reporting tools to modernize infrastructure maintenance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: 'Secure & Reliable', desc: 'Enterprise-grade security with role-based access control for city officials.' },
            { icon: Zap, title: 'Real-time Analysis', desc: 'Get results in milliseconds. Our models are optimized for speed and accuracy.' },
            { icon: Award, title: 'City Certified', desc: 'Trusted by municipal departments to streamline maintenance workflows.' }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-10 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:shadow-emerald-500/5 dark:hover:border-emerald-500/30 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="py-32 bg-slate-100 dark:bg-slate-900/50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">How It Works</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Simple steps to safer roads.</p>
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
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
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
            className="relative backdrop-blur-2xl bg-white/10 dark:bg-black/20 border border-white/20 rounded-[3rem] p-12 md:p-24 text-center overflow-hidden shadow-2xl"
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
              <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tight text-white drop-shadow-sm">
                Ready to make a difference?
              </h2>
              <p className="text-emerald-50 mb-12 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-light">
                Join a community of <span className="font-bold text-white">12,000+ citizens</span> making accurate road reports in seconds.
              </p>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Button
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="h-20 px-12 text-2xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold rounded-full shadow-2xl shadow-emerald-900/30 border-4 border-emerald-500/30 transition-all flex items-center gap-3"
                >
                  Get Started Now <ArrowRight className="w-6 h-6" />
                </Button>
              </motion.div>

              <p className="mt-6 text-sm text-emerald-200/60 font-medium tracking-widest uppercase">
                Free for Citizens • Trusted by Municipalities
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
