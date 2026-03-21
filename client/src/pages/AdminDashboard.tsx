import { useState, useRef, useCallback, useMemo, useEffect } from "react";
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
  Plus,
  Mail,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronRight,
  X,
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
      className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${colors[color]}`}
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

type SidebarSection = {
  id: string;
  label: string;
  items: AdminTabId[];
};

const SIDEBAR_SECTIONS: SidebarSection[] = [
  { id: "overview", label: "OVERVIEW", items: ["analytics", "crm"] },
  {
    id: "operations",
    label: "OPERATIONS",
    items: ["bookings", "calendar", "agents", "tours", "packages"],
  },
  {
    id: "sales",
    label: "SALES",
    items: ["leads", "abandoned", "postTourEmails"],
  },
  {
    id: "marketing",
    label: "MARKETING",
    items: ["blog", "reviews", "whatsapp", "gallery", "tripPhotos"],
  },
  { id: "finance", label: "FINANCE", items: ["financial", "accounting"] },
  { id: "system", label: "SYSTEM", items: ["users", "settings"] },
];

const COLLAPSED_KEY = "admin-sidebar-collapsed";
const SECTIONS_KEY = "admin-sidebar-sections";

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTabId>("analytics");

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    () => {
      try {
        const saved = localStorage.getItem(SECTIONS_KEY);
        return saved ? new Set(JSON.parse(saved)) : new Set<string>();
      } catch {
        return new Set<string>();
      }
    }
  );

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, String(sidebarCollapsed));
    } catch {
      /* ignore */
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    try {
      localStorage.setItem(
        SECTIONS_KEY,
        JSON.stringify(Array.from(collapsedSections))
      );
    } catch {
      /* ignore */
    }
  }, [collapsedSections]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    if (sidebarOpen) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [sidebarOpen]);

  const isAdmin = !!user && user.role === "admin";

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
      {
        id: "crm" as const,
        label: "CRM",
        icon: UserCircle,
        count: undefined,
      },
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

  const tabMap = useMemo(() => {
    const map = new Map<AdminTabId, (typeof tabs)[number]>();
    for (const tab of tabs) map.set(tab.id, tab);
    return map;
  }, [tabs]);

  const visibleTabIds = useMemo(() => {
    const ids: AdminTabId[] = [];
    for (const section of SIDEBAR_SECTIONS) {
      for (const itemId of section.items) {
        if (tabMap.has(itemId)) ids.push(itemId);
      }
    }
    return ids;
  }, [tabMap]);

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const currentIndex = visibleTabIds.indexOf(activeTab);
      let newIndex: number | null = null;

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          newIndex = (currentIndex + 1) % visibleTabIds.length;
          break;
        case "ArrowUp":
        case "ArrowLeft":
          newIndex =
            (currentIndex - 1 + visibleTabIds.length) % visibleTabIds.length;
          break;
        case "Home":
          newIndex = 0;
          break;
        case "End":
          newIndex = visibleTabIds.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      setActiveTab(visibleTabIds[newIndex]);
      tabRefs.current[newIndex]?.focus();
    },
    [activeTab, visibleTabIds]
  );

  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  const handleNavClick = useCallback((tabId: AdminTabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  }, []);

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

  const handleFilterBookings = (filter: string) => {
    if (filter === "leads") {
      setActiveTab("leads");
    } else {
      setActiveTab("bookings");
    }
  };

  const renderSidebarContent = () => (
    <nav
      role="tablist"
      aria-label="Admin sections"
      className="flex flex-col py-2"
    >
      {SIDEBAR_SECTIONS.map(section => {
        const sectionItems = section.items
          .map(id => tabMap.get(id))
          .filter(Boolean) as (typeof tabs)[number][];
        if (sectionItems.length === 0) return null;

        const isOpen = !collapsedSections.has(section.id);

        return (
          <div key={section.id} className="mb-1">
            {!sidebarCollapsed && (
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase hover:text-muted-foreground transition-colors"
              >
                <span>{section.label}</span>
                {isOpen ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}

            {sidebarCollapsed && (
              <div className="mx-2 my-1 border-t border-border" />
            )}

            {(isOpen || sidebarCollapsed) &&
              sectionItems.map(tab => {
                const globalIndex = visibleTabIds.indexOf(tab.id);
                const isActive = activeTab === tab.id;
                const badge = tabBadgeMap[tab.id];

                return (
                  <button
                    key={tab.id}
                    ref={el => {
                      if (globalIndex >= 0) tabRefs.current[globalIndex] = el;
                    }}
                    role="tab"
                    id={`tab-${tab.id}`}
                    aria-selected={isActive}
                    aria-controls={`tabpanel-${tab.id}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => handleNavClick(tab.id)}
                    onKeyDown={handleTabKeyDown}
                    title={sidebarCollapsed ? tab.label : undefined}
                    className={`group relative flex items-center gap-3 w-full min-h-[40px] transition-colors ${
                      sidebarCollapsed ? "justify-center px-2" : "px-4"
                    } ${
                      isActive
                        ? "bg-primary/10 text-primary border-l-2 border-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground border-l-2 border-transparent"
                    }`}
                  >
                    <tab.icon className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="text-sm truncate">{tab.label}</span>
                        {badge && (
                          <TabBadge count={badge.count} color={badge.color} />
                        )}
                        {!badge && tab.count !== undefined && tab.count > 0 && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            {tab.count}
                          </span>
                        )}
                      </>
                    )}
                    {sidebarCollapsed && (
                      <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium bg-foreground text-background rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                        {tab.label}
                        {badge && badge.count > 0 && ` (${badge.count})`}
                      </span>
                    )}
                    {sidebarCollapsed && badge && badge.count > 0 && (
                      <span
                        className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                          badge.color === "red"
                            ? "bg-red-500"
                            : badge.color === "orange"
                              ? "bg-orange-500"
                              : "bg-gray-400"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-card shadow-sm sticky top-0 z-30">
        <div className="px-4 py-3 md:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-bold text-primary truncate">
                WIRO 4x4 Admin
              </h1>
              <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">
                Welcome, {user.name || user.email}
              </span>
            </div>
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

      <div className="flex">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <aside
          className={`
            fixed top-0 left-0 z-50 h-full bg-card border-r border-border flex flex-col
            transition-all duration-200 ease-in-out
            lg:sticky lg:top-[57px] lg:h-[calc(100vh-57px)] lg:z-20
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            ${sidebarCollapsed ? "lg:w-14" : "lg:w-60"}
            w-64
          `}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border lg:hidden">
            <span className="font-semibold text-sm text-foreground">
              Navigation
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
              aria-label="Close navigation menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden lg:flex items-center justify-end px-2 py-2 border-b border-border">
            <button
              onClick={() => setSidebarCollapsed(prev => !prev)}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              aria-label={
                sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {renderSidebarContent()}
          </div>
        </aside>

        <main className="flex-1 min-w-0 p-4 lg:p-6 xl:p-8">
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

          {dashboardStats && (
            <div className="mb-6">
              <DashboardCharts
                stats={dashboardStats}
                onFilterBookings={handleFilterBookings}
              />
            </div>
          )}

          <div className="mb-6 overflow-x-auto scrollbar-hide">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {[
                {
                  label: "New Booking",
                  icon: Calendar,
                  iconExtra: Plus,
                  tab: "bookings" as AdminTabId,
                  badge: undefined as number | undefined,
                  badgeColor: undefined as "red" | "orange" | undefined,
                },
                {
                  label: "Send Newsletter",
                  icon: Mail,
                  iconExtra: undefined,
                  tab: "blog" as AdminTabId,
                  badge: undefined as number | undefined,
                  badgeColor: undefined as "red" | "orange" | undefined,
                },
                {
                  label: "New Leads",
                  icon: TrendingUp,
                  iconExtra: undefined,
                  tab: "leads" as AdminTabId,
                  badge: badges?.leads ?? 0,
                  badgeColor: "orange" as const,
                },
                {
                  label: "Pending Reviews",
                  icon: Star,
                  iconExtra: undefined,
                  tab: "reviews" as AdminTabId,
                  badge: badges?.reviews ?? 0,
                  badgeColor: "orange" as const,
                },
                {
                  label: "Recovery Emails",
                  icon: Clock,
                  iconExtra: undefined,
                  tab: "abandoned" as AdminTabId,
                  badge:
                    (badges as Record<string, number> | undefined)?.abandoned ??
                    0,
                  badgeColor: "red" as const,
                },
                {
                  label: "Create Tour",
                  icon: Mountain,
                  iconExtra: Plus,
                  tab: "tours" as AdminTabId,
                  badge: undefined as number | undefined,
                  badgeColor: undefined as "red" | "orange" | undefined,
                },
              ].map(action => (
                <button
                  key={action.label}
                  onClick={() => setActiveTab(action.tab)}
                  className="relative flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2.5 hover:border-primary/30 hover:shadow-sm transition-all text-left group"
                >
                  <div className="relative shrink-0">
                    <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    {action.iconExtra && (
                      <action.iconExtra className="w-2.5 h-2.5 text-primary absolute -top-1 -right-1.5" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-foreground truncate">
                    {action.label}
                  </span>
                  {action.badge !== undefined && action.badge > 0 && (
                    <span
                      className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        action.badgeColor === "red"
                          ? "bg-red-500 text-white"
                          : "bg-orange-500 text-white"
                      }`}
                    >
                      {action.badge > 99 ? "99+" : action.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm">
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
              <div
                role="tabpanel"
                id="tabpanel-blog"
                aria-labelledby="tab-blog"
              >
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
        </main>
      </div>
    </div>
  );
}
