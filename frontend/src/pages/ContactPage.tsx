import { useState } from 'react';
import { motion } from 'framer-motion';
import { Chatbot } from '../components/ChatBot';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, Phone, MapPin, ArrowRight, ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function ContactPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: 'ff2da9e5-0c0b-49b6-9295-765d8d37efa4',
          ...formData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        console.error('Web3Forms Error:', result);
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit form.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
      <div className="flex justify-start">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
              return;
            }
            navigate('/');
          }}
          className="rounded-full px-4"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mb-10 max-w-2xl text-center sm:mb-12"
      >
        <h1 className="mb-4 text-balance text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Get in Touch
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 sm:text-lg">
          Have questions about the detection system, reporting flow, or support process? We&apos;re here to help.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="space-y-6">
          <Card className="card-premium">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Reach out directly through the channel that suits you best.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition-all duration-300 hover:border-emerald-200 hover:shadow-[0_16px_30px_rgba(16,185,129,0.08)] dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-emerald-500/30">
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 shadow-sm dark:bg-emerald-900/20 dark:text-emerald-400">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Email Us</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">support@potholeai.com</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">partners@potholeai.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition-all duration-300 hover:border-blue-200 hover:shadow-[0_16px_30px_rgba(59,130,246,0.08)] dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-blue-500/30">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600 shadow-sm dark:bg-blue-900/20 dark:text-blue-400">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Call Us</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">+91 98765 43210</p>
                  <p className="mt-1 text-xs text-slate-400">Mon-Fri, 9am-6pm IST</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition-all duration-300 hover:border-fuchsia-200 hover:shadow-[0_16px_30px_rgba(217,70,239,0.08)] dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-fuchsia-500/30">
                <div className="rounded-xl bg-fuchsia-50 p-3 text-fuchsia-600 shadow-sm dark:bg-fuchsia-900/20 dark:text-fuchsia-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Visit Us</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    4th Floor, Tech Park,
                    <br />
                    Outer Ring Road, Bangalore - 560103
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-[0_24px_60px_rgba(15,23,42,0.34)]">
            <CardContent className="p-8">
              <h3 className="mb-4 text-xl font-bold">Quick Links</h3>
              <ul className="space-y-3">
                {[
                  { to: '/prediction', label: 'Start Prediction' },
                  { to: '/report', label: 'Submit Report' },
                  { to: '/leaderboard', label: 'View Leaderboard' },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-all duration-300 hover:border-emerald-400/20 hover:bg-white/10 hover:text-emerald-300"
                    >
                      <span className="rounded-lg bg-white/10 p-1.5 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-emerald-500/20">
                        <ArrowRight size={14} />
                      </span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="card-premium">
          <CardHeader>
            <CardTitle>Send us a Message</CardTitle>
            <CardDescription>Fill out the form below and we&apos;ll reply within 24 hours.</CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 text-center sm:py-12"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-[0_14px_30px_rgba(16,185,129,0.16)] dark:bg-emerald-900/30">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">Message Sent!</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Thank you for contacting us. We will get back to you shortly.
                </p>
                <Button variant="outline" className="mt-6 rounded-full px-5" onClick={() => setSubmitted(false)}>
                  Send Another
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      placeholder="e.g. Amit Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      placeholder="amit.kumar@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    placeholder="e.g. Reporting a pothole in Indiranagar"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <textarea
                    className="flex min-h-[140px] w-full resize-none rounded-[1.4rem] border border-slate-200/90 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-[0_8px_20px_rgba(15,23,42,0.04)] ring-offset-white transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950/90 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-700 dark:hover:bg-slate-950 font-sans"
                    placeholder="Describe your inquiry or issue regarding road maintenance..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full bg-emerald-600 text-white font-bold hover:bg-emerald-700">
                  <Send className="mr-2 h-4 w-4" /> Send Message
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <Chatbot />
    </div>
  );
}
