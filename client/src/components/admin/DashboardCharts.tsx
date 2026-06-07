import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  DollarSign,
  AlertCircle,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { FunnelChart } from "./FunnelChart";

interface DashboardChartsProps {
  stats: {
    bookingsByDay: { date: string; count: number }[];
    revenueByDay: { date: string; total: number }[];
    leadConversion: { total: number; converted: number; rate: number };
    postTourReviews: {
      windowStart: string;
      windowEnd: string;
      volume: number;
      completedTours: number;
      reviewed: number;
      completionRate: number;
      lowRatingExceptions: number;
    };
    upcomingTours: Array<{
      id: number;
      contactName: string;
      arrivalDate: Date | string;
      status: string;
      suggestedDestinations: string | null;
    }>;
    pendingBookings: number;
    newLeads: number;
  };
  onFilterBookings?: (status: string) => void;
}

export function DashboardCharts({
  stats,
  onFilterBookings,
}: DashboardChartsProps) {
  const conversionData = [
    { name: "Converted", value: stats.leadConversion.converted },
    {
      name: "Other",
      value: stats.leadConversion.total - stats.leadConversion.converted,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bookings Trend */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-700">
              Bookings (30 days)
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={stats.bookingsByDay}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip
                formatter={(value: number) => [value, "Bookings"]}
                labelFormatter={(label: string) =>
                  new Date(label).toLocaleDateString()
                }
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-medium text-gray-700">
              Revenue (30 days)
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={stats.revenueByDay}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip
                formatter={(value: number) => [
                  `${value.toLocaleString()} USD`,
                  "Revenue",
                ]}
                labelFormatter={(label: string) =>
                  new Date(label).toLocaleDateString()
                }
              />
              <Bar dataKey="total" fill="#16a34a" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Conversion */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <h3 className="text-sm font-medium text-gray-700">
              Lead Conversion
            </h3>
          </div>
          <div className="flex items-center justify-center gap-4">
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie
                  data={conversionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={45}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill="#d4af37" />
                  <Cell fill="#e8e2da" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {stats.leadConversion.rate}%
              </div>
              <div className="text-xs text-gray-500">
                {stats.leadConversion.converted}/{stats.leadConversion.total}{" "}
                leads
              </div>
            </div>
          </div>
        </div>

        {/* Booking Funnel */}
        <FunnelChart />
      </div>

      {/* Today's Priorities */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Today&apos;s Priorities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Upcoming Tours */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase">
              <Calendar className="h-3 w-3" />
              Upcoming Tours (7 days)
            </div>
            {stats.upcomingTours.length === 0 ? (
              <p className="text-sm text-gray-400">No upcoming tours</p>
            ) : (
              stats.upcomingTours.slice(0, 5).map(tour => (
                <div
                  key={tour.id}
                  className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                >
                  <div>
                    <span className="font-medium">{tour.contactName}</span>
                    <span className="text-gray-500 ml-2 text-xs">
                      {new Date(tour.arrivalDate).toLocaleDateString()}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      tour.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {tour.status}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Pending Bookings */}
          <button
            onClick={() => onFilterBookings?.("pending")}
            className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition text-left"
          >
            <AlertCircle className="h-8 w-8 text-yellow-600 shrink-0" />
            <div>
              <div className="text-2xl font-bold text-yellow-800">
                {stats.pendingBookings}
              </div>
              <div className="text-xs text-yellow-600">Pending bookings</div>
            </div>
            <ArrowRight className="h-4 w-4 text-yellow-400 ml-auto" />
          </button>

          {/* New Leads */}
          <button
            onClick={() => onFilterBookings?.("leads")}
            className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition text-left"
          >
            <TrendingUp className="h-8 w-8 text-orange-600 shrink-0" />
            <div>
              <div className="text-2xl font-bold text-orange-800">
                {stats.newLeads}
              </div>
              <div className="text-xs text-orange-600">New leads</div>
            </div>
            <ArrowRight className="h-4 w-4 text-orange-400 ml-auto" />
          </button>

          {/* Post-Tour Review Ops */}
          <button
            onClick={() => onFilterBookings?.("reviews")}
            className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition text-left"
          >
            <MessageSquare className="h-8 w-8 text-blue-600 shrink-0" />
            <div>
              <div className="text-lg font-bold text-blue-800">
                {stats.postTourReviews.completionRate}%
              </div>
              <div className="text-xs text-blue-600">
                Review completion ({stats.postTourReviews.reviewed}/
                {stats.postTourReviews.completedTours})
              </div>
              <div className="text-[11px] text-blue-500 mt-0.5">
                Weekly sent: {stats.postTourReviews.volume} · Low-rating
                exceptions: {stats.postTourReviews.lowRatingExceptions}
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-blue-400 ml-auto" />
          </button>
        </div>
      </div>
    </div>
  );
}
