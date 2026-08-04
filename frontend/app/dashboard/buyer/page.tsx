'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { ordersApi, Order, OrderStatus } from '@/lib/api';
import { formatNaira } from '@/lib/utils';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { useWebSocket } from '@/lib/useWebSocket'; // ← new
import { Loader2, ShoppingBasket, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function BuyerDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | ''>('');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'BUYER')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    ordersApi.mine(filter || undefined)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, filter]);

  // ── Real-time WebSocket ────────────────────────────────
  const handleWsMessage = useCallback((data: any) => {
    if (data.type === 'ORDER_STATUS_UPDATE' && data.order) {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === data.order.id
            ? { ...order, status: data.order.status }
            : order
        )
      );
    }
    // Optional: handle other events if needed
    // if (data.type === 'NEW_ORDER') { ... }
  }, []);

  const { isConnected } = useWebSocket(handleWsMessage);
  // ───────────────────────────────────────────────────────

  const statuses: (OrderStatus | '')[] = ['', 'PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELLED'];

  if (isLoading || !user) return (
    <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-green-500" /></div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Hi {user.name.split(' ')[0]} — here&apos;s your order history
          {isConnected && <span className="ml-2 text-green-600 text-xs">● Live</span>}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
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

      {/* Orders list */}
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
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  {order.farmer?.name && ` · Farmer: ${order.farmer.name}`}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-gray-900">{formatNaira(order.total)}</p>
                <Link href={`/listings/${order.listingId}`}
                  className="text-xs text-green-700 hover:underline">
                  View listing →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-xl text-xs text-gray-400 text-center">
        💬 Messaging · 🚚 Delivery tracking · ⭐ Ratings — <span className="font-medium">Coming soon</span>
      </div>
    </div>
  );
}