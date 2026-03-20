import { useState, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { LOGIN_URL } from "@/const";
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  LogOut,
  Camera,
  Star,
  Mountain,
  FileText,
  UserCircle,
  Shield,
  Settings,
  Package,
  Receipt,
  ImageIcon,
  MessageCircle,
  BarChart3,
  MailCheck,
} from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";
import {
  BookingsTab,
  CalendarTab,
  AgentsTab,
  LeadsTab,
  FinancialTab,
  ToursTab,
  PackagesTab,
  GalleryTab,
  ReviewsTab,
  BlogTab,
  CRMTab,
  AccountingTab,
  UsersTab,
  TripPhotosTab,
  WhatsAppTab,
  DashboardCharts,
  AnalyticsTab,
  PostTourEmailsTab,
  PAGE_SIZE,
} from "@/components/admin";
import { SettingsTab } from "@/components/admin/SettingsTab";
import { AbandonedBookingsTab } from "@/components/admin/AbandonedBookingsTab";

function TabBadge({
  count,
  color,
}: {
  count: number;
  color: "red" | "orange" | "gray";
}) {
  if (count === 0) return null;
  const colors = {
    red: "bg-red-500 text-white",
    orange: "bg-orange-500 text-white",
    gray: "bg-gray-200 text-gray-700",
  };
  return (
    <span
      className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${colors[color]}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

type AdminTabId =
  | "analytics"
  | "crm"
  | "bookings"
  | "calendar"
  | "agents"
  | "leads"
  | "financial"
  | "accounting"
  | "gallery"
  | "reviews"
  | "tours"
  | "packages"
  | "blog"
  | "users"
  | "tripPhotos"
  | "whatsapp"
  | "postTourEmails"
  | "abandoned"
  | "settings";

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTabId>("analytics");

  const isAdmin = !!user && user.role === "admin";

  // Fetch summary data for stats cards and tab counts
  const { data: bookingsData } = trpc.booking.listPaginated.useQuery(
    { page: 1, pageSize: PAGE_SIZE },
    { enabled: isAdmin }
  );
  const bookings = bookingsData?.items;
  const bookingsTotal = bookingsData?.total ?? 0;

  const { data: agents } = trpc.agent.list.useQuery(undefined, {
    enabled: isAdmin,
  });
  const { data: leadsData } = trpc.lead.listPaginated.useQuery(
    { page: 1, pageSize: PAGE_SIZE },
    { enabled: isAdmin }
  );
  const leadsTotal = leadsData?.total ?? 0;

  const { data: financialsData } = trpc.financial.listAllPaginated.useQuery(
    { page: 1, pageSize: PAGE_SIZE },
    { enabled: isAdmin }
  );
  const financials = financialsData?.items;
  const financialsTotal = financialsData?.total ?? 0;

  const { data: galleryData } = trpc.gallery.listAllPaginated.useQuery(
    { page: 1, pageSize: PAGE_SIZE },
    { enabled: isAdmin }
  );
  const galleryTotal = galleryData?.total ?? 0;

  const { data: reviewsData } = trpc.review.listAllPaginated.useQuery(
    { page: 1, pageSize: PAGE_SIZE },
    { enabled: isAdmin }
  );
  const reviewsTotal = reviewsData?.total ?? 0;

  const { data: toursData } = trpc.tour.listAllPaginated.useQuery(
    { page: 1, pageSize: PAGE_SIZE },
    { enabled: isAdmin }
  );
  const toursTotal = toursData?.total ?? 0;

  const { data: blogData } = trpc.blog.listAllPaginated.useQuery(
    { page: 1, pageSize: PAGE_SIZE },
    { enabled: isAdmin }
  );
  const blogTotal = blogData?.total ?? 0;

  // Dashboard stats and badge counts
  const { data: dashboardStats } = trpc.dashboard.stats.useQuery(undefined, {
    enabled: isAdmin,
  });
  const { data: badges } = trpc.dashboard.badgeCounts.useQuery(undefined, {
    enabled: isAdmin,
  });

  const userRole = user?.role ?? "";
  const tabs = useMemo(
    () => [
      {
        id: "analytics" as const,
        label: "Analytics",
        icon: BarChart3,
        count: undefined,
      },
      { id: "crm" as const, label: "CRM", icon: UserCircle, count: undefined },
      {
        id: "bookings" as const,
        label: "Bookings",
        icon: Calendar,
        count: bookingsTotal,
      },
      {
        id: "calendar" as const,
        label: "Calendar",
        icon: Calendar,
        count: undefined,
      },
      {
        id: "agents" as const,
        label: "Agents",
        icon: Users,
        count: agents?.length,
      },
      {
        id: "leads" as const,
        label: "Leads",
        icon: TrendingUp,
        count: leadsTotal,
      },
      {
        id: "financial" as const,
        label: "Financial",
        icon: DollarSign,
        count: financialsTotal,
      },
      {
        id: "accounting" as const,
        label: "Accounting",
        icon: Receipt,
        count: undefined,
      },
      {
        id: "tours" as const,
        label: "Tours",
        icon: Mountain,
        count: toursTotal,
      },
      {
        id: "packages" as const,
        label: "Packages",
        icon: Package,
        count: undefined,
      },
      {
        id: "gallery" as const,
        label: "Gallery",
        icon: Camera,
        count: galleryTotal,
      },
      {
        id: "tripPhotos" as const,
        label: "Trip Photos",
        icon: ImageIcon,
        count: undefined,
      },
      { id: "blog" as const, label: "Blog", icon: FileText, count: blogTotal },
      {
        id: "reviews" as const,
        label: "Reviews",
        icon: Star,
        count: reviewsTotal,
      },
      ...(["admin", "owner"].includes(userRole)
        ? [
            {
              id: "users" as const,
              label: "Users",
              icon: Shield,
              count: undefined,
            },
          ]
        : []),
      {
        id: "whatsapp" as const,
        label: "WhatsApp",
        icon: MessageCircle,
        count: undefined,
      },
      {
        id: "postTourEmails" as const,
        label: "Follow-up",
        icon: MailCheck,
        count: undefined,
      },
      {
        id: "abandoned" as const,
        label: "Abandoned",
        icon: Clock,
        count: undefined,
      },
      {
        id: "settings" as const,
        label: "Settings",
        icon: Settings,
        count: undefined,
      },
    ],
    [
      userRole,
      bookingsTotal,
      agents?.length,
      leadsTotal,
      financialsTotal,
      toursTotal,
      galleryTotal,
      blogTotal,
      reviewsTotal,
    ]
  );

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
      let newIndex: number | null = null;

      switch (e.key) {
        case "ArrowRight":
          newIndex = (currentIndex + 1) % tabs.length;
          break;
        case "ArrowLeft":
          newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          break;
        case "Home":
          newIndex = 0;
          break;
        case "End":
          newIndex = tabs.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      setActiveTab(tabs[newIndex].id);
      tabRefs.current[newIndex]?.focus();
    },
    [activeTab, tabs]
  );

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="bg-card p-8 rounded-2xl shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
          <p className="text-muted-foreground mb-6">
            Please log in to access the admin dashboard.
          </p>
          <a
            href={LOGIN_URL}
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
    pendingBookings: bookings?.filter(b => b.status === "pending").length || 0,
    confirmedBookings:
      bookings?.filter(b => b.status === "confirmed").length || 0,
    totalRevenue:
      financials
        ?.filter(f => f.type === "revenue")
        .reduce((sum, f) => sum + Number(f.amount), 0) || 0,
  };

  // Navigate to filtered views
  const handleFilterBookings = (filter: string) => {
    if (filter === "leads") {
      setActiveTab("leads");
    } else {
      setActiveTab("bookings");
    }
  };

  const tabBadgeMap: Partial<
    Record<AdminTabId, { count: number; color: "red" | "orange" | "gray" }>
  > = {
    crm: { count: badges?.crm ?? 0, color: "gray" },
    bookings: { count: badges?.bookings ?? 0, color: "red" },
    calendar: { count: badges?.calendar ?? 0, color: "gray" },
    leads: { count: badges?.leads ?? 0, color: "orange" },
    reviews: { count: badges?.reviews ?? 0, color: "orange" },
    blog: { count: badges?.blog ?? 0, color: "gray" },
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-card shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-bold text-primary truncate">
              WIRO 4x4 Admin
            </h1>
            <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">
              Welcome, {user.name || user.email}
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors hidden sm:inline"
            >
              View Site
            </a>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1 md:gap-2 text-sm text-muted-foreground hover:text-red-600 transition-colors min-h-[44px] min-w-[44px] justify-center"
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
          <button
            onClick={() => setActiveTab("bookings")}
            className="bg-card rounded-xl p-4 md:p-6 shadow-sm text-left hover:ring-2 hover:ring-primary/20 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Total Bookings
                </p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">
                  {stats.totalBookings}
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className="bg-card rounded-xl p-4 md:p-6 shadow-sm text-left hover:ring-2 hover:ring-primary/20 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl md:text-3xl font-bold text-yellow-600">
                  {stats.pendingBookings}
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
              </div>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className="bg-card rounded-xl p-4 md:p-6 shadow-sm text-left hover:ring-2 hover:ring-primary/20 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Confirmed
                </p>
                <p className="text-2xl md:text-3xl font-bold text-green-600">
                  {stats.confirmedBookings}
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("financial")}
            className="bg-card rounded-xl p-4 md:p-6 shadow-sm text-left hover:ring-2 hover:ring-primary/20 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Revenue
                </p>
                <p className="text-2xl md:text-3xl font-bold text-primary">
                  &#3647;{stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
            </div>
          </button>
        </div>

        {/* Dashboard Charts */}
        {dashboardStats && (
          <div className="mb-6">
            <DashboardCharts
              stats={dashboardStats}
              onFilterBookings={handleFilterBookings}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="bg-card rounded-xl shadow-sm mb-6">
          <div className="border-b border-border">
            <nav
              role="tablist"
              aria-label="Admin sections"
              className="flex gap-1 md:gap-6 px-3 md:px-6 overflow-x-auto scrollbar-hide"
            >
              {tabs.map((tab, index) => {
                const badge = tabBadgeMap[tab.id];
                return (
                  <button
                    key={tab.id}
                    ref={el => {
                      tabRefs.current[index] = el;
                    }}
                    role="tab"
                    id={`tab-${tab.id}`}
                    aria-selected={activeTab === tab.id}
                    aria-controls={`tabpanel-${tab.id}`}
                    tabIndex={activeTab === tab.id ? 0 : -1}
                    onClick={() => setActiveTab(tab.id)}
                    onKeyDown={handleTabKeyDown}
                    className={`flex items-center gap-1.5 md:gap-2 py-3 md:py-4 px-2 md:px-1 border-b-2 transition-colors whitespace-nowrap text-sm md:text-base min-h-[44px] ${
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                    {badge && (
                      <TabBadge count={badge.count} color={badge.color} />
                    )}
                    {!badge && tab.count !== undefined && tab.count > 0 ? (
                      <span className="text-xs">({tab.count})</span>
                    ) : (
                      ""
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {activeTab === "analytics" && (
            <div
              role="tabpanel"
              id="tabpanel-analytics"
              aria-labelledby="tab-analytics"
            >
              <ErrorBoundary level="section" key="analytics">
                <AnalyticsTab />
              </ErrorBoundary>
            </div>
          )}
          {activeTab === "crm" && (
            <div role="tabpanel" id="tabpanel-crm" aria-labelledby="tab-crm">
              <ErrorBoundary level="section" key="crm">
                <CRMTab />
              </ErrorBoundary>
            </div>
          )}
          {activeTab === "bookings" && (
            <div
              role="tabpanel"
              id="tabpanel-bookings"
              aria-labelledby="tab-bookings"
            >
              <ErrorBoundary level="section" key="bookings">
                <BookingsTab />
              </ErrorBoundary>
            </div>
          )}
          {activeTab === "calendar" && (
            <div
              role="tabpanel"
              id="tabpanel-calendar"
              aria-labelledby="tab-calendar"
            >
              <ErrorBoundary level="section" key="calendar">
                <CalendarTab />
              </ErrorBoundary>
            </div>
          )}
          {activeTab === "agents" && (
            <div
              role="tabpanel"
              id="tabpanel-agents"
              aria-labelledby="tab-agents"
            >
              <ErrorBoundary level="section" key="agents">
                <AgentsTab />
              </ErrorBoundary>
            </div>
          )}
          {activeTab === "leads" && (
            <div
              role="tabpanel"
              id="tabpanel-leads"
              aria-labelledby="tab-leads"
            >
              <ErrorBoundary level="section" key="leads">
                <LeadsTab />
              </ErrorBoundary>
            </div>
          )}
          {activeTab === "financial" && (
            <div
              role="tabpanel"
              id="tabpanel-financial"
              aria-labelledby="tab-financial"
            >
              <ErrorBoundary level="section" key="financial">
                <FinancialTab />
              </ErrorBoundary>
            </div>
          )}
          {activeTab === "accounting" && (
            <div
              role="tabpanel"
              id="tabpanel-accounting"
              aria-labelledby="tab-accounting"
            >
              <ErrorBoundary level="section" key="accounting">
                <AccountingTab />
              </ErrorBoundary>
            </div>
          )}
          {activeTab === "tours" && (
            <div
              role="tabpanel"
              id="tabpanel-tours"
              aria-labelledby="tab-tours"
            >
              <ErrorBoundary level="section" key="tours">
                <ToursTab />
              </ErrorBoundary>
            </div>
          )}
          {activeTab === "packages" && (
            <div
              role="tabpanel"
              id="tabpanel-packages"
              aria-labelledby="tab-packages"
            >
              <ErrorBoundary level="section" key="packages">
                <PackagesTab />
              </ErrorBoundary>
            </div>
          )}
          {activeTab === "gallery" && (
            <div
              role="tabpanel"
              id="tabpanel-gallery"
              aria-labelledby="tab-gallery"
            >
              <ErrorBoundary level="section" key="gallery">
                <GalleryTab />
              </ErrorBoundary>
            </div>
          )}
          {activeTab === "tripPhotos" && (
            <div
              role="tabpanel"
              id="tabpanel-tripPhotos"
              aria-labelledby="tab-tripPhotos"
            >
              <ErrorBoundary level="section" key="tripPhotos">
                <TripPhotosTab />
              </ErrorBoundary>
            </div>
          )}
          {activeTab === "reviews" && (
            <div
              role="tabpanel"
              id="tabpanel-reviews"
              aria-labelledby="tab-reviews"
            >
              <ErrorBoundary level="section" key="reviews">
                <ReviewsTab />
              </ErrorBoundary>
            </div>
          )}
          {activeTab === "blog" && (
            <div role="tabpanel" id="tabpanel-blog" aria-labelledby="tab-blog">
              <ErrorBoundary level="section" key="blog">
                <BlogTab />
              </ErrorBoundary>
            </div>
          )}
          {activeTab === "users" && (
            <div
              role="tabpanel"
              id="tabpanel-users"
              aria-labelledby="tab-users"
            >
              <ErrorBoundary level="section" key="users">
                <UsersTab />
              </ErrorBoundary>
            </div>
          )}
          {activeTab === "whatsapp" && (
            <div
              role="tabpanel"
              id="tabpanel-whatsapp"
              aria-labelledby="tab-whatsapp"
            >
              <ErrorBoundary level="section" key="whatsapp">
                <WhatsAppTab />
              </ErrorBoundary>
            </div>
          )}
          {activeTab === "postTourEmails" && (
            <div
              role="tabpanel"
              id="tabpanel-postTourEmails"
              aria-labelledby="tab-postTourEmails"
            >
              <ErrorBoundary level="section" key="postTourEmails">
                <PostTourEmailsTab />
              </ErrorBoundary>
            </div>
          )}
          {activeTab === "abandoned" && (
            <div
              role="tabpanel"
              id="tabpanel-abandoned"
              aria-labelledby="tab-abandoned"
            >
              <ErrorBoundary level="section" key="abandoned">
                <div className="bg-card rounded-sm border p-4 md:p-6">
                  <AbandonedBookingsTab />
                </div>
              </ErrorBoundary>
            </div>
          )}
          {activeTab === "settings" && (
            <div
              role="tabpanel"
              id="tabpanel-settings"
              aria-labelledby="tab-settings"
            >
              <ErrorBoundary level="section" key="settings">
                <SettingsTab />
              </ErrorBoundary>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
