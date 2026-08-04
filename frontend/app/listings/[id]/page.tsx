'use client';
import { use, useEffect, useState, FormEvent } from 'react';
import { listingsApi, ordersApi, Listing } from '@/lib/api';
import { formatNaira } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Package, Loader2, ShoppingBasket, ArrowLeft, User } from 'lucide-react';
import OrderStatusBadge from '@/components/OrderStatusBadge';

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    listingsApi.getOne(id).then(setListing).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  async function handleOrder(e: FormEvent) {
    e.preventDefault();
    if (!user) { router.push('/login'); return; }
    setOrdering(true);
    setOrderError('');
    try {
      await ordersApi.create({ listingId: id, quantity });
      setOrderSuccess(true);
    } catch (err: unknown) {
      setOrderError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setOrdering(false);
    }
  }

  if (loading) return (
    <div className="flex justify-center py-32">
      <Loader2 className="w-8 h-8 animate-spin text-green-500" />
    </div>
  );

  if (!listing) return (
    <div className="text-center py-24">
      <p className="text-gray-500">Listing not found.</p>
      <Link href="/" className="mt-4 inline-block text-green-700 underline">Back to browse</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to listings
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden bg-green-50 h-80 md:h-auto">
          {listing.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-20 h-20 text-green-200" />
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <span className="inline-block text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full mb-3">
            {listing.category}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
          <p className="text-3xl font-bold text-green-700 mb-1">
            {formatNaira(listing.price)}
            <span className="text-lg font-normal text-gray-400"> / {listing.unit}</span>
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500 my-4 flex-wrap">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {listing.location}</span>
            <span className="flex items-center gap-1"><Package className="w-4 h-4" /> {listing.quantity} {listing.unit}(s) available</span>
            {listing.farmerName && (
              <span className="flex items-center gap-1"><User className="w-4 h-4" /> {listing.farmerName}</span>
            )}
          </div>

          {listing.status === 'SOLD_OUT' && (
            <OrderStatusBadge status="CANCELLED" />
          )}

          {listing.description && (
            <p className="text-gray-600 text-sm leading-relaxed my-4 bg-gray-50 rounded-xl p-4">
              {listing.description}
            </p>
          )}

          {/* Order form */}
          {listing.status === 'ACTIVE' && user?.role === 'BUYER' && (
            <form onSubmit={handleOrder} className="mt-6 bg-green-50 rounded-2xl p-5 border border-green-100">
              <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <ShoppingBasket className="w-4 h-4 text-green-700" /> Place an order
              </h2>
              {orderSuccess ? (
                <div className="bg-green-100 text-green-800 rounded-xl px-4 py-3 text-sm font-medium">
                  ✅ Order placed! Check your <Link href="/dashboard/buyer" className="underline">order history</Link>.
                </div>
              ) : (
                <>
                  {orderError && (
                    <p className="text-red-500 text-sm mb-3">{orderError}</p>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Quantity ({listing.unit})</label>
                    <input
                      type="number" min={1} max={listing.quantity} value={quantity}
                      onChange={e => setQuantity(parseInt(e.target.value))}
                      className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Total: <strong className="text-gray-800">{formatNaira(listing.price * quantity)}</strong>
                    <span className="text-xs ml-1 text-gray-400">(payment arranged directly with farmer)</span>
                  </p>
                  <button
                    type="submit" disabled={ordering}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {ordering && <Loader2 className="w-4 h-4 animate-spin" />}
                    {ordering ? 'Placing order…' : 'Place order'}
                  </button>
                </>
              )}
            </form>
          )}

          {listing.status === 'ACTIVE' && !user && (
            <div className="mt-6 bg-green-50 rounded-2xl p-5 border border-green-100 text-sm text-gray-600">
              <Link href="/login" className="text-green-700 font-semibold hover:underline">Sign in as a Buyer</Link> to place an order.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
