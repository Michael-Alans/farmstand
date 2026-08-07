'use client';
import Link from 'next/link';
import { Listing } from '@/lib/api';
import { formatNaira } from '@/lib/utils';
import { MapPin, Package, User, BadgeCheck } from 'lucide-react';

export default function ListingCard({ listing }: { listing: Listing }) {
  const farmer = listing.farmer;
  const farmerName = farmer?.name ?? listing.farmerName;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* Image */}
      <Link href={`/listings/${listing.id}`} className="block">
        <div className="relative h-48 bg-green-50 overflow-hidden">
          {listing.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-green-200" />
            </div>
          )}
          {listing.status === 'SOLD_OUT' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg tracking-wide">SOLD OUT</span>
            </div>
          )}
          <span className="absolute top-3 left-3 text-xs bg-white/90 text-green-700 font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
            {listing.category}
          </span>
        </div>

        {/* Body */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">{listing.title}</h3>
          <p className="text-green-700 font-bold text-lg">
            {formatNaira(listing.price)}
            <span className="text-gray-400 font-normal text-sm"> / {listing.unit}</span>
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{listing.location}</span>
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {listing.quantity} {listing.unit}(s) available
          </div>
        </div>
      </Link>

      {/* Farmer strip – links to their profile */}
      {farmerName && (
        <Link
          href={`/farmers/${listing.farmerId}`}
          className="mt-auto px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center gap-2 hover:bg-green-50 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0 overflow-hidden">
            {farmer?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={farmer.avatarUrl} alt={farmerName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-3.5 h-3.5 text-green-600" />
            )}
          </div>
          <p className="text-xs font-semibold text-gray-600 hover:text-green-700 transition-colors truncate flex-1">
            {farmerName}
          </p>
          {farmer?.isKycVerified && (
            <span title="Verified Farmer"><BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" /></span>
          )}
        </Link>
      )}
    </div>
  );
}
