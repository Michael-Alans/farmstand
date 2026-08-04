'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ShoppingBasket, Sprout, LogOut, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-green-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-green-700">
          <Sprout className="w-6 h-6" />
          FarmStand
        </Link>

        {/* Links */}
        <div className="flex items-center gap-3">
          {!isLoading && (
            <>
              {!user ? (
                <>
                  <Link
                    href="/login"
                    className="text-sm text-gray-600 hover:text-green-700 transition-colors font-medium px-3 py-1.5"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Get started
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={user.role === 'FARMER' ? '/dashboard/farmer' : '/dashboard/buyer'}
                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-700 transition-colors font-medium px-3 py-1.5"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <span className="text-sm text-gray-400">|</span>
                  <span className="text-sm text-gray-700 font-medium">
                    {user.name.split(' ')[0]}
                    <span className="ml-1 text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">
                      {user.role}
                    </span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors px-2 py-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
