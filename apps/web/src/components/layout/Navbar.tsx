'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Trophy, Calendar, User, Bell, Settings,
  Menu, X, LogOut, Shield, ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { getRankColor, getRankIcon, avatarFallback, formatPoints } from '@/lib/utils';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/matches', label: 'Matches', icon: Calendar },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-brand-black/95 backdrop-blur-lg border-b border-brand-border/50 shadow-card'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-green flex items-center justify-center group-hover:shadow-green-glow transition-all duration-300">
                <span className="text-black font-black text-lg">B</span>
              </div>
              <span className="text-white font-black text-xl tracking-tight">
                BET<span className="text-gradient-green">LESS</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    pathname === href
                      ? 'bg-brand-green/15 text-brand-green'
                      : 'text-gray-400 hover:text-white hover:bg-brand-card'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {isAuthenticated && user ? (
                <>
                  {/* Notifications */}
                  <Link
                    href="/notifications"
                    className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-brand-card transition-all"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-brand-green rounded-full" />
                  </Link>

                  {/* Profile dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-card border border-brand-border hover:border-brand-green/30 transition-all duration-200"
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-black"
                        style={{ backgroundColor: getRankColor(user.rankTitle) }}
                      >
                        {user.avatarUrl
                          ? <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-lg object-cover" />
                          : avatarFallback(user.username)
                        }
                      </div>
                      <div className="hidden sm:block text-left">
                        <p className="text-white text-xs font-semibold leading-none">{user.username}</p>
                        <p className="text-brand-green text-xs mt-0.5">{formatPoints(user.totalPoints)} pts</p>
                      </div>
                      <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', profileOpen && 'rotate-180')} />
                    </button>

                    <AnimatePresence>
                      {profileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-56 glass-card py-2 z-50"
                          onMouseLeave={() => setProfileOpen(false)}
                        >
                          <div className="px-4 py-2 border-b border-brand-border">
                            <p className="text-white font-semibold text-sm">{user.username}</p>
                            <p className="text-xs mt-0.5" style={{ color: getRankColor(user.rankTitle) }}>
                              {getRankIcon(user.rankTitle)} {user.rankTitle}
                            </p>
                          </div>

                          <Link href={`/profile/${user.username}`} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-brand-card transition-colors" onClick={() => setProfileOpen(false)}>
                            <User className="w-4 h-4" /> My Profile
                          </Link>
                          <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-brand-card transition-colors" onClick={() => setProfileOpen(false)}>
                            <Settings className="w-4 h-4" /> Settings
                          </Link>
                          {user.role === 'admin' && (
                            <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-gold hover:bg-brand-card transition-colors" onClick={() => setProfileOpen(false)}>
                              <Shield className="w-4 h-4" /> Admin Panel
                            </Link>
                          )}
                          <div className="border-t border-brand-border mt-1 pt-1">
                            <button onClick={() => { logout(); setProfileOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-colors">
                              <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="btn-secondary text-sm !px-4 !py-2">Sign In</Link>
                  <Link href="/register" className="btn-primary text-sm !px-4 !py-2">Get Started</Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-brand-card transition-all"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-brand-border bg-brand-black/98 backdrop-blur-lg"
            >
              <div className="px-4 py-3 space-y-1">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      pathname === href
                        ? 'bg-brand-green/15 text-brand-green'
                        : 'text-gray-400 hover:text-white hover:bg-brand-card'
                    )}
                  >
                    <Icon className="w-5 h-5" /> {label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <div className="pt-3 border-t border-brand-border space-y-2">
                    <Link href="/login" className="block w-full btn-secondary text-center text-sm">Sign In</Link>
                    <Link href="/register" className="block w-full btn-primary text-center text-sm">Get Started</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-black/95 backdrop-blur-lg border-t border-brand-border">
        <div className="flex items-center justify-around py-2">
          {[
            ...NAV_ITEMS,
            isAuthenticated
              ? { href: `/profile/${user?.username}`, label: 'Profile', icon: User }
              : { href: '/login', label: 'Sign In', icon: User },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-xs transition-all',
                pathname === href || pathname.startsWith(href + '/')
                  ? 'text-brand-green'
                  : 'text-gray-500 hover:text-gray-300'
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
