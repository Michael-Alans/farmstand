'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { useRouter } from 'next/navigation';
import { ordersApi, usersApi, authApi, Order, OrderStatus } from '../../../lib/api';
import { formatNaira } from '../../../lib/utils';
import OrderStatusBadge from '../../../components/OrderStatusBadge';
import CloudinaryUpload from '../../../components/CloudinaryUpload';
import { useWebSocket } from '../../../lib/useWebSocket';
import {
  Loader2, ShoppingBasket, Calendar, Wallet, ShieldCheck,
  Unlock, BadgeCheck, User, CheckCircle
} from 'lucide-react';
import Link from 'next/link';

export default function BuyerDashboard() {
  const { user, isLoading, updateUser } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | ''>('');
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [tab, setTab] = useState<'orders' | 'profile'>('orders');

  // Profile state
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  // KYC state
  const [isKycVerified, setIsKycVerified] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycDone, setKycDone] = useState(false);
  const [kycError, setKycError] = useState('');

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'BUYER')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Sync from auth user
  useEffect(() => {
    if (user) {
      setIsKycVerified(!!user.isKycVerified);
      setBio(user.bio ?? '');
      setAvatarUrl(user.avatarUrl ?? '');
    }
  }, [user]);

  const fetchOrders = useCallback(() => {
    if (!user) return;
    setLoading(true);
    ordersApi.mine(filter || undefined)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    if (!user) return;
    usersApi.getWalletBalance().then(d => setWalletBalance(d.walletBalance)).catch(() => {});
  }, [user]);

  const handleReleaseEscrow = async (orderId: string) => {
    setReleasingId(orderId);
    try {
      await ordersApi.releaseEscrow(orderId);
      fetchOrders();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to release escrow');
    } finally {
      setReleasingId(null);
    }
  };

  async function handleSimulateKyc() {
    setKycLoading(true);
    setKycError('');
    setTimeout(async () => {
      try {
        const res = await usersApi.simulateKyc();
        setIsKycVerified(true);
        setKycDone(true);
        updateUser({ isKycVerified: res.isKycVerified });
      } catch (e) {
        setKycError(e instanceof Error ? e.message : 'Verification failed. Please try again.');
      } finally {
        setKycLoading(false);
      }
    }, 3000);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError('');
    try {
      const res = await usersApi.updateProfile({ bio, avatarUrl });
      setProfileSaved(true);
      updateUser({ bio: res.bio, avatarUrl: res.avatarUrl });
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : 'Failed to save profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return; }
    setChangingPassword(true);
    setPasswordError('');
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setPasswordChanged(true);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setTimeout(() => setPasswordChanged(false), 3000);
    } catch (e) {
      setPasswordError(e instanceof Error ? e.message : 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  }

  const handleWsMessage = useCallback((data: any) => {
    if (data.type === 'ORDER_STATUS_UPDATE' && data.order) {
      setOrders(prev => prev.map(o => o.id === data.order.id ? { ...o, status: data.order.status } : o));
    }
  }, []);
  const { isConnected } = useWebSocket(handleWsMessage);

  const statuses: (OrderStatus | '')[] = ['', 'PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELLED'];

  if (isLoading || !user) return (
    <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-green-500" /></div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Buyer Dashboard</h1>
            {isKycVerified && <span title="KYC Verified"><BadgeCheck className="w-5 h-5 text-blue-500" /></span>}
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            Hi {user.name.split(' ')[0]} 👋
            {isConnected && <span className="ml-2 text-green-600 text-xs">● Live</span>}
          </p>
        </div>
        {walletBalance !== null && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-800 px-4 py-2.5 rounded-xl">
            <Wallet className="w-4 h-4" />
            <div>
              <p className="text-xs text-green-600 font-medium">Wallet Balance</p>
              <p className="text-base font-bold">{formatNaira(walletBalance)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {(['orders', 'profile'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
              tab === t ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t === 'orders' ? `My Orders (${orders.length})` : 'My Profile'}
          </button>
        ))}
      </div>

      {tab === 'profile' ? (
        /* ── Profile Tab ── */
        <div className="grid md:grid-cols-2 gap-6">
          {/* KYC Panel */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-bold text-gray-900">Identity Verification (KYC)</h3>
            </div>
            {isKycVerified || kycDone ? (
              <div className="flex items-center gap-3 bg-green-50 text-green-800 rounded-xl px-4 py-3">
                <BadgeCheck className="w-5 h-5" />
                <div>
                  <p className="font-semibold text-sm">Verified ✓</p>
                  <p className="text-xs text-green-600">Your identity is confirmed. Farmers can see your verified badge.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">Verify your identity to build trust with farmers and unlock the verified badge on your profile.</p>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center text-sm text-gray-400">
                  <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  NIN / BVN slip or government-issued ID
                </div>
                {kycError && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{kycError}</p>
                )}
                <button
                  onClick={handleSimulateKyc}
                  disabled={kycLoading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60"
                >
                  {kycLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying identity…</> : 'Submit for Verification'}
                </button>
              </div>
            )}
          </div>

          {/* Profile Editor */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Public Profile</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell farmers a bit about yourself…"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                <CloudinaryUpload onUpload={url => setAvatarUrl(url)} />
                {avatarUrl && (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Photo uploaded
                  </p>
                )}
              </div>
              {profileError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{profileError}</p>
              )}
              {profileSaved && (
                <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Profile saved successfully!
                </p>
              )}
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60"
              >
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {savingProfile ? 'Saving…' : 'Save Profile'}
              </button>
            </form>
          </div>
          {/* Change Password */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:col-span-2">
            <h3 className="text-base font-bold text-gray-900 mb-4">Change Password</h3>
            <form onSubmit={handleChangePassword} className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
                <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500"
                  placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                <input type="password" required minLength={8} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500"
                  placeholder="At least 8 characters" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
                <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500"
                  placeholder="Repeat new password" />
              </div>
              {passwordError && (
                <p className="md:col-span-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{passwordError}</p>
              )}
              {passwordChanged && (
                <p className="md:col-span-3 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Password changed successfully!
                </p>
              )}
              <div className="md:col-span-3">
                <button type="submit" disabled={changingPassword}
                  className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60">
                  {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {changingPassword ? 'Updating…' : 'Update password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* ── Orders Tab ── */
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {(['PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELLED'] as OrderStatus[]).map(s => {
              const count = orders.filter(o => o.status === s).length;
              const colors: Record<OrderStatus, string> = {
                PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-100',
                CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-100',
                FULFILLED: 'bg-green-50 text-green-700 border-green-100',
                CANCELLED: 'bg-red-50 text-red-600 border-red-100',
              };
              return (
                <div key={s} className={`rounded-2xl border p-4 ${colors[s]}`}>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs font-medium mt-0.5 capitalize">{s.toLowerCase()}</p>
                </div>
              );
            })}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 flex-wrap mb-6">
            {statuses.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors border ${
                  filter === s
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'
                }`}>
                {s === '' ? 'All orders' : s}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-green-400" /></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <ShoppingBasket className="w-12 h-12 text-green-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No orders found</p>
              <p className="text-gray-400 text-sm mt-1 mb-4">
                {filter ? 'No orders with this status' : "You haven't placed any orders yet"}
              </p>
              {!filter && (
                <Link href="/" className="text-sm text-green-700 underline">Browse produce</Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {order.listing?.title ?? order.listingId}
                        </h3>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-sm text-gray-500">
                        {order.quantity} × {formatNaira(order.unitPriceAtOrder)} / {order.unit}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString('en-NG', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                        {order.farmer?.name && (
                          <span> · Farmer: <Link href={`/farmers/${order.farmerId}`} className="text-green-600 hover:underline">{order.farmer.name}</Link></span>
                        )}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-gray-900">{formatNaira(order.total)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        order.escrowStatus === 'HELD' ? 'bg-yellow-50 text-yellow-700' :
                        order.escrowStatus === 'RELEASED' ? 'bg-green-50 text-green-700' :
                        'bg-red-50 text-red-600'
                      }`}>
                        🔒 Escrow: {order.escrowStatus}
                      </span>
                      <br />
                      <Link href={`/listings/${order.listingId}`} className="text-xs text-green-700 hover:underline">
                        View listing →
                      </Link>
                    </div>
                  </div>

                  {order.status === 'FULFILLED' && order.escrowStatus === 'HELD' && (
                    <div className="border-t border-green-50 pt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                        <span>Received your items? Release the held payment to the farmer.</span>
                      </div>
                      <button
                        onClick={() => handleReleaseEscrow(order.id)}
                        disabled={releasingId === order.id}
                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-60 shrink-0"
                      >
                        {releasingId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlock className="w-3 h-3" />}
                        {releasingId === order.id ? 'Releasing…' : 'Confirm & Release Funds'}
                      </button>
                    </div>
                  )}

                  {order.paymentReference && (
                    <p className="text-xs text-gray-400 font-mono">Ref: {order.paymentReference}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
