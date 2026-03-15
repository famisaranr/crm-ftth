'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubscriberDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPortalData = async () => {
      const token = localStorage.getItem('subscriber_token');
      if (!token) {
        router.push('/portal/login');
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        const [profileRes, ticketsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/portal/me`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/portal/tickets`, { headers })
        ]);

        if (!profileRes.ok) throw new Error('Session expired');

        setProfile(await profileRes.json());
        setTickets(await ticketsRes.json());
      } catch (err) {
        localStorage.removeItem('subscriber_token');
        router.push('/portal/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortalData();
  }, [router]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><span className="animate-spin text-3xl">🔄</span></div>;
  }

  const activeSubscription = profile?.subscriptions?.[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-1">Welcome back, {profile?.full_name?.split(' ')[0]}!</h2>
        <p className="text-blue-100 opacity-90">Account No: {profile?.account_number}</p>
        
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex-1 min-w-[140px]">
            <p className="text-xs text-blue-200 uppercase tracking-wide font-medium mb-1">Current Plan</p>
            <p className="text-lg font-bold">{activeSubscription?.plan?.name || 'No Active Plan'}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex-1 min-w-[140px]">
            <p className="text-xs text-blue-200 uppercase tracking-wide font-medium mb-1">Status</p>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${profile?.status === 'ACTIVE' ? 'bg-green-400' : 'bg-yellow-400'}`} />
              <p className="text-lg font-bold">{profile?.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 group">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            💳
          </div>
          <span className="font-medium text-gray-700 text-sm">Pay Bill</span>
        </button>
        <button onClick={() => router.push('/portal/tickets')} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 group">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            🛠️
          </div>
          <span className="font-medium text-gray-700 text-sm">Report Issue</span>
        </button>
        <button className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 group">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            🚀
          </div>
          <span className="font-medium text-gray-700 text-sm">Upgrade Plan</span>
        </button>
        <button className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 group">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            📜
          </div>
          <span className="font-medium text-gray-700 text-sm">View Invoices</span>
        </button>
      </div>

      {/* Recent Activity / Tickets */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-gray-800">Recent Service Tickets</h3>
          <button onClick={() => router.push('/portal/tickets')} className="text-sm text-blue-600 font-medium hover:underline">View All</button>
        </div>
        
        {tickets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-3 block">✅</span>
            <p>No open issues! Your service is running smoothly.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.slice(0, 3).map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-500">{ticket.ticket_number}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      ticket.status === 'OPEN' ? 'bg-red-100 text-red-700' :
                      ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900">{ticket.subject}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{new Date(ticket.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
