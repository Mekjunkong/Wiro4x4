import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Search, User, ChevronDown } from "lucide-react";
import { PAGE_SIZE } from "./types";
import { TableSkeleton } from "./AdminSkeleton";
import { Pagination } from "./Pagination";

interface CRMCustomerListProps {
  onSelectCustomer: (customerId: number) => void;
}

type Stage = "prospect" | "active" | "completed" | "vip" | "inactive";

const STAGE_COLORS: Record<Stage, string> = {
  prospect: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-purple-100 text-purple-800",
  vip: "bg-yellow-100 text-yellow-800",
  inactive: "bg-gray-100 text-gray-800",
};

const STAGE_LABELS: Record<Stage, string> = {
  prospect: "Prospect",
  active: "Active",
  completed: "Completed",
  vip: "VIP",
  inactive: "Inactive",
};

function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return "never";
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  const diffYear = Math.floor(diffMonth / 12);
  return `${diffYear}y ago`;
}

function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "\u0E3F0";
  return `\u0E3F${amount.toLocaleString()}`;
}

export function CRMCustomerList({ onSelectCustomer }: CRMCustomerListProps) {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<Stage | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const { data: customersData, isLoading } = trpc.crm.listCustomers.useQuery({
    page,
    pageSize: PAGE_SIZE,
  });

  const customers = customersData?.items ?? [];
  const total = customersData?.total ?? 0;
  const totalPages = customersData?.totalPages ?? 1;

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = c.name?.toLowerCase().includes(term);
        const matchesEmail = c.email?.toLowerCase().includes(term);
        const matchesPhone = c.phone?.includes(term);
        if (!matchesName && !matchesEmail && !matchesPhone) return false;
      }
      // Stage filter
      if (stageFilter !== "all" && c.stage !== stageFilter) return false;
      // Source filter
      if (sourceFilter !== "all" && c.source !== sourceFilter) return false;
      return true;
    });
  }, [customers, searchTerm, stageFilter, sourceFilter]);

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
        <div className="relative">
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value as Stage | "all")}
            className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none pr-8 bg-background"
          >
            <option value="all">All Stages</option>
            <option value="prospect">Prospect</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="vip">VIP</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none pr-8 bg-background"
          >
            <option value="all">All Sources</option>
            <option value="website">Website</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="referral">Referral</option>
            <option value="booking">Booking</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchTerm || stageFilter !== "all" || sourceFilter !== "all"
            ? "No customers match your filters."
            : "No customers found."}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">
                    Contact
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">
                    Stage
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">
                    Bookings
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">
                    Total Spent
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr
                    key={customer.id}
                    className="border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onSelectCustomer(customer.id)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">
                          {customer.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm">
                        {customer.email || customer.phone || "-"}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${STAGE_COLORS[customer.stage as Stage] ?? "bg-gray-100 text-gray-800"}`}
                      >
                        {STAGE_LABELS[customer.stage as Stage] ??
                          customer.stage}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {customer.totalBookings ?? 0}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {timeAgo(customer.lastContactAt ?? customer.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filteredCustomers.map(customer => (
              <div
                key={customer.id}
                onClick={() => onSelectCustomer(customer.id)}
                className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {customer.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {customer.email || customer.phone || "No contact"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${STAGE_COLORS[customer.stage as Stage] ?? "bg-gray-100 text-gray-800"}`}
                  >
                    {STAGE_LABELS[customer.stage as Stage] ?? customer.stage}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                  <span>{customer.totalBookings ?? 0} bookings</span>
                  <span>{formatCurrency(customer.totalSpent)}</span>
                  <span className="ml-auto">
                    {timeAgo(customer.lastContactAt ?? customer.updatedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
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
