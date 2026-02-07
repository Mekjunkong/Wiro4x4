import { useState, useRef } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { getLoginUrl } from '@/const';
import { BookingCalendar } from '@/components/BookingCalendar';
import {
  Calendar, Users, DollarSign, TrendingUp,
  CheckCircle, Clock, XCircle, Eye, Edit, Trash2,
  Phone, Mail, MapPin, User, Filter, Search,
  ChevronDown, ChevronUp, RefreshCw, LogOut,
  Camera, Star, Upload, Mountain
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
  const [activeTab, setActiveTab] = useState<'bookings' | 'calendar' | 'agents' | 'leads' | 'financial' | 'gallery' | 'reviews' | 'tours'>('bookings');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [expandedBooking, setExpandedBooking] = useState<number | null>(null);

  // Pagination state
  const [bookingsPage, setBookingsPage] = useState(1);
  const [leadsPage, setLeadsPage] = useState(1);
  const [financialsPage, setFinancialsPage] = useState(1);
  const [galleryPage, setGalleryPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [toursPage, setToursPage] = useState(1);
  const PAGE_SIZE = 20;

  // Fetch data (paginated)
  const { data: bookingsData, isLoading: bookingsLoading, refetch: refetchBookings } = trpc.booking.listPaginated.useQuery({ page: bookingsPage, pageSize: PAGE_SIZE });
  const bookings = bookingsData?.items;
  const bookingsTotal = bookingsData?.total ?? 0;
  const bookingsTotalPages = bookingsData?.totalPages ?? 1;

  const { data: agents, isLoading: agentsLoading, refetch: refetchAgents } = trpc.agent.list.useQuery();

  const { data: leadsData, isLoading: leadsLoading, refetch: refetchLeads } = trpc.lead.listPaginated.useQuery({ page: leadsPage, pageSize: PAGE_SIZE });
  const leads = leadsData?.items;
  const leadsTotal = leadsData?.total ?? 0;
  const leadsTotalPages = leadsData?.totalPages ?? 1;

  const { data: financialsData, isLoading: financialsLoading } = trpc.financial.listAllPaginated.useQuery({ page: financialsPage, pageSize: PAGE_SIZE });
  const financials = financialsData?.items;
  const financialsTotal = financialsData?.total ?? 0;
  const financialsTotalPages = financialsData?.totalPages ?? 1;

  const { data: galleryData, isLoading: galleryLoading, refetch: refetchGallery } = trpc.gallery.listAllPaginated.useQuery({ page: galleryPage, pageSize: PAGE_SIZE });
  const galleryPhotos = galleryData?.items;
  const galleryTotal = galleryData?.total ?? 0;
  const galleryTotalPages = galleryData?.totalPages ?? 1;

  const { data: reviewsData, isLoading: reviewsLoading, refetch: refetchReviews } = trpc.review.listAllPaginated.useQuery({ page: reviewsPage, pageSize: PAGE_SIZE });
  const allReviews = reviewsData?.items;
  const reviewsTotal = reviewsData?.total ?? 0;
  const reviewsTotalPages = reviewsData?.totalPages ?? 1;

  const { data: reviewStats } = trpc.review.stats.useQuery();

  const { data: toursData, isLoading: toursLoading, refetch: refetchTours } = trpc.tour.listAllPaginated.useQuery({ page: toursPage, pageSize: PAGE_SIZE });
  const allTours = toursData?.items;
  const toursTotal = toursData?.total ?? 0;
  const toursTotalPages = toursData?.totalPages ?? 1;

  // Tours state
  const [tourDialogOpen, setTourDialogOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<any>(null);
  const [tourForm, setTourForm] = useState({
    name: '', nameHe: '', description: '', descriptionHe: '',
    duration: '', difficulty: 'moderate' as 'easy' | 'moderate' | 'challenging',
    price: 0, groupMinSize: 1, groupMaxSize: 10,
    imageUrl: '', highlights: '', highlightsHe: '',
    isKosher: true, isPrivate: true, isShabbatOk: true, isActive: true, sortOrder: 0,
  });
  const resetTourForm = () => {
    setTourForm({
      name: '', nameHe: '', description: '', descriptionHe: '',
      duration: '', difficulty: 'moderate', price: 0, groupMinSize: 1, groupMaxSize: 10,
      imageUrl: '', highlights: '', highlightsHe: '',
      isKosher: true, isPrivate: true, isShabbatOk: true, isActive: true, sortOrder: 0,
    });
    setEditingTour(null);
  };

  // Gallery state
  const [galleryDialogOpen, setGalleryDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<any>(null);
  const [photoForm, setPhotoForm] = useState<{ title: string; imageUrl: string; description: string; category: 'tours' | 'vehicles' | 'destinations' | 'activities' | 'food' | 'accommodation' | 'other'; sortOrder: number; isPublished: boolean }>({ title: '', imageUrl: '', description: '', category: 'other', sortOrder: 0, isPublished: true });
  const resetPhotoForm = () => { setPhotoForm({ title: '', imageUrl: '', description: '', category: 'other' as const, sortOrder: 0, isPublished: true }); setEditingPhoto(null); };

  // Reviews state
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [respondingReview, setRespondingReview] = useState<number | null>(null);
  const [adminResponseText, setAdminResponseText] = useState('');

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

  // Gallery upload state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gallery mutations
  const createPhoto = trpc.gallery.create.useMutation({ onSuccess: () => { refetchGallery(); setGalleryDialogOpen(false); resetPhotoForm(); } });
  const updatePhotoMut = trpc.gallery.update.useMutation({ onSuccess: () => { refetchGallery(); setGalleryDialogOpen(false); resetPhotoForm(); } });
  const deletePhotoMut = trpc.gallery.delete.useMutation({ onSuccess: () => refetchGallery() });
  const uploadPhoto = trpc.gallery.upload.useMutation();

  // Review mutations
  const updateReviewMut = trpc.review.update.useMutation({ onSuccess: () => refetchReviews() });
  const deleteReviewMut = trpc.review.delete.useMutation({ onSuccess: () => refetchReviews() });

  // Tour mutations
  const createTourMut = trpc.tour.create.useMutation({ onSuccess: () => { refetchTours(); setTourDialogOpen(false); resetTourForm(); } });
  const updateTourMut = trpc.tour.update.useMutation({ onSuccess: () => { refetchTours(); setTourDialogOpen(false); resetTourForm(); } });
  const deleteTourMut = trpc.tour.delete.useMutation({ onSuccess: () => refetchTours() });

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
    totalBookings: bookingsTotal,
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
                { id: 'bookings', label: 'Bookings', icon: Calendar, count: bookingsTotal },
                { id: 'calendar', label: 'Calendar View', icon: Calendar, count: undefined },
                { id: 'agents', label: 'Agents', icon: Users, count: agents?.length },
                { id: 'leads', label: 'Leads', icon: TrendingUp, count: leadsTotal },
                { id: 'financial', label: 'Financial', icon: DollarSign, count: financialsTotal },
                { id: 'tours', label: 'Tours', icon: Mountain, count: toursTotal },
                { id: 'gallery', label: 'Gallery', icon: Camera, count: galleryTotal },
                { id: 'reviews', label: 'Reviews', icon: Star, count: reviewsTotal },
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
                  {tab.label}{tab.count !== undefined && tab.count > 0 ? ` (${tab.count})` : ''}
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

              {bookingsTotalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 mt-4">
                  <p className="text-sm text-gray-500">
                    Showing {((bookingsPage - 1) * PAGE_SIZE) + 1}-{Math.min(bookingsPage * PAGE_SIZE, bookingsTotal)} of {bookingsTotal}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBookingsPage(p => Math.max(1, p - 1))}
                      disabled={bookingsPage === 1}
                      className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">Page {bookingsPage} of {bookingsTotalPages}</span>
                    <button
                      onClick={() => setBookingsPage(p => Math.min(bookingsTotalPages, p + 1))}
                      disabled={bookingsPage === bookingsTotalPages}
                      className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
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

              {leadsTotalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 mt-4">
                  <p className="text-sm text-gray-500">
                    Showing {((leadsPage - 1) * PAGE_SIZE) + 1}-{Math.min(leadsPage * PAGE_SIZE, leadsTotal)} of {leadsTotal}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLeadsPage(p => Math.max(1, p - 1))}
                      disabled={leadsPage === 1}
                      className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">Page {leadsPage} of {leadsTotalPages}</span>
                    <button
                      onClick={() => setLeadsPage(p => Math.min(leadsTotalPages, p + 1))}
                      disabled={leadsPage === leadsTotalPages}
                      className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
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

              {financialsTotalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 mt-4">
                  <p className="text-sm text-gray-500">
                    Showing {((financialsPage - 1) * PAGE_SIZE) + 1}-{Math.min(financialsPage * PAGE_SIZE, financialsTotal)} of {financialsTotal}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFinancialsPage(p => Math.max(1, p - 1))}
                      disabled={financialsPage === 1}
                      className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">Page {financialsPage} of {financialsTotalPages}</span>
                    <button
                      onClick={() => setFinancialsPage(p => Math.min(financialsTotalPages, p + 1))}
                      disabled={financialsPage === financialsTotalPages}
                      className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tours Tab */}
          {activeTab === 'tours' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Tour Management</h3>
                <button onClick={() => { resetTourForm(); setTourDialogOpen(true); }} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  + Add Tour
                </button>
              </div>

              {toursLoading ? (
                <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div></div>
              ) : !allTours?.length ? (
                <div className="text-center py-12 text-gray-500">No tours yet. Add your first tour.</div>
              ) : (
                <div className="space-y-4">
                  {allTours.map(tour => (
                    <div key={tour.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="flex items-center gap-4 p-4">
                        <div className="w-20 h-16 rounded overflow-hidden shrink-0">
                          <img src={tour.imageUrl} alt={tour.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold truncate">{tour.name}</h4>
                            <span className="text-sm text-gray-500">/ {tour.nameHe}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span>{tour.duration}</span>
                            <span className="capitalize">{tour.difficulty}</span>
                            <span className="font-semibold text-primary">฿{tour.price.toLocaleString()}</span>
                            <span>Group: {tour.groupMinSize}-{tour.groupMaxSize}</span>
                          </div>
                          <div className="flex gap-1.5 mt-1.5">
                            {tour.isKosher === 1 && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Kosher</span>}
                            {tour.isPrivate === 1 && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Private</span>}
                            {tour.isShabbatOk === 1 && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">Shabbat OK</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${tour.isActive === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {tour.isActive === 1 ? 'Active' : 'Inactive'}
                          </span>
                          <button onClick={() => updateTourMut.mutate({ id: tour.id, data: { isActive: tour.isActive !== 1 } })} className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded text-xs hover:bg-yellow-200">
                            {tour.isActive === 1 ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => {
                            setEditingTour(tour);
                            setTourForm({
                              name: tour.name, nameHe: tour.nameHe,
                              description: tour.description, descriptionHe: tour.descriptionHe,
                              duration: tour.duration, difficulty: tour.difficulty,
                              price: tour.price, groupMinSize: tour.groupMinSize ?? 1, groupMaxSize: tour.groupMaxSize ?? 10,
                              imageUrl: tour.imageUrl, highlights: tour.highlights || '', highlightsHe: tour.highlightsHe || '',
                              isKosher: tour.isKosher === 1, isPrivate: tour.isPrivate === 1,
                              isShabbatOk: tour.isShabbatOk === 1, isActive: tour.isActive === 1,
                              sortOrder: tour.sortOrder ?? 0,
                            });
                            setTourDialogOpen(true);
                          }} className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200">Edit</button>
                          <button onClick={() => { if (confirm('Delete this tour?')) deleteTourMut.mutate({ id: tour.id }); }} className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {toursTotalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 mt-4">
                  <p className="text-sm text-gray-500">
                    Showing {((toursPage - 1) * PAGE_SIZE) + 1}-{Math.min(toursPage * PAGE_SIZE, toursTotal)} of {toursTotal}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setToursPage(p => Math.max(1, p - 1))}
                      disabled={toursPage === 1}
                      className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">Page {toursPage} of {toursTotalPages}</span>
                    <button
                      onClick={() => setToursPage(p => Math.min(toursTotalPages, p + 1))}
                      disabled={toursPage === toursTotalPages}
                      className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Tour Dialog */}
              {tourDialogOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-4">{editingTour ? 'Edit Tour' : 'Add Tour'}</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Name (English) *</label>
                          <input type="text" value={tourForm.name} onChange={e => setTourForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Name (Hebrew) *</label>
                          <input type="text" dir="rtl" value={tourForm.nameHe} onChange={e => setTourForm(p => ({ ...p, nameHe: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description (English) *</label>
                        <textarea value={tourForm.description} onChange={e => setTourForm(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description (Hebrew) *</label>
                        <textarea dir="rtl" value={tourForm.descriptionHe} onChange={e => setTourForm(p => ({ ...p, descriptionHe: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Duration *</label>
                          <input type="text" placeholder="e.g. 6-8 hours" value={tourForm.duration} onChange={e => setTourForm(p => ({ ...p, duration: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Difficulty</label>
                          <select value={tourForm.difficulty} onChange={e => setTourForm(p => ({ ...p, difficulty: e.target.value as any }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                            <option value="easy">Easy</option>
                            <option value="moderate">Moderate</option>
                            <option value="challenging">Challenging</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Price (THB) *</label>
                          <input type="number" value={tourForm.price} onChange={e => setTourForm(p => ({ ...p, price: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Min Group Size</label>
                          <input type="number" value={tourForm.groupMinSize} onChange={e => setTourForm(p => ({ ...p, groupMinSize: parseInt(e.target.value) || 1 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Max Group Size</label>
                          <input type="number" value={tourForm.groupMaxSize} onChange={e => setTourForm(p => ({ ...p, groupMaxSize: parseInt(e.target.value) || 10 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Image URL *</label>
                        <input type="text" value={tourForm.imageUrl} onChange={e => setTourForm(p => ({ ...p, imageUrl: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="/images/tour.jpg or https://..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Highlights (JSON array, English)</label>
                        <textarea value={tourForm.highlights} onChange={e => setTourForm(p => ({ ...p, highlights: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} placeholder='["Private 4x4 vehicle", "Kosher lunch", ...]' />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Highlights (JSON array, Hebrew)</label>
                        <textarea dir="rtl" value={tourForm.highlightsHe} onChange={e => setTourForm(p => ({ ...p, highlightsHe: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} placeholder='["רכב 4x4 פרטי", "ארוחת צהריים כשרה", ...]' />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Sort Order</label>
                          <input type="number" value={tourForm.sortOrder} onChange={e => setTourForm(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={tourForm.isKosher} onChange={e => setTourForm(p => ({ ...p, isKosher: e.target.checked }))} className="w-4 h-4" />
                          Kosher
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={tourForm.isPrivate} onChange={e => setTourForm(p => ({ ...p, isPrivate: e.target.checked }))} className="w-4 h-4" />
                          Private
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={tourForm.isShabbatOk} onChange={e => setTourForm(p => ({ ...p, isShabbatOk: e.target.checked }))} className="w-4 h-4" />
                          Shabbat OK
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={tourForm.isActive} onChange={e => setTourForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4" />
                          Active
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button onClick={() => { setTourDialogOpen(false); resetTourForm(); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                      <button onClick={() => {
                        const data = { ...tourForm, highlights: tourForm.highlights || undefined, highlightsHe: tourForm.highlightsHe || undefined };
                        if (editingTour) {
                          updateTourMut.mutate({ id: editingTour.id, data });
                        } else {
                          createTourMut.mutate(data);
                        }
                      }} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">{editingTour ? 'Save Changes' : 'Add Tour'}</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Gallery Management</h3>
                <button onClick={() => { resetPhotoForm(); setGalleryDialogOpen(true); }} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  + Add Photo
                </button>
              </div>

              {galleryLoading ? (
                <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div></div>
              ) : !galleryPhotos?.length ? (
                <div className="text-center py-12 text-gray-500">No gallery photos yet.</div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {galleryPhotos.map(photo => (
                    <div key={photo.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="aspect-[4/3] overflow-hidden">
                        <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm truncate">{photo.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs ${photo.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {photo.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{photo.category} | Order: {photo.sortOrder}</p>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingPhoto(photo); setPhotoForm({ title: photo.title, imageUrl: photo.imageUrl, description: photo.description || '', category: photo.category || 'other', sortOrder: photo.sortOrder || 0, isPublished: !!photo.isPublished }); setGalleryDialogOpen(true); }} className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200">Edit</button>
                          <button onClick={() => updatePhotoMut.mutate({ id: photo.id, data: { isPublished: !photo.isPublished } })} className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded text-xs hover:bg-yellow-200">{photo.isPublished ? 'Unpublish' : 'Publish'}</button>
                          <button onClick={() => { if (confirm('Delete this photo?')) deletePhotoMut.mutate({ id: photo.id }); }} className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {galleryTotalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 mt-4">
                  <p className="text-sm text-gray-500">
                    Showing {((galleryPage - 1) * PAGE_SIZE) + 1}-{Math.min(galleryPage * PAGE_SIZE, galleryTotal)} of {galleryTotal}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setGalleryPage(p => Math.max(1, p - 1))}
                      disabled={galleryPage === 1}
                      className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">Page {galleryPage} of {galleryTotalPages}</span>
                    <button
                      onClick={() => setGalleryPage(p => Math.min(galleryTotalPages, p + 1))}
                      disabled={galleryPage === galleryTotalPages}
                      className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Gallery Dialog */}
              {galleryDialogOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-4">{editingPhoto ? 'Edit Photo' : 'Add Photo'}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Title *</label>
                        <input type="text" value={photoForm.title} onChange={e => setPhotoForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Upload Image</label>
                        <div className="space-y-2">
                          <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {isUploading ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                                <span className="text-sm text-gray-500">Uploading...</span>
                              </div>
                            ) : photoForm.imageUrl ? (
                              <div>
                                <img src={photoForm.imageUrl} alt="Preview" className="max-h-32 mx-auto rounded mb-2" />
                                <p className="text-xs text-gray-500">Click to change image</p>
                              </div>
                            ) : (
                              <div>
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                                <p className="text-sm text-gray-500">Click to upload an image</p>
                                <p className="text-xs text-gray-400">JPG, PNG, WebP</p>
                              </div>
                            )}
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setIsUploading(true);
                              try {
                                const reader = new FileReader();
                                const base64 = await new Promise<string>((resolve, reject) => {
                                  reader.onload = () => {
                                    const result = reader.result as string;
                                    resolve(result.split(',')[1]);
                                  };
                                  reader.onerror = reject;
                                  reader.readAsDataURL(file);
                                });
                                const result = await uploadPhoto.mutateAsync({
                                  filename: file.name,
                                  contentType: file.type,
                                  base64Data: base64,
                                });
                                setPhotoForm(p => ({ ...p, imageUrl: result.url }));
                              } catch (err) {
                                console.error('Upload failed:', err);
                                alert('Failed to upload image. Please try again or paste a URL.');
                              } finally {
                                setIsUploading(false);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                              }
                            }}
                          />
                          <div className="text-center text-xs text-gray-400">or</div>
                          <input type="text" placeholder="Paste image URL" value={photoForm.imageUrl} onChange={e => setPhotoForm(p => ({ ...p, imageUrl: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea value={photoForm.description} onChange={e => setPhotoForm(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={3} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select value={photoForm.category} onChange={e => setPhotoForm(p => ({ ...p, category: e.target.value as 'tours' | 'vehicles' | 'destinations' | 'activities' | 'food' | 'accommodation' | 'other' }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                          <option value="tours">Tours</option>
                          <option value="vehicles">Vehicles</option>
                          <option value="destinations">Destinations</option>
                          <option value="activities">Activities</option>
                          <option value="food">Food</option>
                          <option value="accommodation">Accommodation</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Sort Order</label>
                        <input type="number" value={photoForm.sortOrder} onChange={e => setPhotoForm(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="isPublished" checked={photoForm.isPublished} onChange={e => setPhotoForm(p => ({ ...p, isPublished: e.target.checked }))} className="w-4 h-4" />
                        <label htmlFor="isPublished" className="text-sm font-medium">Published</label>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button onClick={() => { setGalleryDialogOpen(false); resetPhotoForm(); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                      <button disabled={isUploading} onClick={() => { if (editingPhoto) { updatePhotoMut.mutate({ id: editingPhoto.id, data: photoForm }); } else { createPhoto.mutate(photoForm); } }} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">{editingPhoto ? 'Save Changes' : 'Add Photo'}</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="p-6">
              {/* Stats */}
              {reviewStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-700">{reviewStats.totalReviews}</p>
                    <p className="text-sm text-blue-600">Total</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-700">{reviewStats.averageRating}</p>
                    <p className="text-sm text-yellow-600">Avg Rating</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-700">{reviewStats.approvedCount}</p>
                    <p className="text-sm text-green-600">Approved</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-orange-700">{reviewStats.totalReviews - reviewStats.approvedCount}</p>
                    <p className="text-sm text-orange-600">Pending/Rejected</p>
                  </div>
                </div>
              )}

              {/* Filter */}
              <div className="flex gap-2 mb-6">
                {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                  <button key={f} onClick={() => setReviewFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${reviewFilter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {reviewsLoading ? (
                <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div></div>
              ) : (
                <div className="space-y-4">
                  {allReviews?.filter(r => reviewFilter === 'all' || r.status === reviewFilter).map(review => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{review.name}</h4>
                          <p className="text-sm text-gray-500">{review.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">{[1,2,3,4,5].map(s => <span key={s} className={s <= review.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>)}</div>
                            {review.tourType && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{review.tourType}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${review.status === 'approved' ? 'bg-green-100 text-green-800' : review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{review.status}</span>
                          <span className="text-xs text-gray-400">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{review.text}</p>

                      {review.adminResponse && (
                        <div className="mb-3 pl-3 border-l-4 border-primary bg-primary/5 rounded-r p-2">
                          <p className="text-xs font-semibold text-primary">Admin Response:</p>
                          <p className="text-sm text-gray-600">{review.adminResponse}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {review.status !== 'approved' && <button onClick={() => updateReviewMut.mutate({ id: review.id, data: { status: 'approved' } })} className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">Approve</button>}
                        {review.status !== 'rejected' && <button onClick={() => updateReviewMut.mutate({ id: review.id, data: { status: 'rejected' } })} className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">Reject</button>}
                        <button onClick={() => { setRespondingReview(respondingReview === review.id ? null : review.id); setAdminResponseText(review.adminResponse || ''); }} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">{respondingReview === review.id ? 'Cancel' : 'Respond'}</button>
                        <button onClick={() => { if (confirm('Delete this review?')) deleteReviewMut.mutate({ id: review.id }); }} className="px-3 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200">Delete</button>
                      </div>

                      {respondingReview === review.id && (
                        <div className="mt-3 flex gap-2">
                          <textarea value={adminResponseText} onChange={e => setAdminResponseText(e.target.value)} placeholder="Write admin response..." className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} />
                          <button onClick={() => { updateReviewMut.mutate({ id: review.id, data: { adminResponse: adminResponseText } }); setRespondingReview(null); }} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">Save</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {reviewsTotalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 mt-4">
                  <p className="text-sm text-gray-500">
                    Showing {((reviewsPage - 1) * PAGE_SIZE) + 1}-{Math.min(reviewsPage * PAGE_SIZE, reviewsTotal)} of {reviewsTotal}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setReviewsPage(p => Math.max(1, p - 1))}
                      disabled={reviewsPage === 1}
                      className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">Page {reviewsPage} of {reviewsTotalPages}</span>
                    <button
                      onClick={() => setReviewsPage(p => Math.min(reviewsTotalPages, p + 1))}
                      disabled={reviewsPage === reviewsTotalPages}
                      className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
