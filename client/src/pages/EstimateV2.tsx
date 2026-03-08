import { usePageMeta } from "@/hooks/usePageMeta";
import { CostCalculatorRedesigned } from "@/components/calculator-v2/CostCalculatorRedesigned";

export default function EstimateV2() {
  usePageMeta({
    title: "Trip Cost Estimator - WIRO 4x4 Chiang Mai Tours",
    description:
      "Plan your perfect Chiang Mai adventure. Get instant pricing for custom kosher tours with hotels, meals, and activities. Hebrew-speaking guides available.",
    canonicalPath: "/estimate-v2",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header spacer (to account for fixed header) */}
      <div className="h-16" />

      {/* Main content */}
      <CostCalculatorRedesigned />
    </div>
  );
}
