import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { LayoutGrid, List, Plus, X, Loader2, ChevronDown } from "lucide-react";
import { CRMPipelineBoard } from "./CRMPipelineBoard";
import { CRMCustomerList } from "./CRMCustomerList";
import { CRMCustomerDetail } from "./CRMCustomerDetail";

type ViewMode = "pipeline" | "list";

type Stage = "prospect" | "active" | "completed" | "vip" | "inactive";

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  whatsapp: "",
  language: "en" as "en" | "he",
  stage: "prospect" as Stage,
  source: "website",
  notes: "",
};

export function CRMTab() {
  const [viewMode, setViewMode] = useState<ViewMode>("pipeline");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const utils = trpc.useUtils();

  const createCustomerMut = trpc.crm.createCustomer.useMutation({
    onSuccess: () => {
      toast.success("Customer created successfully!");
      setForm(INITIAL_FORM);
      setShowAddForm(false);
      utils.crm.listCustomers.invalidate();
      utils.crm.getPipelineStats.invalidate();
    },
    onError: error => {
      console.error("Failed to create customer:", error);
      toast.error("Failed to create customer. Please try again.");
    },
  });

  const handleSelectCustomer = (customerId: number) => {
    setSelectedCustomerId(customerId);
  };

  const handleCloseDetail = () => {
    setSelectedCustomerId(null);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    createCustomerMut.mutate({
      name: form.name.trim(),
      email: form.email || undefined,
      phone: form.phone || undefined,
      whatsapp: form.whatsapp || undefined,
      language: form.language,
      stage: form.stage,
      source: form.source || "website",
      notes: form.notes || undefined,
    });
  };

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 md:p-6 border-b border-border">
        {/* View toggle */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setViewMode("pipeline")}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
              viewMode === "pipeline"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Pipeline</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
              viewMode === "list"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>

        {/* Add Customer button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors ml-auto"
        >
          {showAddForm ? (
            <X className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {showAddForm ? "Cancel" : "Add Customer"}
        </button>
      </div>

      {/* Add Customer Form */}
      {showAddForm && (
        <div className="p-4 md:p-6 border-b border-border bg-muted/30">
          <h3 className="text-sm font-semibold mb-4">New Customer</h3>
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Customer name"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+66..."
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  WhatsApp
                </label>
                <input
                  type="text"
                  value={form.whatsapp}
                  onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="+66..."
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Language */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Language
                </label>
                <div className="relative">
                  <select
                    value={form.language}
                    onChange={e =>
                      setForm({
                        ...form,
                        language: e.target.value as "en" | "he",
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm appearance-none bg-background pr-8 focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="he">Hebrew</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Stage */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Stage
                </label>
                <div className="relative">
                  <select
                    value={form.stage}
                    onChange={e =>
                      setForm({ ...form, stage: e.target.value as Stage })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm appearance-none bg-background pr-8 focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="prospect">Prospect</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="vip">VIP</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Source */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Source
                </label>
                <input
                  type="text"
                  value={form.source}
                  onChange={e => setForm({ ...form, source: e.target.value })}
                  placeholder="website, whatsapp, referral..."
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Notes */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={createCustomerMut.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createCustomerMut.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Create Customer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-col lg:flex-row">
        {/* View area */}
        <div
          className={`flex-1 min-w-0 ${selectedCustomerId ? "lg:border-r lg:border-border" : ""}`}
        >
          {viewMode === "pipeline" ? (
            <CRMPipelineBoard onSelectCustomer={handleSelectCustomer} />
          ) : (
            <CRMCustomerList onSelectCustomer={handleSelectCustomer} />
          )}
        </div>

        {/* Customer Detail side panel */}
        {selectedCustomerId && (
          <>
            {/* Mobile overlay backdrop */}
            <div
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={handleCloseDetail}
            />
            {/* Panel */}
            <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card z-50 overflow-y-auto shadow-xl lg:static lg:w-[420px] lg:max-w-none lg:z-auto lg:shadow-none">
              <CRMCustomerDetail
                customerId={selectedCustomerId}
                onClose={handleCloseDetail}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
