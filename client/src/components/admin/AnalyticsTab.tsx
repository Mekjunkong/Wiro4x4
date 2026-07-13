import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DollarSign,
  Calendar,
  Users,
  Star,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Mail,
} from "lucide-react";
import { AttributionAnalytics } from "./AttributionAnalytics";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString()}`;
}

function shortMonth(ym: string) {
  const [y, m] = ym.split("-");
  const d = new Date(Number(y), Number(m) - 1);
  return d.toLocaleString("en", { month: "short" });
}

function timeAgo(date: Date | string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KPICard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  change,
  suffix,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  change?: number | null;
  suffix?: string;
}) {
  return (
    <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs md:text-sm text-muted-foreground truncate">
            {label}
          </p>
          <p className="text-2xl md:text-3xl font-bold text-foreground mt-1">
            {value}
            {suffix && (
              <span className="text-base font-normal text-muted-foreground ml-1">
                {suffix}
              </span>
            )}
          </p>
          {change != null && (
            <div
              className={`flex items-center gap-1 mt-1 text-xs font-medium ${
                change >= 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {change >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>
                {change >= 0 ? "+" : ""}
                {change}%
              </span>
              <span className="text-muted-foreground font-normal">
                vs last month
              </span>
            </div>
          )}
        </div>
        <div
          className={`w-10 h-10 md:w-12 md:h-12 ${iconBg} rounded-full flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-5 h-5 md:w-6 md:h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

/** CSS-only bar chart. */
function RevenueBarChart({
  data,
  t,
}: {
  data: { month: string; total: number }[];
  t: (en: string, he: string) => string;
}) {
  const maxVal = Math.max(...data.map(d => d.total), 1);

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        {t("Monthly Revenue", "הכנסות חודשיות")}
      </h3>
      <div className="flex items-end gap-1.5 md:gap-2 h-48 md:h-56">
        {data.map(d => {
          const pct = Math.max((d.total / maxVal) * 100, 2);
          return (
            <div
              key={d.month}
              className="flex-1 flex flex-col items-center justify-end h-full group"
            >
              {/* Tooltip on hover */}
              <div className="relative mb-1">
                <span className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-10">
                  {formatCurrency(d.total)}
                </span>
              </div>
              {/* Bar */}
              <div
                className="w-full rounded-t-sm bg-accent transition-all duration-300 group-hover:opacity-80"
                style={{ height: `${pct}%` }}
                title={`${shortMonth(d.month)}: ${formatCurrency(d.total)}`}
              />
              {/* Label */}
              <span className="text-[9px] md:text-[10px] text-muted-foreground mt-1.5 leading-none">
                {shortMonth(d.month)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** CSS-only dot/line chart for bookings trend. */
function BookingsTrendChart({
  data,
  t,
}: {
  data: { month: string; total: number }[];
  t: (en: string, he: string) => string;
}) {
  const maxVal = Math.max(...data.map(d => d.total), 1);
  const totalWidth = 100;
  const gap = totalWidth / (data.length - 1 || 1);

  // SVG-based line chart
  const points = data.map((d, i) => ({
    x: i * gap,
    y: 100 - (d.total / maxVal) * 85 - 5, // keep 5% padding top/bottom
  }));
  const polyline = points.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        {t("Bookings Trend", "מגמת הזמנות")}
      </h3>
      <div className="h-48 md:h-56 relative">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="border-b border-border/50" />
          ))}
        </div>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Area fill */}
          <polygon
            points={`0,100 ${polyline} ${totalWidth},100`}
            className="fill-primary/10"
          />
          {/* Line */}
          <polyline
            points={polyline}
            fill="none"
            className="stroke-primary"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
          {/* Dots */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="2"
              className="fill-primary"
              vectorEffect="non-scaling-stroke"
            >
              <title>
                {shortMonth(data[i].month)}: {data[i].total}
              </title>
            </circle>
          ))}
        </svg>
        {/* X-axis labels */}
        <div className="flex justify-between mt-1.5">
          {data.map((d, i) => (
            <span
              key={d.month}
              className="text-[9px] md:text-[10px] text-muted-foreground"
              style={{ width: 0, textAlign: "center" }}
            >
              {i % 2 === 0 || data.length <= 6 ? shortMonth(d.month) : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Horizontal lead conversion funnel. */
function LeadFunnel({
  funnel,
  totalLeads,
  t,
}: {
  funnel: {
    new: number;
    contacted: number;
    quoted: number;
    converted: number;
    lost: number;
  };
  totalLeads: number;
  t: (en: string, he: string) => string;
}) {
  const stages = [
    {
      key: "new",
      label: t("New", "חדש"),
      count: funnel.new,
      color: "bg-blue-500",
    },
    {
      key: "contacted",
      label: t("Contacted", "נוצר קשר"),
      count: funnel.contacted,
      color: "bg-sky-500",
    },
    {
      key: "quoted",
      label: t("Quoted", "הצעת מחיר"),
      count: funnel.quoted,
      color: "bg-teal-500",
    },
    {
      key: "converted",
      label: t("Converted", "הומר"),
      count: funnel.converted,
      color: "bg-green-500",
    },
  ];

  const maxCount = Math.max(...stages.map(s => s.count), 1);

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          {t("Lead Conversion Funnel", "משפך המרת לידים")}
        </h3>
        <span className="text-xs text-muted-foreground">
          {t("Total:", "סה״כ:")} {totalLeads}
        </span>
      </div>

      <div className="space-y-3">
        {stages.map((stage, i) => {
          const pct =
            totalLeads > 0 ? Math.round((stage.count / totalLeads) * 100) : 0;
          const barWidth = Math.max((stage.count / maxCount) * 100, 4);
          return (
            <div key={stage.key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">
                    {stage.label}
                  </span>
                  {i < stages.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-muted-foreground hidden md:block" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">
                    {stage.count}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    ({pct}%)
                  </span>
                </div>
              </div>
              <div className="h-6 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Lost leads */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-xs text-red-500 font-medium">
          {t("Lost", "אבודים")}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-red-500">{funnel.lost}</span>
          <span className="text-[10px] text-muted-foreground">
            ({totalLeads > 0 ? Math.round((funnel.lost / totalLeads) * 100) : 0}
            %)
          </span>
        </div>
      </div>
    </div>
  );
}

/** Top tours ranked list. */
function TopToursList({
  tours,
  t,
}: {
  tours: { tourName: string; bookingCount: number; revenue: number }[];
  t: (en: string, he: string) => string;
}) {
  const maxBookings = Math.max(...tours.map(t => t.bookingCount), 1);

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        {t("Top Tours", "סיורים מובילים")}
      </h3>
      {tours.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("No booking data yet", "אין נתוני הזמנות עדיין")}
        </p>
      ) : (
        <div className="space-y-3">
          {tours.map((tour, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground truncate max-w-[60%]">
                  {i + 1}. {tour.tourName}
                </span>
                <div className="flex items-center gap-3 text-xs shrink-0">
                  <span className="text-muted-foreground">
                    {tour.bookingCount} {t("bookings", "הזמנות")}
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(tour.revenue)}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{
                    width: `${(tour.bookingCount / maxBookings) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Recent activity timeline. */
function RecentActivityList({
  activity,
  t,
}: {
  activity: {
    id: number;
    name: string;
    type: string;
    status: string;
    createdAt: Date | string;
  }[];
  t: (en: string, he: string) => string;
}) {
  return (
    <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        {t("Recent Activity", "פעילות אחרונה")}
      </h3>
      {activity.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("No recent activity", "אין פעילות אחרונה")}
        </p>
      ) : (
        <div className="space-y-0">
          {activity.map((item, _i) => {
            const isBooking = item.type === "booking";
            return (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0"
              >
                {/* Timeline dot */}
                <div className="mt-1.5 shrink-0">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isBooking ? "bg-primary" : "bg-accent"
                    }`}
                  />
                </div>
                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground truncate">
                      {item.name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        isBooking
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {isBooking ? t("Booking", "הזמנה") : t("Lead", "ליד")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {item.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function AnalyticsSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-pulse">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-xl p-4 md:p-6 border border-border"
          >
            <div className="h-3 w-20 bg-muted rounded mb-3" />
            <div className="h-8 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[0, 1].map(i => (
          <div
            key={i}
            className="bg-card rounded-xl p-4 md:p-6 border border-border h-72"
          >
            <div className="h-4 w-32 bg-muted rounded mb-4" />
            <div className="h-48 bg-muted/50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function AnalyticsTab() {
  const { t } = useLanguage();

  const { data: overview, isLoading: loadingOverview } =
    trpc.analytics.overview.useQuery();
  const { data: revenueData, isLoading: loadingRevenue } =
    trpc.analytics.revenueByMonth.useQuery();
  const { data: bookingsData, isLoading: loadingBookings } =
    trpc.analytics.bookingsByMonth.useQuery();
  const { data: topTours, isLoading: loadingTours } =
    trpc.analytics.topTours.useQuery();
  const { data: recentActivity, isLoading: loadingActivity } =
    trpc.analytics.recentActivity.useQuery();
  const { data: attribution, isLoading: loadingAttribution } =
    trpc.analytics.attribution.useQuery();

  const isLoading =
    loadingOverview ||
    loadingRevenue ||
    loadingBookings ||
    loadingTours ||
    loadingActivity ||
    loadingAttribution;

  const bookingsGrowth = useMemo(() => {
    if (!overview) return null;
    const { bookingsThisMonth, bookingsLastMonth } = overview;
    if (bookingsLastMonth === 0) return bookingsThisMonth > 0 ? 100 : 0;
    return Math.round(
      ((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100
    );
  }, [overview]);

  const conversionRate = useMemo(() => {
    if (!overview || overview.totalLeads === 0) return 0;
    return Math.round((overview.convertedLeads / overview.totalLeads) * 100);
  }, [overview]);

  if (isLoading) return <AnalyticsSkeleton />;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <KPICard
          label={t("Total Revenue", "הכנסות כוללות")}
          value={formatCurrency(overview?.totalRevenue ?? 0)}
          icon={DollarSign}
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        <KPICard
          label={t("Bookings This Month", "הזמנות החודש")}
          value={overview?.bookingsThisMonth ?? 0}
          icon={Calendar}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          change={bookingsGrowth}
        />
        <KPICard
          label={t("Lead Conversion", "המרת לידים")}
          value={`${conversionRate}%`}
          icon={Users}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          suffix={`(${overview?.convertedLeads ?? 0}/${overview?.totalLeads ?? 0})`}
        />
        <KPICard
          label={t("Avg Rating", "דירוג ממוצע")}
          value={overview?.avgRating ?? 0}
          icon={Star}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
          suffix={`/ 5 (${overview?.totalReviews ?? 0})`}
        />
        <KPICard
          label={t("Subscribers", "מנויים")}
          value={overview?.activeSubscribers ?? 0}
          icon={Mail}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {attribution && <AttributionAnalytics report={attribution} t={t} />}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueBarChart data={revenueData ?? []} t={t} />
        <BookingsTrendChart data={bookingsData ?? []} t={t} />
      </div>

      {/* Funnel + Top Tours Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LeadFunnel
          funnel={
            attribution?.funnel ?? {
              new: 0,
              contacted: 0,
              quoted: 0,
              converted: 0,
              lost: 0,
            }
          }
          totalLeads={attribution?.summary.leads ?? 0}
          t={t}
        />
        <TopToursList tours={topTours ?? []} t={t} />
      </div>

      {/* Recent Activity */}
      <RecentActivityList activity={recentActivity ?? []} t={t} />
    </div>
  );
}
