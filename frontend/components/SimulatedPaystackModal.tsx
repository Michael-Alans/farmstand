'use client';
import { useState } from 'react';
import { X, Lock, CheckCircle2, Loader2, CreditCard } from 'lucide-react';
import { formatNaira } from '@/lib/utils';

interface SimulatedPaystackModalProps {
  amount: number;
  email: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}

export default function SimulatedPaystackModal({ amount, email, onSuccess, onClose }: SimulatedPaystackModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Generate a fake Paystack reference and trigger success
      setTimeout(() => {
        const fakeRef = 'T' + Date.now() + Math.random().toString(36).substring(7).toUpperCase();
        onSuccess(fakeRef);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#091E42] p-6 text-white text-center relative border-b border-white/10">
          <button onClick={onClose} className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors" disabled={loading || success}>
            <X className="w-5 h-5" />
          </button>
          
          <div className="mb-2">
            <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-white/90 font-medium tracking-wide">TEST MODE</span>
          </div>
          
          <p className="text-white/80 text-sm mb-1">{email}</p>
          <p className="text-3xl font-bold">{formatNaira(amount)}</p>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in slide-in-from-bottom-2 fade-in">
              <div className="w-16 h-16 bg-[#0ba4db]/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-[#0ba4db]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Payment Successful</h3>
              <p className="text-sm text-gray-500">Redirecting to order confirmation...</p>
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-gray-900 text-sm tracking-wide uppercase">Enter Card Details</h3>
                <CreditCard className="text-[#0ba4db] w-6 h-6" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Card Number</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 '))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#0ba4db] focus:ring-2 focus:ring-[#0ba4db]/20 transition-all font-mono tracking-widest text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                    value={expiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                      setExpiry(val);
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#0ba4db] focus:ring-2 focus:ring-[#0ba4db]/20 transition-all font-mono tracking-widest text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">CVV</label>
                  <input
                    type="password"
                    placeholder="123"
                    maxLength={3}
                    required
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#0ba4db] focus:ring-2 focus:ring-[#0ba4db]/20 transition-all font-mono tracking-widest text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-[#3bb75e] hover:bg-[#2c984b] text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-[#3bb75e]/30"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay {formatNaira(amount)}</span>
                  </>
                )}
              </button>

              <div className="flex justify-center items-center gap-1.5 mt-6 border-t pt-4 border-gray-100">
                <Lock className="w-3 h-3 text-gray-400" />
                <p className="text-xs font-medium text-gray-400 font-mono tracking-tight">Secured by FarmStand Test Gateway</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
