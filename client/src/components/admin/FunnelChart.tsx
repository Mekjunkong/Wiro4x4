import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function FunnelChart() {
  const { language, t } = useLanguage();
  const { data } = trpc.analytics.funnelData.useQuery();

  if (!data || data.steps.length === 0) return null;

  const chartData = data.steps.map(s => ({
    name: language === "he" ? s.nameHe : s.name,
    count: s.count,
  }));

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">
          {t(
            "Booking Funnel (30 days)",
            "\u05DE\u05E9\u05E4\u05DA \u05D4\u05D6\u05DE\u05E0\u05D5\u05EA (30 \u05D9\u05D5\u05DD)"
          )}
        </h3>
        <span className="text-sm font-bold text-[#D4AF37]">
          {data.conversionRate}% {t("conversion", "\u05D4\u05DE\u05E8\u05D4")}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#D4AF37" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
