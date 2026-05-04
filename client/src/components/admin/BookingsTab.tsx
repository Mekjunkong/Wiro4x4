import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Search,
  RefreshCw,
  Trash2,
  Phone,
  Mail,
  User,
  ChevronDown,
  ChevronUp,
  Download,
  Bell,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import {
  type BookingStatus,
  STATUS_COLORS,
  STATUS_LABELS,
  PAGE_SIZE,
} from "./types";
import { InlineStatusDropdown } from "./InlineStatusDropdown";
import { BulkEmailDialog } from "./BulkEmailDialog";
import { Pagination } from "./Pagination";
import { PaymentSection } from "./PaymentSection";
import { exportToCsv, todayStamp, fmtDate } from "@/lib/csvExport";
import { TableSkeleton } from "./AdminSkeleton";

function getWhatsAppUrl(booking: {
  contactWhatsApp?: string | null;
  contactPhone?: string | null;
}) {
  const phone = booking.contactWhatsApp || booking.contactPhone;
  if (!phone) return null;
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}`;
}

export function BookingsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "all"
  );
  const [expandedBooking, setExpandedBooking] = useState<number | null>(null);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const [bulkStatusMenuOpen, setBulkStatusMenuOpen] = useState(false);
  const [bulkAgentMenuOpen, setBulkAgentMenuOpen] = useState(false);
  const [bulkEmailOpen, setBulkEmailOpen] = useState(false);

  const utils = trpc.useUtils();

  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    refetch: refetchBookings,
  } = trpc.booking.listPaginated.useQuery({
    page: bookingsPage,
    pageSize: PAGE_SIZE,
  });
  const bookings = bookingsData?.items;
  const bookingsTotal = bookingsData?.total ?? 0;
  const bookingsTotalPages = bookingsData?.totalPages ?? 1;

  const { data: agents } = trpc.agent.list.useQuery();

  const updateBooking = trpc.booking.update.useMutation({
    onSuccess: () => {
      void refetchBookings();
      void utils.dashboard.badgeCounts.invalidate();
      toast.success("Booking updated successfully!");
    },
    onError: error => {
      console.error("Failed to update booking:", error);
      toast.error("Failed to update booking. Please try again.");
    },
  });
  const deleteBookingMut = trpc.booking.delete.useMutation({
    onSuccess: () => {
      void refetchBookings();
      toast.success("Booking deleted successfully!");
    },
    onError: error => {
      console.error("Failed to delete booking:", error);
      toast.error("Failed to delete booking. Please try again.");
    },
  });
  const bulkDeleteMut = trpc.booking.bulkDelete.useMutation({
    onSuccess: data => {
      void refetchBookings();
      setSelectedIds(new Set());
      toast.success(`${data.deleted} booking(s) deleted successfully!`);
    },
    onError: error => {
      console.error("Failed to bulk delete:", error);
      toast.error("Failed to delete selected bookings.");
    },
  });
  const sendReminderMut = trpc.booking.sendReminder.useMutation({
    onSuccess: () => {
      toast.success("Reminder email sent successfully!");
    },
    onError: error => {
      console.error("Failed to send reminder:", error);
      toast.error("Failed to send reminder email.");
    },
  });

  const filteredBookings =
    bookings?.filter(booking => {
      const matchesSearch =
        booking.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.contactEmail
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.contactPhone?.includes(searchTerm);
      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

  const handleStatusChange = (bookingId: number, newStatus: BookingStatus) => {
    updateBooking.mutate({ id: bookingId, data: { status: newStatus } });
  };

  const handleDeleteBooking = (bookingId: number) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      deleteBookingMut.mutate({ id: bookingId });
    }
  };

  const handleAgentAssign = (bookingId: number, agentId: number | null) => {
    updateBooking.mutate({
      id: bookingId,
      data: { assignedAgentId: agentId ?? undefined },
    });
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredBookings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBookings.map(b => b.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Delete ${selectedIds.size} selected booking(s)?`)) {
      bulkDeleteMut.mutate({ ids: Array.from(selectedIds) });
    }
  };

  const handleBulkStatusChange = async (status: BookingStatus) => {
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(
        ids.map(id => updateBooking.mutateAsync({ id, data: { status } }))
      );
      setSelectedIds(new Set());
      setBulkStatusMenuOpen(false);
      setBulkMenuOpen(false);
      toast.success(
        `${ids.length} booking(s) updated to ${STATUS_LABELS[status]}`
      );
    } catch {
      toast.error("Failed to update some bookings");
    }
  };

  const handleBulkAgentAssign = async (agentId: number) => {
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(
        ids.map(id =>
          updateBooking.mutateAsync({ id, data: { assignedAgentId: agentId } })
        )
      );
      setSelectedIds(new Set());
      setBulkAgentMenuOpen(false);
      setBulkMenuOpen(false);
      toast.success(`${ids.length} booking(s) assigned`);
    } catch {
      toast.error("Failed to assign some bookings");
    }
  };

  const [isExporting, setIsExporting] = useState(false);
  const allBookingsQuery = trpc.booking.list.useQuery(undefined, {
    enabled: false,
  });

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const { data: allBookings } = await allBookingsQuery.refetch();
      if (!allBookings?.length) {
        toast.error("No bookings to export");
        return;
      }
      const headers = [
        "ID",
        "Name",
        "Email",
        "Phone",
        "Start Date",
        "End Date",
        "Status",
        "Adults",
        "Children",
        "Special Requests",
        "Budget",
        "Created At",
      ];
      const rows = allBookings.map(b => [
        b.id,
        b.contactName ?? "",
        b.contactEmail ?? "",
        b.contactPhone ?? "",
        fmtDate(b.arrivalDate),
        fmtDate(b.departureDate),
        b.status ?? "",
        b.numberOfAdults ?? "",
        b.numberOfChildren ?? "",
        b.specialRequests ?? "",
        b.budget ?? "",
        fmtDate(b.createdAt),
      ]);
      exportToCsv(`wiro-bookings-${todayStamp()}.csv`, headers, rows);
      toast.success("CSV exported successfully!");
    } catch {
      toast.error("Failed to export bookings");
    } finally {
      setIsExporting(false);
    }
  };

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
        <select
          value={statusFilter}
          onChange={e =>
            setStatusFilter(e.target.value as BookingStatus | "all")
          }
          className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All Status</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          onClick={handleExportCSV}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50"
        >
          {isExporting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isExporting ? "Exporting..." : "Export CSV"}
        </button>
        <button
          onClick={() => refetchBookings()}
          className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm font-medium text-blue-700">
            {selectedIds.size} selected
          </span>

          {/* Bulk Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setBulkMenuOpen(!bulkMenuOpen)}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
            >
              Bulk Actions
              <ChevronDown className="w-3 h-3" />
            </button>
            {bulkMenuOpen && (
              <div className="absolute z-50 mt-1 w-48 bg-white border rounded-lg shadow-lg py-1">
                {/* Change Status */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setBulkStatusMenuOpen(!bulkStatusMenuOpen);
                      setBulkAgentMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
                  >
                    Change Status
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {bulkStatusMenuOpen && (
                    <div className="absolute left-full top-0 ml-1 w-36 bg-white border rounded-lg shadow-lg py-1">
                      {(Object.keys(STATUS_LABELS) as BookingStatus[]).map(
                        status => (
                          <button
                            key={status}
                            onClick={() => handleBulkStatusChange(status)}
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2"
                          >
                            <span
                              className={`inline-block w-2 h-2 rounded-full ${STATUS_COLORS[status].split(" ")[0]}`}
                            />
                            {STATUS_LABELS[status]}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Assign Agent */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setBulkAgentMenuOpen(!bulkAgentMenuOpen);
                      setBulkStatusMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
                  >
                    Assign Agent
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {bulkAgentMenuOpen && (
                    <div className="absolute left-full top-0 ml-1 w-36 bg-white border rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto">
                      {agents?.map(agent => (
                        <button
                          key={agent.id}
                          onClick={() => handleBulkAgentAssign(agent.id)}
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50"
                        >
                          {agent.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Send Email */}
                <button
                  onClick={() => {
                    setBulkEmailOpen(true);
                    setBulkMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Mail className="w-3 h-3" />
                  Send Email
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleteMut.isPending}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Delete Selected
          </button>
          <button
            onClick={() => {
              setSelectedIds(new Set());
              setBulkMenuOpen(false);
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Bookings List */}
      {bookingsLoading ? (
        <TableSkeleton />
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No bookings found
        </div>
      ) : (
        <div className="space-y-4">
          {/* Select all */}
          <div className="flex items-center gap-2 px-1">
            <input
              type="checkbox"
              checked={
                filteredBookings.length > 0 &&
                selectedIds.size === filteredBookings.length
              }
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-border"
            />
            <span className="text-sm text-muted-foreground">Select all</span>
          </div>

          {filteredBookings.map(booking => (
            <div
              key={booking.id}
              className="border border-border rounded-lg overflow-hidden group"
            >
              <div className="p-3 md:p-4 bg-muted/50 flex items-center justify-between gap-2 min-h-[56px]">
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(booking.id)}
                    onChange={e => {
                      e.stopPropagation();
                      toggleSelect(booking.id);
                    }}
                    onClick={e => e.stopPropagation()}
                    className="w-4 h-4 rounded border-border shrink-0"
                  />
                  <div
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    onClick={() =>
                      setExpandedBooking(
                        expandedBooking === booking.id ? null : booking.id
                      )
                    }
                  >
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm md:text-base truncate">
                        {booking.contactName}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {booking.arrivalDate
                          ? new Date(booking.arrivalDate).toLocaleDateString()
                          : "No date"}{" "}
                        -
                        {booking.departureDate
                          ? new Date(booking.departureDate).toLocaleDateString()
                          : "No date"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                  {/* Inline agent dropdown */}
                  <select
                    value={booking.assignedAgentId ?? ""}
                    onChange={e => {
                      e.stopPropagation();
                      handleAgentAssign(
                        booking.id,
                        e.target.value ? Number(e.target.value) : null
                      );
                    }}
                    onClick={e => e.stopPropagation()}
                    className="text-xs border border-border rounded px-2 py-1 bg-white hidden sm:block max-w-[120px]"
                  >
                    <option value="">
                      {booking.assignedAgentId ? "" : "Assign..."}
                    </option>
                    {agents?.map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                  {!booking.assignedAgentId && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs hidden sm:inline-flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Needs Agent
                    </span>
                  )}

                  {/* Inline status dropdown */}
                  <InlineStatusDropdown
                    value={booking.status as BookingStatus}
                    onChange={newStatus =>
                      handleStatusChange(booking.id, newStatus)
                    }
                    disabled={updateBooking.isPending}
                  />

                  {booking.depositPaid === 1 && booking.balancePaid === 1 ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hidden sm:inline">
                      Paid
                    </span>
                  ) : booking.depositPaid === 1 ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hidden sm:inline">
                      Deposit Paid
                    </span>
                  ) : null}

                  {/* Quick action icons (visible on hover) */}
                  <div className="hidden group-hover:flex items-center gap-1">
                    {getWhatsAppUrl(booking) && (
                      <a
                        href={getWhatsAppUrl(booking)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {booking.contactEmail && (
                      <a
                        href={`mailto:${booking.contactEmail}`}
                        onClick={e => e.stopPropagation()}
                        className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        title="Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteBooking(booking.id);
                      }}
                      className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">
                    {booking.numberOfAdults} adults
                  </span>
                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      setExpandedBooking(
                        expandedBooking === booking.id ? null : booking.id
                      )
                    }
                  >
                    {expandedBooking === booking.id ? (
                      <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {expandedBooking === booking.id && (
                <div className="p-3 md:p-4 border-t border-border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    <div>
                      <h4 className="font-semibold mb-2 text-foreground text-sm">
                        Contact Info
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="truncate">
                            {booking.contactEmail || "No email"}
                          </span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                          {booking.contactPhone}
                        </p>
                        {getWhatsAppUrl(booking) && (
                          <a
                            href={getWhatsAppUrl(booking)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-green-600 hover:underline"
                          >
                            <MessageCircle className="w-4 h-4 shrink-0" />
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-foreground text-sm">
                        Services
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {booking.includesHotels ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            Hotels
                          </span>
                        ) : null}
                        {booking.includesGuide ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            Guide
                          </span>
                        ) : null}
                        {booking.includesTrip ? (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                            4x4 Trip
                          </span>
                        ) : null}
                        {booking.includesFood ? (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                            Kosher Food
                          </span>
                        ) : null}
                        {booking.needsShabbatHotel ? (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                            Shabbat Hotel
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-foreground text-sm">
                        Actions
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={booking.assignedAgentId ?? ""}
                          onChange={e =>
                            handleAgentAssign(
                              booking.id,
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                          className="px-3 py-2 border border-border rounded text-sm min-h-[44px]"
                        >
                          <option value="">Assign Agent</option>
                          {agents?.map(agent => (
                            <option key={agent.id} value={agent.id}>
                              {agent.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() =>
                            sendReminderMut.mutate({ id: booking.id })
                          }
                          disabled={sendReminderMut.isPending}
                          className="px-3 py-2 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200 transition-colors min-h-[44px] flex items-center gap-1"
                          title="Send Reminder Email"
                        >
                          <Bell className="w-4 h-4" />
                          <span className="hidden sm:inline">Remind</span>
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {booking.specialRequests && (
                    <div className="mt-4 p-3 bg-muted/50 rounded">
                      <h4 className="font-semibold text-sm text-foreground mb-1">
                        Special Requests
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {booking.specialRequests}
                      </p>
                    </div>
                  )}
                  <PaymentSection
                    bookingId={booking.id}
                    totalPrice={booking.totalPrice}
                    depositPaid={booking.depositPaid}
                    balancePaid={booking.balancePaid}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination
        page={bookingsPage}
        totalPages={bookingsTotalPages}
        total={bookingsTotal}
        onPageChange={setBookingsPage}
      />

      <BulkEmailDialog
        open={bulkEmailOpen}
        onClose={() => setBulkEmailOpen(false)}
        bookingIds={Array.from(selectedIds)}
        recipientCount={selectedIds.size}
      />
    </div>
  );
}
