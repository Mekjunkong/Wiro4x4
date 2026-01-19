import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { getLoginUrl } from '@/const';
import { BookingCalendar } from '@/components/BookingCalendar';
import { 
  Calendar, Users, DollarSign, TrendingUp, 
  CheckCircle, Clock, XCircle, Eye, Edit, Trash2,
  Phone, Mail, MapPin, User, Filter, Search,
  ChevronDown, ChevronUp, RefreshCw, LogOut
} from 'lucide-react';

type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'calendar' | 'agents' | 'leads' | 'financial'>('bookings');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [expandedBooking, setExpandedBooking] = useState<number | null>(null);

  // Fetch data
  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = trpc.booking.list.useQuery();
  const { data: agents, isLoading: agentsLoading, refetch: refetchAgents } = trpc.agent.list.useQuery();
  const { data: leads, isLoading: leadsLoading, refetch: refetchLeads } = trpc.lead.list.useQuery();
  const { data: financials, isLoading: financialsLoading } = trpc.financial.listAll.useQuery();

  // Mutations
  const updateBooking = trpc.booking.update.useMutation({
    onSuccess: () => {
      refetchBookings();
      alert('Booking status updated successfully!');
    },
    onError: (error) => {
      console.error('Failed to update booking:', error);
      alert('Failed to update booking status. Please try again.');
    },
  });
  const deleteBooking = trpc.booking.delete.useMutation({
    onSuccess: () => {
      refetchBookings();
      alert('Booking deleted successfully!');
    },
    onError: (error) => {
      console.error('Failed to delete booking:', error);
      alert('Failed to delete booking. Please try again.');
    },
  });

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access the admin dashboard.</p>
          <a 
            href={getLoginUrl()}
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Log In
          </a>
        </div>
      </div>
    );
  }

  // Filter bookings
  const filteredBookings = bookings?.filter(booking => {
    const matchesSearch = 
      booking.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.contactPhone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  // Calculate stats
  const stats = {
    totalBookings: bookings?.length || 0,
    pendingBookings: bookings?.filter(b => b.status === 'pending').length || 0,
    confirmedBookings: bookings?.filter(b => b.status === 'confirmed').length || 0,
    totalRevenue: financials?.filter(f => f.type === 'revenue').reduce((sum, f) => sum + Number(f.amount), 0) || 0,
  };

  const handleStatusChange = (bookingId: number, newStatus: BookingStatus) => {
    updateBooking.mutate({ id: bookingId, data: { status: newStatus } });
  };

  const handleDeleteBooking = (bookingId: number) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      deleteBooking.mutate({ id: bookingId });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-primary">WIRO 4x4 Admin</h1>
            <span className="text-sm text-gray-500">Welcome, {user.name || user.email}</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-gray-600 hover:text-primary transition-colors">
              View Website
            </a>
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Confirmed</p>
                <p className="text-3xl font-bold text-green-600">{stats.confirmedBookings}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-3xl font-bold text-primary">฿{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6">
              {[
                { id: 'bookings', label: 'Bookings', icon: Calendar },
                { id: 'calendar', label: 'Calendar View', icon: Calendar },
                { id: 'agents', label: 'Agents', icon: Users },
                { id: 'leads', label: 'Leads', icon: TrendingUp },
                { id: 'financial', label: 'Financial', icon: DollarSign },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="p-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <button
                  onClick={() => refetchBookings()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              {/* Bookings List */}
              {bookingsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No bookings found
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map(booking => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div 
                        className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{booking.contactName}</p>
                            <p className="text-sm text-gray-500">
                              {booking.arrivalDate ? new Date(booking.arrivalDate).toLocaleDateString() : 'No date'} - 
                              {booking.departureDate ? new Date(booking.departureDate).toLocaleDateString() : 'No date'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[booking.status as BookingStatus]}`}>
                            {STATUS_LABELS[booking.status as BookingStatus]}
                          </span>
                          <span className="text-sm text-gray-500">
                            {booking.numberOfAdults} adults
                          </span>
                          {expandedBooking === booking.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                      
                      {expandedBooking === booking.id && (
                        <div className="p-4 border-t border-gray-200">
                          <div className="grid md:grid-cols-3 gap-6">
                            <div>
                              <h4 className="font-semibold mb-2 text-gray-700">Contact Info</h4>
                              <div className="space-y-2 text-sm">
                                <p className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-gray-400" />
                                  {booking.contactEmail || 'No email'}
                                </p>
                                <p className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  {booking.contactPhone}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2 text-gray-700">Services</h4>
                              <div className="flex flex-wrap gap-2">
                                {booking.includesHotels && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Hotels</span>}
                                {booking.includesGuide && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Guide</span>}
                                {booking.includesTrip && <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">4x4 Trip</span>}
                                {booking.includesFood && <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Kosher Food</span>}
                                {booking.needsShabbatHotel && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Shabbat Hotel</span>}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2 text-gray-700">Actions</h4>
                              <div className="flex flex-wrap gap-2">
                                <select
                                  value={booking.status}
                                  onChange={(e) => handleStatusChange(booking.id, e.target.value as BookingStatus)}
                                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                                >
                                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleDeleteBooking(booking.id)}
                                  className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          {booking.specialRequests && (
                            <div className="mt-4 p-3 bg-gray-50 rounded">
                              <h4 className="font-semibold text-sm text-gray-700 mb-1">Special Requests</h4>
                              <p className="text-sm text-gray-600">{booking.specialRequests}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <div className="p-6">
              {bookingsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : (
                <BookingCalendar 
                  bookings={bookings?.map(b => ({
                    id: b.id,
                    contactName: b.contactName || '',
                    contactEmail: b.contactEmail || '',
                    contactPhone: b.contactPhone || '',
                    arrivalDate: b.arrivalDate?.toString() || '',
                    departureDate: b.departureDate?.toString() || '',
                    numberOfAdults: b.numberOfAdults || 1,
                    numberOfChildren: b.numberOfChildren || 0,
                    status: b.status || 'pending',
                    suggestedDestinations: b.suggestedDestinations || '',
                    pickupPoint: b.pickupPoint || '',
                    dropoffPoint: b.dropoffPoint || '',
                  })) || []}
                />
              )}
            </div>
          )}

          {/* Agents Tab */}
          {activeTab === 'agents' && (
            <div className="p-6">
              {agentsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : agents?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No agents found. Add agents to manage your team.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agents?.map(agent => (
                    <div key={agent.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{agent.name}</p>
                          <p className="text-sm text-gray-500">{agent.email}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {agent.phone}
                        </p>
                        {agent.languages && (
                          <p className="text-gray-500">Languages: {agent.languages}</p>
                        )}
                      </div>
                      <div className="mt-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          agent.status === 'active' ? 'bg-green-100 text-green-800' :
                          agent.status === 'on_leave' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {agent.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Leads Tab */}
          {activeTab === 'leads' && (
            <div className="p-6">
              {leadsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : leads?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No leads captured yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Source</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads?.map(lead => (
                        <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{lead.name}</td>
                          <td className="py-3 px-4">
                            <p className="text-sm">{lead.email}</p>
                            {lead.phone && <p className="text-sm text-gray-500">{lead.phone}</p>}
                          </td>
                          <td className="py-3 px-4">{lead.source}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                              lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                              lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Financial Tab */}
          {activeTab === 'financial' && (
            <div className="p-6">
              {financialsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : financials?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No financial records yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financials?.map(record => (
                        <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">
                            {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              record.type === 'revenue' ? 'bg-green-100 text-green-800' :
                              record.type === 'cost' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {record.type}
                            </span>
                          </td>
                          <td className="py-3 px-4">{record.category}</td>
                          <td className="py-3 px-4 font-semibold">
                            {record.currency} {Number(record.amount).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">{record.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
