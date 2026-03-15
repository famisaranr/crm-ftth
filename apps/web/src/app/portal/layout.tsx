import React from 'react';
import Link from 'next/link';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="portal-layout bg-gray-50 min-h-screen pb-20 md:pb-0 pt-16 md:pt-0 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 w-full h-16 bg-blue-700 text-white flex items-center px-4 z-40 shadow-sm">
        <h1 className="font-bold text-lg">FiberOps Portal</h1>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full h-20 bg-white border-t border-gray-200 flex justify-around items-center z-40 pb-safe">
        <Link href="/portal/dashboard" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600">
          <span className="text-xl mb-1">🏠</span>
          <span className="text-xs font-medium">Home</span>
        </Link>
        <Link href="/portal/tickets" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600">
          <span className="text-xl mb-1">🎫</span>
          <span className="text-xs font-medium">Support</span>
        </Link>
        <Link href="/portal/billing" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600">
          <span className="text-xl mb-1">💳</span>
          <span className="text-xs font-medium">Billing</span>
        </Link>
        <Link href="/portal/profile" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600">
          <span className="text-xl mb-1">👤</span>
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-blue-900 text-white fixed top-0 left-0 p-6 z-50">
        <h1 className="font-bold text-2xl mb-10 tracking-tight">Fiber<span className="text-blue-300">Ops</span> Self-Care</h1>
        <nav className="flex-1 flex flex-col gap-2">
          <Link href="/portal/dashboard" className="px-4 py-3 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-3">
            <span>🏠</span> Dashboard
          </Link>
          <Link href="/portal/tickets" className="px-4 py-3 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-3">
            <span>🎫</span> Support Tickets
          </Link>
          <Link href="/portal/billing" className="px-4 py-3 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-3">
            <span>💳</span> Billing & Payments
          </Link>
          <Link href="/portal/profile" className="px-4 py-3 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-3">
            <span>👤</span> My Profile
          </Link>
        </nav>
        <div className="mt-auto">
          <button className="w-full px-4 py-3 rounded-lg bg-red-500/20 text-red-100 hover:bg-red-500/40 transition-colors text-left font-medium">
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
