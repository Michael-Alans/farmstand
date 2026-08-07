'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useThemeStore } from '@/lib/theme-store';
import { useRouter } from 'next/navigation';
import {
  Sprout, LogOut, LayoutDashboard, Sun, Moon, Menu, X,
  ShoppingBasket, User, Home,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useThemeStore();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    router.push('/');
  }

  const dashboardHref = user?.role === 'FARMER' ? '/dashboard/farmer' : '/dashboard/buyer';

  // Nav links shared between desktop and mobile
  const navLinks = !isLoading ? (
    !user ? (
      <>
        <Link
          href="/login"
          onClick={() => setMenuOpen(false)}
          className="text-sm text-gray-600 hover:text-green-700 dark:text-green-300 dark:hover:text-green-400 transition-colors font-medium px-3 py-1.5"
        >
          Log in
        </Link>
        <Link
          href="/register"
          onClick={() => setMenuOpen(false)}
          className="text-sm bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Get started
        </Link>
      </>
    ) : (
      <>
        <Link
          href={dashboardHref}
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-700 dark:text-green-300 dark:hover:text-green-400 transition-colors font-medium px-3 py-1.5"
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Link>
        <span className="hidden sm:inline text-sm text-gray-400">|</span>
        <span className="text-sm text-gray-700 dark:text-green-200 font-medium">
          {user.name.split(' ')[0]}
          <span className="ml-1 text-xs px-1.5 py-0.5 bg-green-100 dark:bg-dark-muted text-green-700 dark:text-green-300 rounded-full">
            {user.role}
          </span>
        </span>
        <button
          onClick={handleLogout}
          title="Log out"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 dark:text-green-400 dark:hover:text-red-400 transition-colors px-2 py-1.5"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </>
    )
  ) : null;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-green-100 shadow-sm dark:bg-dark-surface dark:border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-green-700 dark:text-green-400">
          <Sprout className="w-6 h-6" />
          FarmStand
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-3">
          {navLinks}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-dark-elevated transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-green-400 hover:bg-green-50 dark:hover:bg-dark-elevated transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 dark:text-green-300 hover:bg-green-50 dark:hover:bg-dark-elevated transition-colors"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 dark:border-dark-border bg-white dark:bg-dark-surface px-4 py-4 flex flex-col gap-1 shadow-lg">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-green-200 hover:bg-green-50 dark:hover:bg-dark-elevated transition-colors"
          >
            <Home className="w-4 h-4 text-green-600" />
            Browse Produce
          </Link>

          {!isLoading && !user && (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-green-200 hover:bg-green-50 dark:hover:bg-dark-elevated transition-colors"
              >
                <User className="w-4 h-4 text-green-600" />
                Log in
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors mt-1"
              >
                <Sprout className="w-4 h-4" />
                Get started
              </Link>
            </>
          )}

          {!isLoading && user && (
            <>
              <div className="px-3 py-2 mb-1">
                <p className="text-xs text-gray-400 dark:text-green-600 uppercase tracking-wide font-semibold">Signed in as</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-green-200 mt-0.5">
                  {user.name}
                  <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-100 dark:bg-dark-muted text-green-700 dark:text-green-300 rounded-full">
                    {user.role}
                  </span>
                </p>
              </div>

              <Link
                href={dashboardHref}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-green-200 hover:bg-green-50 dark:hover:bg-dark-elevated transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-green-600" />
                Dashboard
              </Link>

              {user.role === 'BUYER' && (
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-green-200 hover:bg-green-50 dark:hover:bg-dark-elevated transition-colors"
                >
                  <ShoppingBasket className="w-4 h-4 text-green-600" />
                  Shop Produce
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-dark-elevated transition-colors mt-1 w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
