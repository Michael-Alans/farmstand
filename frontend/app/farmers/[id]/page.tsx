'use client';
import { useState, useEffect } from 'react';
import { usersApi, Listing } from '@/lib/api';
import { MapPin, User, BadgeCheck, Package } from 'lucide-react';
import ListingCard from '@/components/ListingCard';

export default function FarmerProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.getFarmerProfile(id).then(setProfile).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading profile...</div>;
  if (!profile) return <div className="text-center py-20 text-gray-500">Farmer not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-center gap-6 mb-10">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center overflow-hidden shrink-0">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-green-600" />
          )}
        </div>
        
        <div className="text-center md:text-left flex-1">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
            {profile.isKycVerified ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                <BadgeCheck className="w-3.5 h-3.5" /> Verified
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                Not Verified
              </span>
            )}
          </div>
          <p className="text-gray-500 max-w-2xl text-sm leading-relaxed mb-4">
            {profile.bio || 'This farmer has not provided a biography yet.'}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-medium text-gray-500">
            <span className="bg-gray-100 px-3 py-1 rounded-full">Joined {new Date(profile.createdAt).getFullYear()}</span>
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full flex items-center gap-1">
              <Package className="w-3 h-3" /> {profile.listings?.length || 0} Active Listings
            </span>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">Produce from {profile.name}</h2>
      {profile.listings?.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl">No active produce listed.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {profile.listings.map((l: Listing) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}

    </div>
  );
}
