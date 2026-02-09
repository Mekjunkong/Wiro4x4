import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { PAGE_SIZE } from "./types";
import { Pagination } from "./Pagination";
import { downloadCSV } from "@/lib/csvExport";

export function FinancialTab() {
  const [financialsPage, setFinancialsPage] = useState(1);

  const { data: financialsData, isLoading: financialsLoading } =
    trpc.financial.listAllPaginated.useQuery({
      page: financialsPage,
      pageSize: PAGE_SIZE,
    });
  const financials = financialsData?.items;
  const financialsTotal = financialsData?.total ?? 0;
  const financialsTotalPages = financialsData?.totalPages ?? 1;

  const { data: finStats } = trpc.financial.stats.useQuery();

  const handleExportCSV = () => {
    if (!financials?.length) return;
    const data = financials.map(r => ({
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "",
      type: r.type,
      category: r.category,
      amount: r.amount,
      currency: r.currency,
      description: r.description ?? "",
    }));
    downloadCSV(data, "financial-records.csv");
    toast.success("CSV exported successfully!");
  };

  return (
    <div className="p-6">
      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Financial Summary Cards */}
      {finStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-xs md:text-sm text-green-600 font-medium">
              Total Revenue
            </p>
            <p className="text-xl md:text-2xl font-bold text-green-700 mt-1">
              &#3647;{finStats.totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-xs md:text-sm text-red-600 font-medium">
              Total Costs
            </p>
            <p className="text-xl md:text-2xl font-bold text-red-700 mt-1">
              &#3647;{finStats.totalCosts.toLocaleString()}
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-xs md:text-sm text-yellow-600 font-medium">
              Refunds
            </p>
            <p className="text-xl md:text-2xl font-bold text-yellow-700 mt-1">
              &#3647;{finStats.totalRefunds.toLocaleString()}
            </p>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <p className="text-xs md:text-sm text-primary font-medium">
              Net Profit
            </p>
            <p className="text-xl md:text-2xl font-bold text-primary mt-1">
              &#3647;{finStats.netProfit.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Profit Chart */}
      {finStats &&
        (finStats.totalRevenue > 0 || finStats.totalCosts > 0) &&
        (() => {
          const maxVal = Math.max(
            finStats.totalRevenue,
            finStats.totalCosts,
            finStats.netProfit,
            1
          );
          const profitMargin =
            finStats.totalRevenue > 0
              ? Math.round((finStats.netProfit / finStats.totalRevenue) * 100)
              : 0;
          return (
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <h4 className="text-sm md:text-base font-semibold text-foreground">
                  Revenue vs Costs vs Profit
                </h4>
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${profitMargin >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  Profit Margin: {profitMargin}%
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-semibold text-green-700">
                      &#3647;{finStats.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-6 md:h-8">
                    <div
                      className="bg-green-500 h-6 md:h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{
                        width: `${Math.max((finStats.totalRevenue / maxVal) * 100, 2)}%`,
                      }}
                    >
                      <span className="text-xs text-white font-medium hidden sm:inline">
                        {Math.round((finStats.totalRevenue / maxVal) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Costs</span>
                    <span className="font-semibold text-red-700">
                      &#3647;{finStats.totalCosts.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-6 md:h-8">
                    <div
                      className="bg-red-500 h-6 md:h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{
                        width: `${Math.max((finStats.totalCosts / maxVal) * 100, 2)}%`,
                      }}
                    >
                      <span className="text-xs text-white font-medium hidden sm:inline">
                        {Math.round((finStats.totalCosts / maxVal) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Refunds</span>
                    <span className="font-semibold text-yellow-700">
                      &#3647;{finStats.totalRefunds.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-6 md:h-8">
                    <div
                      className="bg-yellow-500 h-6 md:h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{
                        width: `${Math.max((finStats.totalRefunds / maxVal) * 100, 2)}%`,
                      }}
                    >
                      <span className="text-xs text-white font-medium hidden sm:inline">
                        {Math.round((finStats.totalRefunds / maxVal) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Net Profit</span>
                    <span
                      className={`font-semibold ${finStats.netProfit >= 0 ? "text-primary" : "text-red-700"}`}
                    >
                      &#3647;{finStats.netProfit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-6 md:h-8">
                    <div
                      className={`h-6 md:h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-2 ${finStats.netProfit >= 0 ? "bg-primary" : "bg-red-400"}`}
                      style={{
                        width: `${Math.max((Math.abs(finStats.netProfit) / maxVal) * 100, 2)}%`,
                      }}
                    >
                      <span className="text-xs text-white font-medium hidden sm:inline">
                        {Math.round(
                          (Math.abs(finStats.netProfit) / maxVal) * 100
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {financialsLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : financials?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No financial records yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm">
                  Date
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm">
                  Type
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm hidden sm:table-cell">
                  Category
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm">
                  Amount
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm hidden md:table-cell">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {financials?.map(record => (
                <tr
                  key={record.id}
                  className="border-b border-border/50 hover:bg-muted/50"
                >
                  <td className="py-3 px-4 text-xs md:text-sm">
                    {record.createdAt
                      ? new Date(record.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        record.type === "revenue"
                          ? "bg-green-100 text-green-800"
                          : record.type === "cost"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {record.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm hidden sm:table-cell">
                    {record.category}
                  </td>
                  <td className="py-3 px-4 font-semibold text-xs md:text-sm">
                    {record.currency} {Number(record.amount).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">
                    {record.description || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={financialsPage}
        totalPages={financialsTotalPages}
        total={financialsTotal}
        onPageChange={setFinancialsPage}
      />
    </div>
  );
}
