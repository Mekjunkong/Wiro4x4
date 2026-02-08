import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { getLoginUrl } from '@/const';
import {
  Calendar, Users, DollarSign, TrendingUp,
  CheckCircle, Clock, LogOut,
  Camera, Star, Mountain, FileText
} from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import {
  BookingsTab,
  CalendarTab,
  AgentsTab,
  LeadsTab,
  FinancialTab,
  ToursTab,
  GalleryTab,
  ReviewsTab,
  BlogTab,
  PAGE_SIZE,
} from '@/components/admin';

type AdminTabId = 'bookings' | 'calendar' | 'agents' | 'leads' | 'financial' | 'gallery' | 'reviews' | 'tours' | 'blog';

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTabId>('bookings');

  // Fetch summary data for stats cards and tab counts
  const { data: bookingsData } = trpc.booking.listPaginated.useQuery({ page: 1, pageSize: PAGE_SIZE });
  const bookings = bookingsData?.items;
  const bookingsTotal = bookingsData?.total ?? 0;

  const { data: agents } = trpc.agent.list.useQuery();
  const { data: leadsData } = trpc.lead.listPaginated.useQuery({ page: 1, pageSize: PAGE_SIZE });
  const leadsTotal = leadsData?.total ?? 0;

  const { data: financialsData } = trpc.financial.listAllPaginated.useQuery({ page: 1, pageSize: PAGE_SIZE });
  const financials = financialsData?.items;
  const financialsTotal = financialsData?.total ?? 0;

  const { data: galleryData } = trpc.gallery.listAllPaginated.useQuery({ page: 1, pageSize: PAGE_SIZE });
  const galleryTotal = galleryData?.total ?? 0;

  const { data: reviewsData } = trpc.review.listAllPaginated.useQuery({ page: 1, pageSize: PAGE_SIZE });
  const reviewsTotal = reviewsData?.total ?? 0;

  const { data: toursData } = trpc.tour.listAllPaginated.useQuery({ page: 1, pageSize: PAGE_SIZE });
  const toursTotal = toursData?.total ?? 0;

  const { data: blogData } = trpc.blog.listAllPaginated.useQuery({ page: 1, pageSize: PAGE_SIZE });
  const blogTotal = blogData?.total ?? 0;

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

  // Calculate stats
  const stats = {
    totalBookings: bookingsTotal,
    pendingBookings: bookings?.filter(b => b.status === 'pending').length || 0,
    confirmedBookings: bookings?.filter(b => b.status === 'confirmed').length || 0,
    totalRevenue: financials?.filter(f => f.type === 'revenue').reduce((sum, f) => sum + Number(f.amount), 0) || 0,
  };

  const tabs: { id: AdminTabId; label: string; icon: typeof Calendar; count: number | undefined }[] = [
    { id: 'bookings', label: 'Bookings', icon: Calendar, count: bookingsTotal },
    { id: 'calendar', label: 'Calendar', icon: Calendar, count: undefined },
    { id: 'agents', label: 'Agents', icon: Users, count: agents?.length },
    { id: 'leads', label: 'Leads', icon: TrendingUp, count: leadsTotal },
    { id: 'financial', label: 'Financial', icon: DollarSign, count: financialsTotal },
    { id: 'tours', label: 'Tours', icon: Mountain, count: toursTotal },
    { id: 'gallery', label: 'Gallery', icon: Camera, count: galleryTotal },
    { id: 'blog', label: 'Blog', icon: FileText, count: blogTotal },
    { id: 'reviews', label: 'Reviews', icon: Star, count: reviewsTotal },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-bold text-primary truncate">WIRO 4x4 Admin</h1>
            <span className="text-xs md:text-sm text-gray-500 hidden sm:inline">Welcome, {user.name || user.email}</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <a href="/" className="text-sm text-gray-600 hover:text-primary transition-colors hidden sm:inline">
              View Site
            </a>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1 md:gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors min-h-[44px] min-w-[44px] justify-center"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500">Total Bookings</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500">Pending</p>
                <p className="text-2xl md:text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500">Confirmed</p>
                <p className="text-2xl md:text-3xl font-bold text-green-600">{stats.confirmedBookings}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500">Revenue</p>
                <p className="text-2xl md:text-3xl font-bold text-primary">&#3647;{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-1 md:gap-6 px-3 md:px-6 overflow-x-auto scrollbar-hide">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 md:gap-2 py-3 md:py-4 px-2 md:px-1 border-b-2 transition-colors whitespace-nowrap text-sm md:text-base min-h-[44px] ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  {tab.count !== undefined && tab.count > 0 ? <span className="text-xs">({tab.count})</span> : ''}
                </button>
              ))}
            </nav>
          </div>

          {activeTab === 'bookings' && (
            <ErrorBoundary level="section" key="bookings">
              <BookingsTab />
            </ErrorBoundary>
          )}
          {activeTab === 'calendar' && (
            <ErrorBoundary level="section" key="calendar">
              <CalendarTab />
            </ErrorBoundary>
          )}
          {activeTab === 'agents' && (
            <ErrorBoundary level="section" key="agents">
              <AgentsTab />
            </ErrorBoundary>
          )}
          {activeTab === 'leads' && (
            <ErrorBoundary level="section" key="leads">
              <LeadsTab />
            </ErrorBoundary>
          )}
          {activeTab === 'financial' && (
            <ErrorBoundary level="section" key="financial">
              <FinancialTab />
            </ErrorBoundary>
          )}
          {activeTab === 'tours' && (
            <ErrorBoundary level="section" key="tours">
              <ToursTab />
            </ErrorBoundary>
          )}
          {activeTab === 'gallery' && (
            <ErrorBoundary level="section" key="gallery">
              <GalleryTab />
            </ErrorBoundary>
          )}
          {activeTab === 'reviews' && (
            <ErrorBoundary level="section" key="reviews">
              <ReviewsTab />
            </ErrorBoundary>
          )}
          {activeTab === 'blog' && (
            <ErrorBoundary level="section" key="blog">
              <BlogTab />
            </ErrorBoundary>
          )}
        </div>
      </div>
    </div>
  );
}
