import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Plus,
  X,
  Loader2,
  FileText,
  BookOpen,
  CalendarClock,
  Package,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { PAGE_SIZE } from "./types";
import { TableSkeleton } from "./AdminSkeleton";
import { Pagination } from "./Pagination";
import { CHART_OF_ACCOUNTS } from "../../../../shared/accounting";

type SubTab = "invoices" | "journal" | "tax" | "inventory";

// ── Invoices Sub-tab ─────────────────────────────────────────

function InvoicesSubTab() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.accounting.listInvoices.useQuery({
    page,
    pageSize: PAGE_SIZE,
  });
  const items = data?.items;
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const emptyForm = {
    type: "tax_invoice" as "tax_invoice" | "receipt" | "wht_certificate",
    customerName: "",
    customerAddress: "",
    customerTaxId: "",
    currency: "THB" as "THB" | "ILS" | "USD",
    subtotal: 0,
    vatAmount: 0,
    whtRate: 0,
    whtAmount: 0,
    totalAmount: 0,
    bookingId: undefined as number | undefined,
    fxRate: "",
    thbEquivalent: undefined as number | undefined,
    paymentMethod: "",
    notes: "",
  };

  const [form, setForm] = useState(emptyForm);

  const statusForm = {
    status: "paid" as "unpaid" | "paid" | "partial" | "cancelled",
    paymentDate: "",
    paymentMethod: "",
  };
  const [sForm, setSForm] = useState(statusForm);

  const createMut = trpc.accounting.createInvoice.useMutation({
    onSuccess: result => {
      utils.accounting.listInvoices.invalidate();
      toast.success(`Invoice ${result.invoiceNumber} created!`);
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: () => toast.error("Failed to create invoice"),
  });

  const updateStatusMut = trpc.accounting.updateInvoiceStatus.useMutation({
    onSuccess: () => {
      utils.accounting.listInvoices.invalidate();
      toast.success("Invoice status updated!");
      setShowStatusForm(null);
    },
    onError: () => toast.error("Failed to update status"),
  });

  function handleCreate() {
    if (!form.customerName || form.totalAmount <= 0) {
      toast.error("Customer name and total amount are required");
      return;
    }
    createMut.mutate({
      type: form.type,
      customerName: form.customerName,
      customerAddress: form.customerAddress || undefined,
      customerTaxId: form.customerTaxId || undefined,
      currency: form.currency,
      subtotal: form.subtotal,
      vatAmount: form.vatAmount,
      whtRate: form.whtRate,
      whtAmount: form.whtAmount,
      totalAmount: form.totalAmount,
      bookingId: form.bookingId || undefined,
      fxRate: form.fxRate || undefined,
      thbEquivalent: form.thbEquivalent || undefined,
      paymentMethod: form.paymentMethod || undefined,
      notes: form.notes || undefined,
    });
  }

  function handleUpdateStatus(id: number) {
    updateStatusMut.mutate({
      id,
      status: sForm.status,
      paymentDate: sForm.paymentDate || undefined,
      paymentMethod: sForm.paymentMethod || undefined,
    });
  }

  const statusColors: Record<string, string> = {
    unpaid: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    partial: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const typeLabels: Record<string, string> = {
    tax_invoice: "Tax Invoice",
    receipt: "Receipt",
    wht_certificate: "WHT Certificate",
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            setForm(emptyForm);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      {/* Create Invoice Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Create Invoice</h3>
              <button
                onClick={() => setShowForm(false)}
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
                        type: e.target.value as typeof form.type,
                      })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="tax_invoice">Tax Invoice</option>
                    <option value="receipt">Receipt</option>
                    <option value="wht_certificate">WHT Certificate</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Currency
                  </label>
                  <select
                    value={form.currency}
                    onChange={e =>
                      setForm({
                        ...form,
                        currency: e.target.value as typeof form.currency,
                      })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="THB">THB</option>
                    <option value="ILS">ILS</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={e =>
                    setForm({ ...form, customerName: e.target.value })
                  }
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Customer Address
                </label>
                <input
                  type="text"
                  value={form.customerAddress}
                  onChange={e =>
                    setForm({ ...form, customerAddress: e.target.value })
                  }
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Optional"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Customer Tax ID
                  </label>
                  <input
                    type="text"
                    value={form.customerTaxId}
                    onChange={e =>
                      setForm({ ...form, customerTaxId: e.target.value })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Booking ID
                  </label>
                  <input
                    type="number"
                    value={form.bookingId ?? ""}
                    onChange={e =>
                      setForm({
                        ...form,
                        bookingId: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Subtotal *
                  </label>
                  <input
                    type="number"
                    value={form.subtotal || ""}
                    onChange={e =>
                      setForm({ ...form, subtotal: Number(e.target.value) })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    VAT Amount
                  </label>
                  <input
                    type="number"
                    value={form.vatAmount || ""}
                    onChange={e =>
                      setForm({ ...form, vatAmount: Number(e.target.value) })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    min="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    WHT Amount
                  </label>
                  <input
                    type="number"
                    value={form.whtAmount || ""}
                    onChange={e =>
                      setForm({ ...form, whtAmount: Number(e.target.value) })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Total Amount *
                  </label>
                  <input
                    type="number"
                    value={form.totalAmount || ""}
                    onChange={e =>
                      setForm({ ...form, totalAmount: Number(e.target.value) })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Optional notes"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={createMut.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {createMut.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusForm !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Update Invoice Status</h3>
              <button
                onClick={() => setShowStatusForm(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={sForm.status}
                  onChange={e =>
                    setSForm({
                      ...sForm,
                      status: e.target.value as typeof sForm.status,
                    })
                  }
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={sForm.paymentDate}
                  onChange={e =>
                    setSForm({ ...sForm, paymentDate: e.target.value })
                  }
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <input
                  type="text"
                  value={sForm.paymentMethod}
                  onChange={e =>
                    setSForm({ ...sForm, paymentMethod: e.target.value })
                  }
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g., Bank Transfer, Cash"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => setShowStatusForm(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(showStatusForm)}
                disabled={updateStatusMut.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {updateStatusMut.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : items?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No invoices yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm">
                  Number
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm">
                  Customer
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm hidden sm:table-cell">
                  Type
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm">
                  Amount
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm hidden md:table-cell">
                  Date
                </th>
                <th className="text-right py-3 px-4 font-semibold text-foreground text-xs md:text-sm w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items?.map(inv => (
                <tr
                  key={inv.id}
                  className="border-b border-border/50 hover:bg-muted/50 group"
                >
                  <td className="py-3 px-4 text-xs md:text-sm font-mono">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 text-xs md:text-sm">
                    {inv.customerName}
                  </td>
                  <td className="py-3 px-4 text-xs md:text-sm hidden sm:table-cell">
                    {typeLabels[inv.type] ?? inv.type}
                  </td>
                  <td className="py-3 px-4 font-semibold text-xs md:text-sm">
                    {inv.currency} {Number(inv.totalAmount).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${statusColors[inv.status] ?? "bg-gray-100 text-gray-800"}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs md:text-sm hidden md:table-cell">
                    {inv.issuedAt
                      ? new Date(inv.issuedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setSForm({
                            status: inv.status as typeof sForm.status,
                            paymentDate: "",
                            paymentMethod: "",
                          });
                          setShowStatusForm(inv.id);
                        }}
                        className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        title="Update Status"
                      >
                        <Pencil className="w-3.5 h-3.5" />
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
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}

// ── Journal Sub-tab ──────────────────────────────────────────

function JournalSubTab() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.accounting.listEntries.useQuery({
    page,
    pageSize: PAGE_SIZE,
  });
  const items = data?.items;
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const emptyForm = {
    date: new Date().toISOString().split("T")[0],
    accountCode: "41000",
    description: "",
    debit: 0,
    credit: 0,
    currency: "THB" as "THB" | "ILS" | "USD",
    bookingId: undefined as number | undefined,
    invoiceId: undefined as number | undefined,
    fxRate: "",
    vendorPayee: "",
    documentRef: "",
  };

  const [form, setForm] = useState(emptyForm);

  const createMut = trpc.accounting.recordEntry.useMutation({
    onSuccess: () => {
      utils.accounting.listEntries.invalidate();
      toast.success("Journal entry recorded!");
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: () => toast.error("Failed to record entry"),
  });

  function handleCreate() {
    if (!form.description || (form.debit === 0 && form.credit === 0)) {
      toast.error("Description and at least one amount are required");
      return;
    }
    createMut.mutate({
      date: form.date,
      accountCode: form.accountCode,
      description: form.description,
      debit: form.debit,
      credit: form.credit,
      currency: form.currency,
      bookingId: form.bookingId || undefined,
      invoiceId: form.invoiceId || undefined,
      fxRate: form.fxRate || undefined,
      vendorPayee: form.vendorPayee || undefined,
      documentRef: form.documentRef || undefined,
    });
  }

  const accountCodes = Object.entries(CHART_OF_ACCOUNTS);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            setForm(emptyForm);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Record Entry
        </button>
      </div>

      {/* Create Entry Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Record Journal Entry</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Currency
                  </label>
                  <select
                    value={form.currency}
                    onChange={e =>
                      setForm({
                        ...form,
                        currency: e.target.value as typeof form.currency,
                      })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="THB">THB</option>
                    <option value="ILS">ILS</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Account *
                </label>
                <select
                  value={form.accountCode}
                  onChange={e =>
                    setForm({ ...form, accountCode: e.target.value })
                  }
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                >
                  {accountCodes.map(([code, info]) => (
                    <option key={code} value={code}>
                      {code} - {info.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Description *
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Entry description"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Debit
                  </label>
                  <input
                    type="number"
                    value={form.debit || ""}
                    onChange={e =>
                      setForm({ ...form, debit: Number(e.target.value) })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Credit
                  </label>
                  <input
                    type="number"
                    value={form.credit || ""}
                    onChange={e =>
                      setForm({ ...form, credit: Number(e.target.value) })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    min="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Vendor/Payee
                  </label>
                  <input
                    type="text"
                    value={form.vendorPayee}
                    onChange={e =>
                      setForm({ ...form, vendorPayee: e.target.value })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Document Ref
                  </label>
                  <input
                    type="text"
                    value={form.documentRef}
                    onChange={e =>
                      setForm({ ...form, documentRef: e.target.value })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={createMut.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {createMut.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Record Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Journal Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : items?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No journal entries yet.
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
                  Account
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm hidden sm:table-cell">
                  Description
                </th>
                <th className="text-right py-3 px-4 font-semibold text-foreground text-xs md:text-sm">
                  Debit
                </th>
                <th className="text-right py-3 px-4 font-semibold text-foreground text-xs md:text-sm">
                  Credit
                </th>
              </tr>
            </thead>
            <tbody>
              {items?.map(entry => {
                const acctInfo =
                  CHART_OF_ACCOUNTS[
                    entry.accountCode as keyof typeof CHART_OF_ACCOUNTS
                  ];
                return (
                  <tr
                    key={entry.id}
                    className="border-b border-border/50 hover:bg-muted/50"
                  >
                    <td className="py-3 px-4 text-xs md:text-sm">
                      {entry.date
                        ? new Date(entry.date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="py-3 px-4 text-xs md:text-sm">
                      <span className="font-mono text-xs">
                        {entry.accountCode}
                      </span>
                      {acctInfo && (
                        <span className="text-muted-foreground ml-1">
                          {acctInfo.nameEn}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell">
                      {entry.description}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-xs md:text-sm">
                      {Number(entry.debit) > 0
                        ? `${entry.currency} ${Number(entry.debit).toLocaleString()}`
                        : "-"}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-xs md:text-sm">
                      {Number(entry.credit) > 0
                        ? `${entry.currency} ${Number(entry.credit).toLocaleString()}`
                        : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}

// ── Tax Calendar Sub-tab ─────────────────────────────────────

function TaxCalendarSubTab() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.accounting.listFilings.useQuery({
    page,
    pageSize: PAGE_SIZE,
  });
  const items = data?.items;
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const { data: deadlines } = trpc.accounting.upcomingDeadlines.useQuery();

  const emptyForm = {
    type: "vat_pp30" as
      | "vat_pp30"
      | "wht_pnd3"
      | "wht_pnd53"
      | "cit_pnd50"
      | "cit_pnd51",
    period: "",
    dueDate: "",
    outputVat: undefined as number | undefined,
    inputVat: undefined as number | undefined,
    netVat: undefined as number | undefined,
    whtTotal: undefined as number | undefined,
    taxableIncome: undefined as number | undefined,
    taxAmount: undefined as number | undefined,
    notes: "",
  };

  const [form, setForm] = useState(emptyForm);

  const statusForm = {
    status: "prepared" as "pending" | "prepared" | "filed" | "late",
  };
  const [sForm, setSForm] = useState(statusForm);

  const createMut = trpc.accounting.createFiling.useMutation({
    onSuccess: () => {
      utils.accounting.listFilings.invalidate();
      utils.accounting.upcomingDeadlines.invalidate();
      toast.success("Tax filing created!");
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: () => toast.error("Failed to create filing"),
  });

  const markFiledMut = trpc.accounting.markFiled.useMutation({
    onSuccess: () => {
      utils.accounting.listFilings.invalidate();
      utils.accounting.upcomingDeadlines.invalidate();
      toast.success("Filing status updated!");
      setShowStatusForm(null);
    },
    onError: () => toast.error("Failed to update filing status"),
  });

  function handleCreate() {
    if (!form.period || !form.dueDate) {
      toast.error("Period and due date are required");
      return;
    }
    createMut.mutate({
      type: form.type,
      period: form.period,
      dueDate: form.dueDate,
      outputVat: form.outputVat,
      inputVat: form.inputVat,
      netVat: form.netVat,
      whtTotal: form.whtTotal,
      taxableIncome: form.taxableIncome,
      taxAmount: form.taxAmount,
      notes: form.notes || undefined,
    });
  }

  function handleMarkFiled(id: number) {
    markFiledMut.mutate({ id, status: sForm.status });
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    prepared: "bg-blue-100 text-blue-800",
    filed: "bg-green-100 text-green-800",
    late: "bg-red-100 text-red-800",
  };

  const typeLabels: Record<string, string> = {
    vat_pp30: "VAT PP.30",
    wht_pnd3: "WHT PND.3",
    wht_pnd53: "WHT PND.53",
    cit_pnd50: "CIT PND.50",
    cit_pnd51: "CIT PND.51",
  };

  return (
    <div>
      {/* Upcoming Deadlines Banner */}
      {deadlines && deadlines.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <h4 className="text-sm font-semibold text-orange-800">
              Upcoming Deadlines
            </h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {deadlines.map(d => (
              <div
                key={d.id}
                className="bg-white rounded-lg px-3 py-2 text-sm border border-orange-100"
              >
                <span className="font-medium">
                  {typeLabels[d.type] ?? d.type}
                </span>
                <span className="text-muted-foreground ml-2">
                  Due:{" "}
                  {d.dueDate ? new Date(d.dueDate).toLocaleDateString() : "-"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            setForm(emptyForm);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Filing
        </button>
      </div>

      {/* Create Filing Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Create Tax Filing</h3>
              <button
                onClick={() => setShowForm(false)}
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
                        type: e.target.value as typeof form.type,
                      })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="vat_pp30">VAT PP.30</option>
                    <option value="wht_pnd3">WHT PND.3</option>
                    <option value="wht_pnd53">WHT PND.53</option>
                    <option value="cit_pnd50">CIT PND.50</option>
                    <option value="cit_pnd51">CIT PND.51</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Period *
                  </label>
                  <input
                    type="text"
                    value={form.period}
                    onChange={e => setForm({ ...form, period: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="e.g., 2026-01"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Tax Amount
                  </label>
                  <input
                    type="number"
                    value={form.taxAmount ?? ""}
                    onChange={e =>
                      setForm({
                        ...form,
                        taxAmount: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Taxable Income
                  </label>
                  <input
                    type="number"
                    value={form.taxableIncome ?? ""}
                    onChange={e =>
                      setForm({
                        ...form,
                        taxableIncome: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Optional notes"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={createMut.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {createMut.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Create Filing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusForm !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Update Filing Status</h3>
              <button
                onClick={() => setShowStatusForm(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={sForm.status}
                  onChange={e =>
                    setSForm({
                      ...sForm,
                      status: e.target.value as typeof sForm.status,
                    })
                  }
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="prepared">Prepared</option>
                  <option value="filed">Filed</option>
                  <option value="late">Late</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => setShowStatusForm(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMarkFiled(showStatusForm)}
                disabled={markFiledMut.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {markFiledMut.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filings Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : items?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No tax filings yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm">
                  Type
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm">
                  Period
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm hidden sm:table-cell">
                  Due Date
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm">
                  Amount
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm">
                  Status
                </th>
                <th className="text-right py-3 px-4 font-semibold text-foreground text-xs md:text-sm w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items?.map(filing => (
                <tr
                  key={filing.id}
                  className="border-b border-border/50 hover:bg-muted/50 group"
                >
                  <td className="py-3 px-4 text-xs md:text-sm font-medium">
                    {typeLabels[filing.type] ?? filing.type}
                  </td>
                  <td className="py-3 px-4 text-xs md:text-sm">
                    {filing.period}
                  </td>
                  <td className="py-3 px-4 text-xs md:text-sm hidden sm:table-cell">
                    {filing.dueDate
                      ? new Date(filing.dueDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="py-3 px-4 font-semibold text-xs md:text-sm">
                    {filing.taxAmount != null
                      ? `THB ${Number(filing.taxAmount).toLocaleString()}`
                      : "-"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${statusColors[filing.status] ?? "bg-gray-100 text-gray-800"}`}
                    >
                      {filing.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setSForm({
                            status: filing.status as typeof sForm.status,
                          });
                          setShowStatusForm(filing.id);
                        }}
                        className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        title="Update Status"
                      >
                        <Pencil className="w-3.5 h-3.5" />
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
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}

// ── Inventory Sub-tab ────────────────────────────────────────

function InventorySubTab() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.inventory.list.useQuery({
    page,
    pageSize: PAGE_SIZE,
  });
  const items = data?.items;
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const { data: summary } = trpc.inventory.summary.useQuery();

  const emptyForm = {
    name: "",
    category: "equipment" as "vehicle" | "equipment" | "supplies",
    description: "",
    purchaseDate: "",
    purchaseCost: undefined as number | undefined,
    currentValue: undefined as number | undefined,
    usefulLifeMonths: undefined as number | undefined,
    condition: "good" as "new" | "good" | "fair" | "poor" | "retired",
    quantity: 1,
    location: "",
    notes: "",
  };

  const [form, setForm] = useState(emptyForm);

  const createMut = trpc.inventory.create.useMutation({
    onSuccess: () => {
      utils.inventory.list.invalidate();
      utils.inventory.summary.invalidate();
      toast.success("Inventory item created!");
      closeForm();
    },
    onError: () => toast.error("Failed to create item"),
  });

  const updateMut = trpc.inventory.update.useMutation({
    onSuccess: () => {
      utils.inventory.list.invalidate();
      utils.inventory.summary.invalidate();
      toast.success("Inventory item updated!");
      closeForm();
    },
    onError: () => toast.error("Failed to update item"),
  });

  const deleteMut = trpc.inventory.delete.useMutation({
    onSuccess: () => {
      utils.inventory.list.invalidate();
      utils.inventory.summary.invalidate();
      toast.success("Inventory item deleted!");
    },
    onError: () => toast.error("Failed to delete item"),
  });

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(item: {
    id: number;
    name: string;
    category: string;
    description: string | null;
    purchaseDate: string | Date | null;
    purchaseCost: number | null;
    currentValue: number | null;
    usefulLifeMonths: number | null;
    condition: string;
    quantity: number | null;
    location: string | null;
    notes: string | null;
  }) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category as typeof emptyForm.category,
      description: item.description ?? "",
      purchaseDate: item.purchaseDate
        ? new Date(item.purchaseDate).toISOString().split("T")[0]
        : "",
      purchaseCost: item.purchaseCost ?? undefined,
      currentValue: item.currentValue ?? undefined,
      usefulLifeMonths: item.usefulLifeMonths ?? undefined,
      condition: item.condition as typeof emptyForm.condition,
      quantity: item.quantity ?? 1,
      location: item.location ?? "",
      notes: item.notes ?? "",
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleSubmit() {
    if (!form.name) {
      toast.error("Name is required");
      return;
    }
    const payload = {
      name: form.name,
      category: form.category,
      description: form.description || undefined,
      purchaseDate: form.purchaseDate || undefined,
      purchaseCost: form.purchaseCost,
      currentValue: form.currentValue,
      usefulLifeMonths: form.usefulLifeMonths,
      condition: form.condition,
      quantity: form.quantity,
      location: form.location || undefined,
      notes: form.notes || undefined,
    };

    if (editingId !== null) {
      updateMut.mutate({ id: editingId, data: payload });
    } else {
      createMut.mutate(payload);
    }
  }

  function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this inventory item?")) {
      deleteMut.mutate({ id });
    }
  }

  const conditionColors: Record<string, string> = {
    new: "bg-emerald-100 text-emerald-800",
    good: "bg-blue-100 text-blue-800",
    fair: "bg-yellow-100 text-yellow-800",
    poor: "bg-red-100 text-red-800",
    retired: "bg-gray-100 text-gray-800",
  };

  const isSaving = createMut.isPending || updateMut.isPending;

  return (
    <div>
      {/* Summary Cards */}
      {summary && summary.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {summary.map(s => (
            <div
              key={s.category}
              className="bg-card border border-border rounded-xl p-4"
            >
              <p className="text-xs text-muted-foreground font-medium capitalize">
                {s.category}
              </p>
              <p className="text-xl font-bold text-foreground mt-1">
                {s.count} items
              </p>
              {s.totalCurrentValue != null && (
                <p className="text-xs text-muted-foreground">
                  Value: &#3647;{Number(s.totalCurrentValue).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">
                {editingId !== null ? "Edit Item" : "Add Inventory Item"}
              </h3>
              <button
                onClick={closeForm}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Item name"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={e =>
                      setForm({
                        ...form,
                        category: e.target.value as typeof form.category,
                      })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="vehicle">Vehicle</option>
                    <option value="equipment">Equipment</option>
                    <option value="supplies">Supplies</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Condition
                  </label>
                  <select
                    value={form.condition}
                    onChange={e =>
                      setForm({
                        ...form,
                        condition: e.target.value as typeof form.condition,
                      })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="new">New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="retired">Retired</option>
                  </select>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Purchase Cost
                  </label>
                  <input
                    type="number"
                    value={form.purchaseCost ?? ""}
                    onChange={e =>
                      setForm({
                        ...form,
                        purchaseCost: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Current Value
                  </label>
                  <input
                    type="number"
                    value={form.currentValue ?? ""}
                    onChange={e =>
                      setForm({
                        ...form,
                        currentValue: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    min="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={form.purchaseDate}
                    onChange={e =>
                      setForm({ ...form, purchaseDate: e.target.value })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Useful Life (mo)
                  </label>
                  <input
                    type="number"
                    value={form.usefulLifeMonths ?? ""}
                    onChange={e =>
                      setForm({
                        ...form,
                        usefulLifeMonths: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={e =>
                      setForm({ ...form, quantity: Number(e.target.value) })
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g., Chiang Mai Office"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Optional notes"
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
                {editingId !== null ? "Save Changes" : "Create Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : items?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No inventory items yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm hidden sm:table-cell">
                  Category
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm">
                  Value
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm">
                  Condition
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm hidden md:table-cell">
                  Location
                </th>
                <th className="text-right py-3 px-4 font-semibold text-foreground text-xs md:text-sm w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items?.map(item => (
                <tr
                  key={item.id}
                  className="border-b border-border/50 hover:bg-muted/50 group"
                >
                  <td className="py-3 px-4 text-xs md:text-sm font-medium">
                    {item.name}
                  </td>
                  <td className="py-3 px-4 text-xs md:text-sm capitalize hidden sm:table-cell">
                    {item.category}
                  </td>
                  <td className="py-3 px-4 font-semibold text-xs md:text-sm">
                    {item.currentValue != null
                      ? `THB ${Number(item.currentValue).toLocaleString()}`
                      : "-"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${conditionColors[item.condition] ?? "bg-gray-100 text-gray-800"}`}
                    >
                      {item.condition}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">
                    {item.location || "-"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditForm(item)}
                        className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
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
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}

// ── Main AccountingTab Component ─────────────────────────────

const SUB_TAB_ICONS: Record<SubTab, typeof FileText> = {
  invoices: FileText,
  journal: BookOpen,
  tax: CalendarClock,
  inventory: Package,
};

const SUB_TAB_LABELS: Record<SubTab, string> = {
  invoices: "Invoices",
  journal: "Journal",
  tax: "Tax Calendar",
  inventory: "Inventory",
};

export function AccountingTab() {
  const [subTab, setSubTab] = useState<SubTab>("invoices");

  return (
    <div className="p-6">
      {/* Sub-tab navigation */}
      <div className="flex gap-2 mb-4">
        {(["invoices", "journal", "tax", "inventory"] as const).map(tab => {
          const Icon = SUB_TAB_ICONS[tab];
          return (
            <button
              key={tab}
              onClick={() => setSubTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                subTab === tab
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Icon className="w-4 h-4" />
              {SUB_TAB_LABELS[tab]}
            </button>
          );
        })}
      </div>

      {/* Sub-tab content */}
      {subTab === "invoices" && <InvoicesSubTab />}
      {subTab === "journal" && <JournalSubTab />}
      {subTab === "tax" && <TaxCalendarSubTab />}
      {subTab === "inventory" && <InventorySubTab />}
    </div>
  );
}
