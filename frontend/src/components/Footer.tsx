import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, Mail, MapPin, Phone, Globe } from 'lucide-react';
import { Logo } from './ui/Logo';

const PRODUCT_LINKS = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/report', label: 'Reports' },
  { to: '/prediction', label: 'Analytics' },
  { to: '/contact', label: 'RoadSoS' },
];

const COMPANY_LINKS = [
  { label: 'About', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'Careers', href: '#' },
  { label: 'Press', href: '#' },
  { label: 'Contact Us', href: '/contact' },
];

const RESOURCES_LINKS = [
  { label: 'Documentation', href: '#' },
  { label: 'API Reference', href: '#' },
  { label: 'Community', href: '#' },
  { label: 'Support', href: '#' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Security', href: '#' },
  { label: 'Compliance', href: '#' },
];

const SOCIAL = [
  { name: 'Portfolio', icon: Globe, href: 'https://peerlist.io/musaqureshi', color: 'hover:text-emerald-500' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/in/musaqureshi', color: 'hover:text-blue-600' },
  { name: 'GitHub', icon: Github, href: 'https://github.com/Musa-Qureshi-01', color: 'hover:text-slate-700 dark:hover:text-white' },
  { name: 'X', icon: Twitter, href: 'https://x.com/Musa_Qureshi_01', color: 'hover:text-sky-500' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20">
        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-x-6 gap-y-10 lg:gap-8 mb-12">
          {/* Brand & description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-2 md:col-span-4 lg:col-span-4"
          >
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <Logo className="w-8 h-8" />
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                RoadWatch AI
              </span>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed text-sm font-medium">
              AI-Powered Road Intelligence, Governance & Emergency Support Platform
            </p>
            <div className="flex gap-3">
              {SOCIAL.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 transition-colors ${social.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Product */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="col-span-1 md:col-span-1 lg:col-span-2"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 sm:mb-6">
              Quick Links
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors inline-flex items-center group"
                  >
                    {link.label}
                    <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="col-span-1 md:col-span-1 lg:col-span-2"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 sm:mb-6">
              Company
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors inline-flex items-center group"
                  >
                    {link.label}
                    <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="col-span-1 md:col-span-1 lg:col-span-2"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 sm:mb-6">
              Resources
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {RESOURCES_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors inline-flex items-center group"
                  >
                    {link.label}
                    <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="col-span-2 sm:col-span-1 md:col-span-1 lg:col-span-2"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 sm:mb-6">
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3 items-start">
                <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <a href="mailto:support@roadwatch.ai" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  support@roadwatch.ai
                </a>
              </li>
              <li className="flex gap-3 items-start">
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <a href="tel:+919876543210" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex gap-3 items-start">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  4th Floor, IndiaTech Tower<br />
                  Bandra Kurla Complex<br />
                  Mumbai — 400 051, India
                </span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-800 my-12" />

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row justify-between items-center gap-6"
        >
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <p>© {currentYear} Musa. All rights reserved.</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">Built with care for civic infrastructure.</p>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap gap-6 text-sm">
            {LEGAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom accent bar */}
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500" />
    </footer>
  );
}
