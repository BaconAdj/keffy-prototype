'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function BookingsPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-navy">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-5">
      {/* Phone Frame */}
      <div className="w-full max-w-[400px] h-[90vh] max-h-[844px] bg-sand rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-navy text-white px-5 py-4">
          <h1 className="font-vibes text-3xl text-gold mb-1">Bookings</h1>
          <p className="text-sm text-white/70">Your trips with Keffy</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          
          {/* Empty State */}
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-navy mb-2">No trips yet</h2>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Start planning your next adventure with Keffy! Once you've planned a trip, you'll see it here.
            </p>
            
            <Link 
              href="/"
              className="px-6 py-3 bg-gold text-white rounded-full font-medium hover:bg-gold/90 transition-colors"
            >
              Start Planning
            </Link>
          </div>

          {/* Future: Trip cards will go here */}
          {/* Example structure for when trips exist:
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-border">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-navy">Paris, France</h3>
                  <p className="text-sm text-gray-600">May 15-22, 2026</p>
                </div>
                <span className="px-3 py-1 bg-gold/10 text-gold text-xs rounded-full">Planning</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">7 nights • 2 travelers</p>
              <button className="text-gold text-sm font-medium">View Details →</button>
            </div>
          </div>
          */}

        </div>

        {/* Bottom Navigation */}
        <div className="px-5 py-2 pb-5 bg-sand/98 backdrop-blur-sm border-t border-border/40 flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-400 hover:bg-border/30 transition-colors">
            <div className="font-vibes text-[2rem] leading-none -mt-1">K</div>
            <span className="text-[11px] font-medium">Keffy</span>
          </Link>
          
          <Link href="/bookings" className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gold">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span className="text-[11px] font-medium">Bookings</span>
          </Link>
          
          <Link href="/account" className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-400 hover:bg-border/30 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[11px] font-medium">Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
