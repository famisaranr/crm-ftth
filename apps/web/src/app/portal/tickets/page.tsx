'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

export default function SubscriberTickets() {
  const router = useRouter();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ category: 'OTHER', subject: '', description: '' });

  const fetchTickets = async () => {
    const token = localStorage.getItem('subscriber_token');
    if (!token) {
      router.push('/portal/login');
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/portal/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Session expired');
      const data = await res.json();
      setTickets(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
    } catch {
      router.push('/portal/login');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('subscriber_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/portal/tickets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newTicket)
      });
      
      if (!res.ok) throw new Error('Failed to create ticket');
      
      toast('success', 'Support ticket submitted directly to engineering team.');
      setIsModalOpen(false);
      setNewTicket({ category: 'OTHER', subject: '', description: '' });
      fetchTickets(); // Refresh list
    } catch (err: any) {
      toast('error', err.message);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading tickets...</div>;

  return (
    <div className="space-y-6">
      <div className="flexjustify-between items-center sm:flex-row flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
          <p className="text-gray-500 text-sm">View your active requests and history.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:bg-blue-700 hover:shadow transition-all w-full sm:w-auto"
        >
          + New Ticket
        </button>
      </div>

      <div className="space-y-4">
        {tickets.map((t) => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-gray-900">{t.subject}</h3>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                t.status === 'OPEN' ? 'bg-red-100 text-red-800' :
                t.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {t.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{t.description}</p>
            <div className="flex justify-between items-center pt-4 border-t border-gray-50 text-xs text-gray-400 font-medium tracking-wide">
              <span>{t.ticket_number}</span>
              <span>{new Date(t.created_at).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Basic Modal implementation */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Submit a Request</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Category</label>
                <select 
                  value={newTicket.category} 
                  onChange={e => setNewTicket({...newTicket, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="NO_CONNECTION">No Connection (LOS Red Light)</option>
                  <option value="SLOW_INTERNET">Slow Internet</option>
                  <option value="INTERMITTENT">Intermittent Connection</option>
                  <option value="BILLING_ISSUE">Billing or Payment Issue</option>
                  <option value="OTHER">Other Request</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input 
                  required
                  value={newTicket.subject} 
                  onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Red light blinking on modem"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  required
                  value={newTicket.description} 
                  onChange={e => setNewTicket({...newTicket, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 h-32 resize-none outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Please describe your issue in detail..."
                />
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-50 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
