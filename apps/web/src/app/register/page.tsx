'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Loader2, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const passwordChecks = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /\d/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const allChecks = passwordChecks.every((c) => c.test(form.password));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allChecks) { toast.error('Password does not meet requirements'); return; }
    try {
      await register(form);
      toast.success('Account created! Welcome to Betless 🎯');
      router.push('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Registration failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-brand-black py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-brand-green/6 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-green flex items-center justify-center">
              <span className="text-black font-black text-2xl">B</span>
            </div>
            <span className="text-white font-black text-2xl">BET<span className="text-gradient-green">LESS</span></span>
          </Link>
          <h1 className="text-2xl font-black text-white mt-6 mb-1">Create your account</h1>
          <p className="text-gray-400 text-sm">Join 12,000+ predictors competing for the top</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  placeholder="your_username"
                  required
                  minLength={3}
                  maxLength={30}
                  className="input-field pl-10"
                />
              </div>
              <p className="text-gray-600 text-xs mt-1">Letters, numbers, underscores only (3-30 chars)</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Create a strong password"
                  required
                  className="input-field pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password checks */}
              {form.password.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  {passwordChecks.map((check) => {
                    const ok = check.test(form.password);
                    return (
                      <div key={check.label} className={cn('flex items-center gap-1.5 text-xs', ok ? 'text-brand-green' : 'text-gray-500')}>
                        <CheckCircle className={cn('w-3 h-3', ok ? 'opacity-100' : 'opacity-30')} />
                        {check.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button type="submit" disabled={isLoading || !allChecks}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-600 text-xs mt-6 leading-relaxed">
            By registering, you agree to our{' '}
            <Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link>.
            Betless is a free prediction platform — no real money involved.
          </p>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-green font-medium hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
