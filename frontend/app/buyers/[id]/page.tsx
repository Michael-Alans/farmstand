'use client';
import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';
import { User, BadgeCheck, ShoppingBasket } from 'lucide-react';

export default function BuyerProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.getBuyerProfile(id).then(setProfile).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading profile...</div>;
  if (!profile) return <div className="text-center py-20 text-gray-500">Buyer not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center gap-6">

        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center overflow-hidden shrink-0">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-green-600" />
          )}
        </div>

        {/* Name + KYC */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
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

          <p className="text-gray-500 text-sm max-w-md leading-relaxed mb-4">
            {profile.bio || 'This buyer has not provided a bio yet.'}
          </p>

          <div className="flex items-center justify-center gap-3 text-xs font-medium text-gray-500 flex-wrap">
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              Joined {new Date(profile.createdAt).getFullYear()}
            </span>
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full flex items-center gap-1">
              <ShoppingBasket className="w-3 h-3" /> {profile.fulfilledOrderCount} Completed orders
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
