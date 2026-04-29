import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Download,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { PAGE_SIZE } from "./types";
import { TableSkeleton } from "./AdminSkeleton";
import { Pagination } from "./Pagination";
import { exportToCsv, todayStamp, fmtDate } from "@/lib/csvExport";

interface RecordFormData {
  bookingId: number;
  type: "revenue" | "cost" | "refund";
  category: string;
  amount: number;
  currency: string;
  description: string;
  paymentMethod: string;
  notes: string;
}

const emptyForm: RecordFormData = {
  bookingId: 0,
  type: "revenue",
  category: "",
  amount: 0,
  currency: "USD",
  description: "",
  paymentMethod: "",
  notes: "",
};

export function FinancialTab() {
  const [financialsPage, setFinancialsPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<RecordFormData>(emptyForm);

  const utils = trpc.useUtils();

  const { data: financialsData, isLoading: financialsLoading } =
    trpc.financial.listAllPaginated.useQuery({
      page: financialsPage,
      pageSize: PAGE_SIZE,
    });
  const financials = financialsData?.items;
  const financialsTotal = financialsData?.total ?? 0;
  const financialsTotalPages = financialsData?.totalPages ?? 1;

  const { data: finStats } = trpc.financial.stats.useQuery();

  const createMut = trpc.financial.create.useMutation({
    onSuccess: () => {
      utils.financial.listAllPaginated.invalidate();
      utils.financial.stats.invalidate();
      toast.success("Record created successfully!");
      closeForm();
    },
    onError: () => toast.error("Failed to create record"),
  });

  const updateMut = trpc.financial.update.useMutation({
    onSuccess: () => {
      utils.financial.listAllPaginated.invalidate();
      utils.financial.stats.invalidate();
      toast.success("Record updated successfully!");
      closeForm();
    },
    onError: () => toast.error("Failed to update record"),
  });

  const deleteMut = trpc.financial.delete.useMutation({
    onSuccess: () => {
      utils.financial.listAllPaginated.invalidate();
      utils.financial.stats.invalidate();
      toast.success("Record deleted successfully!");
    },
    onError: () => toast.error("Failed to delete record"),
  });

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(record: {
    id: number;
    bookingId: number | null;
    type: string;
    category: string;
    amount: string | number;
    currency: string;
    description: string | null;
    paymentMethod: string | null;
    notes: string | null;
  }) {
    setEditingId(record.id);
    setForm({
      bookingId: record.bookingId ?? 0,
      type: record.type as "revenue" | "cost" | "refund",
      category: record.category,
      amount: Number(record.amount),
      currency: record.currency,
      description: record.description ?? "",
      paymentMethod: record.paymentMethod ?? "",
      notes: record.notes ?? "",
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleSubmit() {
    if (!form.category || form.amount <= 0) {
      toast.error("Please fill in required fields (category and amount)");
      return;
    }
    if (editingId !== null) {
      updateMut.mutate({
        id: editingId,
        data: {
          type: form.type,
          category: form.category,
          amount: form.amount,
          description: form.description || undefined,
          paymentMethod: form.paymentMethod || undefined,
          notes: form.notes || undefined,
        },
      });
    } else {
      createMut.mutate({
        bookingId: form.bookingId || 0,
        type: form.type,
        category: form.category,
        amount: form.amount,
        currency: form.currency,
        description: form.description || undefined,
        paymentMethod: form.paymentMethod || undefined,
        notes: form.notes || undefined,
      });
    }
  }

  function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this record?")) {
      deleteMut.mutate({ id });
    }
  }

  const [isExporting, setIsExporting] = useState(false);
  const allFinancialsQuery = trpc.financial.listAll.useQuery(undefined, {
    enabled: false,
  });

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const { data: allRecords } = await allFinancialsQuery.refetch();
      if (!allRecords?.length) {
        toast.error("No financial records to export");
        return;
      }
      const headers = [
        "ID",
        "Type",
        "Amount",
        "Currency",
        "Category",
        "Description",
        "Booking ID",
        "Payment Method",
        "Notes",
        "Created At",
      ];
      const rows = allRecords.map(r => [
        r.id,
        r.type ?? "",
        r.amount ?? "",
        r.currency ?? "",
        r.category ?? "",
        r.description ?? "",
        r.bookingId ?? "",
        r.paymentMethod ?? "",
        r.notes ?? "",
        fmtDate(r.createdAt),
      ]);
      exportToCsv(`wiro-financial-${todayStamp()}.csv`, headers, rows);
      toast.success("CSV exported successfully!");
    } catch {
      toast.error("Failed to export financial records");
    } finally {
      setIsExporting(false);
    }
  };

  const isSaving = createMut.isPending || updateMut.isPending;

  return (
    <div className="p-6">
      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Record
        </button>
        <button
          onClick={handleExportCSV}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-sm disabled:opacity-50"
        >
          {isExporting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isExporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {/* Create/Edit Dialog */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">
                {editingId !== null ? "Edit Record" : "Add Financial Record"}
              </h3>
              <button
                onClick={closeForm}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={e =>
                      setForm({
                        ...form,
                        type: e.target.value as "revenue" | "cost" | "refund",
                      })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="revenue">Revenue</option>
                    <option value="cost">Cost</option>
                    <option value="refund">Refund</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={form.amount || ""}
                    onChange={e =>
                      setForm({ ...form, amount: Number(e.target.value) })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g., Tour Revenue, Fuel, Accommodation"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Booking ID
                  </label>
                  <input
                    type="number"
                    value={form.bookingId || ""}
                    onChange={e =>
                      setForm({ ...form, bookingId: Number(e.target.value) })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                  <input
                    type="text"
                    value={form.paymentMethod}
                    onChange={e =>
                      setForm({ ...form, paymentMethod: e.target.value })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="e.g., Cash, Bank Transfer"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={2}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Notes
                </label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Internal notes"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={closeForm}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId !== null ? "Save Changes" : "Create Record"}
              </button>
            </div>
          </div>
        </div>
      )}

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
        <TableSkeleton />
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
                <th className="text-right py-3 px-4 font-semibold text-foreground text-xs md:text-sm w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {financials?.map(record => (
                <tr
                  key={record.id}
                  className="border-b border-border/50 hover:bg-muted/50 group"
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
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditForm(record)}
                        className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        disabled={deleteMut.isPending}
                        className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
