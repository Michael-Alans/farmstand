'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { listingsApi, ordersApi, Listing, Order, OrderStatus, ListingCategory } from '@/lib/api';
import { formatNaira, CATEGORIES, UNITS } from '@/lib/utils';
import CloudinaryUpload from '@/components/CloudinaryUpload';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { useWebSocket } from '@/lib/useWebSocket'; // ← new
import {
  Loader2, Plus, Trash2, Edit3, Package, ClipboardList,
  TrendingUp, X, CheckCircle
} from 'lucide-react';

/* ─── Create Listing Modal ─────────────────────────────── */
function CreateListingModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    title: '', category: 'Vegetables' as ListingCategory,
    description: '', price: '', unit: 'kg', quantity: '', location: '', imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.imageUrl) { setError('Please upload a photo — it is required.'); return; }
    setLoading(true); setError('');
    try {
      await listingsApi.create({
        ...form,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity),
      });
      onCreated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">New Listing</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop / Product name *</label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500"
                placeholder="e.g. Fresh Tomatoes" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as ListingCategory }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
              <select required value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500">
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price per unit (₦) *</label>
              <input required type="number" min={1} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500"
                placeholder="e.g. 5000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity available *</label>
              <input required type="number" min={1} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500"
                placeholder="e.g. 20" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location (State/Town) *</label>
              <input required value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500"
                placeholder="e.g. Umuahia, Abia" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500 resize-none"
                placeholder="Briefly describe your produce…" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo (required) *</label>
              <CloudinaryUpload onUpload={url => setForm(f => ({ ...f, imageUrl: url }))} />
              {form.imageUrl && (
                <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Photo ready
                </p>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Publishing…' : 'Publish listing'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Farmer Dashboard ─────────────────────────────────── */
export default function FarmerDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<'listings' | 'orders'>('listings');
  const [showModal, setShowModal] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'FARMER')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [listData, orderData] = await Promise.all([
        listingsApi.getAll({ pageSize: 50 }),
        ordersApi.received(),
      ]);
      // Filter to only this farmer's listings
      setListings(listData.items.filter(l => l.farmerId === user?.id));
      setOrders(orderData);
    } catch (e) { console.error(e); }
    finally { setLoadingData(false); }
  }, [user?.id]);

  useEffect(() => { if (user) fetchData(); }, [user, fetchData]);

  // ── Real-time WebSocket ────────────────────────────────
  const handleWsMessage = useCallback((data: any) => {
    if (data.type === 'NEW_ORDER' || data.type === 'ORDER_STATUS_UPDATE') {
      fetchData(); // refresh listings + orders
    }
  }, [fetchData]);

  const { isConnected } = useWebSocket(handleWsMessage);
  // ───────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    await listingsApi.delete(id);
    fetchData();
  }

  async function handleToggleStatus(listing: Listing) {
    await listingsApi.update(listing.id, {
      status: listing.status === 'ACTIVE' ? 'SOLD_OUT' : 'ACTIVE',
    });
    fetchData();
  }

  async function handleOrderStatus(orderId: string, status: OrderStatus) {
    setUpdatingOrder(orderId);
    try { await ordersApi.updateStatus(orderId, status); fetchData(); }
    catch (e) { console.error(e); }
    finally { setUpdatingOrder(null); }
  }

  const activeListings = listings.filter(l => l.status === 'ACTIVE').length;
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;

  if (isLoading || !user) return (
    <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-green-500" /></div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farmer Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Welcome back, {user.name.split(' ')[0]} 👋
            {isConnected && <span className="ml-2 text-green-600 text-xs">● Live</span>}
          </p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> New listing
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active listings', value: activeListings, icon: Package, color: 'text-green-600 bg-green-50' },
          { label: 'Pending orders', value: pendingOrders, icon: ClipboardList, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Total listings', value: listings.length, icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {(['listings', 'orders'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
              tab === t ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t === 'orders' ? `Orders (${orders.length})` : `My Listings (${listings.length})`}
          </button>
        ))}
      </div>

      {loadingData ? (
        <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-green-400" /></div>
      ) : tab === 'listings' ? (
        /* ── Listings Table ── */
        listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Package className="w-12 h-12 text-green-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No listings yet</p>
            <p className="text-gray-400 text-sm mt-1 mb-4">Create your first listing to start selling</p>
            <button onClick={() => setShowModal(true)} className="text-sm text-green-700 underline">
              + Create a listing
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Listing', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {listings.map(listing => (
                  <tr key={listing.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 overflow-hidden flex-shrink-0">
                          {listing.imageUrl
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={listing.imageUrl} alt="" className="w-full h-full object-cover" />
                            : <Package className="w-5 h-5 text-green-300 m-auto mt-2.5" />}
                        </div>
                        <span className="font-medium text-gray-900">{listing.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{formatNaira(listing.price)}/{listing.unit}</td>
                    <td className="px-4 py-3 text-gray-600">{listing.quantity}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        listing.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>{listing.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleStatus(listing)}
                          className="text-xs text-blue-600 hover:underline whitespace-nowrap">
                          {listing.status === 'ACTIVE' ? 'Mark sold out' : 'Reactivate'}
                        </button>
                        <button onClick={() => handleDelete(listing.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* ── Orders Table ── */
        orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <ClipboardList className="w-12 h-12 text-green-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No orders yet</p>
            <p className="text-gray-400 text-sm mt-1">Orders placed on your listings will appear here</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Listing', 'Buyer', 'Qty', 'Total', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{order.listing?.title ?? order.listingId}</td>
                    <td className="px-4 py-3 text-gray-600">{order.buyer?.name ?? order.buyerId}</td>
                    <td className="px-4 py-3 text-gray-600">{order.quantity} {order.unit}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{formatNaira(order.total)}</td>
                    <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-4 py-3">
                      {order.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button disabled={updatingOrder === order.id}
                            onClick={() => handleOrderStatus(order.id, 'CONFIRMED')}
                            className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors font-medium">
                            Confirm
                          </button>
                          <button disabled={updatingOrder === order.id}
                            onClick={() => handleOrderStatus(order.id, 'CANCELLED')}
                            className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors font-medium">
                            Cancel
                          </button>
                        </div>
                      )}
                      {order.status === 'CONFIRMED' && (
                        <button disabled={updatingOrder === order.id}
                          onClick={() => handleOrderStatus(order.id, 'FULFILLED')}
                          className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2.5 py-1 rounded-lg transition-colors font-medium">
                          Mark fulfilled
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {showModal && (
        <CreateListingModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); fetchData(); }}
        />
      )}
    </div>
  );
}