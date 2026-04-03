import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import {
  MessageCircle,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Calendar,
  MapPin,
  Inbox,
  RefreshCw,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

type InboxFilter = "all" | "needs_reply" | "bookings" | "leads";

type InboxItemBase = {
  id: string;
  type: "booking" | "lead";
  name: string;
  phone: string | null;
  whatsapp: string | null;
  createdAt: Date;
  handled: boolean;
};

type BookingInboxItem = InboxItemBase & {
  type: "booking";
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  tourInfo: string; // arrival/departure summary
  bookingId: number;
};

type LeadInboxItem = InboxItemBase & {
  type: "lead";
  leadStatus: "new" | "contacted" | "quoted" | "converted" | "lost";
  interest: string;
  leadId: number;
};

type InboxItem = BookingInboxItem | LeadInboxItem;

// ── Helpers ────────────────────────────────────────────────────────────────

function cleanPhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

function getWhatsAppNumber(
  whatsapp: string | null | undefined,
  phone: string | null | undefined
): string | null {
  const raw = whatsapp || phone;
  if (!raw) return null;
  return cleanPhone(raw);
}

function isUrgent(createdAt: Date): boolean {
  const hoursAgo = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  return hoursAgo > 24;
}

function fmtDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function fmtShortDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function buildBookingTemplate(item: BookingInboxItem): string {
  return encodeURIComponent(
    `Hi ${item.name}! Thank you for booking with WIRO 4x4. Please confirm your dates: ${item.tourInfo}. Best, WIRO Team 🌿`
  );
}

function buildLeadTemplate(item: LeadInboxItem): string {
  return encodeURIComponent(
    `Hi ${item.name}! Thanks for your interest in WIRO 4x4 tours in Chiang Mai. I'd love to help plan your adventure! When are you planning to visit? Best, Mek 🌿`
  );
}

function getWhatsAppUrl(item: InboxItem): string | null {
  const num = getWhatsAppNumber(item.whatsapp, item.phone);
  if (!num) return null;
  const text =
    item.type === "booking"
      ? buildBookingTemplate(item as BookingInboxItem)
      : buildLeadTemplate(item as LeadInboxItem);
  return `https://wa.me/${num}?text=${text}`;
}

// ── Status Badge ───────────────────────────────────────────────────────────

function StatusBadge({ item }: { item: InboxItem }) {
  if (item.type === "booking") {
    const b = item as BookingInboxItem;
    const urgent = isUrgent(b.createdAt) && !b.handled;
    if (urgent) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
          🔴 Urgent
        </span>
      );
    }
    if (b.status === "pending") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
          🟡 Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
        🟢 Confirmed
      </span>
    );
  } else {
    const l = item as LeadInboxItem;
    const urgent = isUrgent(l.createdAt) && !l.handled;
    if (urgent) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
          🔴 Urgent
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
        🔵 New Lead
      </span>
    );
  }
}

// ── Inbox Card ─────────────────────────────────────────────────────────────

function InboxCard({
  item,
  onToggleHandled,
}: {
  item: InboxItem;
  onToggleHandled: (id: string) => void;
}) {
  const waUrl = getWhatsAppUrl(item);

  return (
    <div
      className={`bg-card border rounded-xl p-4 flex flex-col sm:flex-row sm:items-start gap-3 transition-opacity ${
        item.handled ? "opacity-50" : ""
      }`}
    >
      {/* Left: icon */}
      <div
        className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
          item.type === "booking" ? "bg-blue-500" : "bg-purple-500"
        }`}
      >
        {item.type === "booking" ? (
          <Calendar className="w-4 h-4" />
        ) : (
          <User className="w-4 h-4" />
        )}
      </div>

      {/* Center: info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="font-semibold text-foreground truncate">
            {item.name}
          </span>
          <StatusBadge item={item} />
          <span className="text-xs text-muted-foreground ml-auto shrink-0">
            {fmtDate(item.createdAt)}
          </span>
        </div>

        {item.type === "booking" ? (
          <div className="text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              {(item as BookingInboxItem).tourInfo}
            </span>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3 shrink-0" />
              {(item as LeadInboxItem).interest}
            </span>
          </div>
        )}

        {item.phone && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Phone className="w-3 h-3 shrink-0" />
            {item.phone}
          </div>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 shrink-0">
        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors min-h-[40px]"
            title="Reply on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        ) : (
          <button
            disabled
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted text-muted-foreground text-sm cursor-not-allowed min-h-[40px]"
            title="No phone number"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">No phone</span>
          </button>
        )}

        <button
          onClick={() => onToggleHandled(item.id)}
          className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors ${
            item.handled
              ? "bg-green-100 border-green-300 text-green-600"
              : "border-border hover:bg-muted text-muted-foreground"
          }`}
          title={item.handled ? "Mark as unhandled" : "Mark as handled"}
        >
          <CheckCircle2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Filter Tab Button ──────────────────────────────────────────────────────

function FilterTab({
  label,
  count,
  active,
  onClick,
}: {
  id: InboxFilter;
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted text-muted-foreground"
      }`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            active ? "bg-white/20 text-white" : "bg-red-500 text-white"
          }`}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function UnifiedInboxTab() {
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [handled, setHandled] = useState<Set<string>>(new Set());

  // Fetch data
  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    refetch: refetchBookings,
  } = trpc.booking.list.useQuery(undefined, {
    staleTime: 30_000,
  });

  const {
    data: leadsData,
    isLoading: leadsLoading,
    refetch: refetchLeads,
  } = trpc.lead.list.useQuery(undefined, {
    staleTime: 30_000,
  });

  const isLoading = bookingsLoading || leadsLoading;

  const handleRefetch = () => {
    void refetchBookings();
    void refetchLeads();
  };

  // Build merged inbox items
  const allItems = useMemo<InboxItem[]>(() => {
    const items: InboxItem[] = [];

    // Bookings (pending + confirmed, last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    for (const b of bookingsData ?? []) {
      if (b.status !== "pending" && b.status !== "confirmed") continue;
      const createdAt = b.createdAt ? new Date(b.createdAt) : new Date();
      if (createdAt.getTime() < thirtyDaysAgo) continue;

      const arrivalStr = b.arrivalDate ? fmtShortDate(b.arrivalDate) : "—";

      items.push({
        id: `booking-${b.id}`,
        type: "booking",
        name: b.contactName,
        phone: b.contactPhone ?? null,
        whatsapp: b.contactWhatsApp ?? null,
        createdAt,
        handled: handled.has(`booking-${b.id}`),
        status: b.status as BookingInboxItem["status"],
        tourInfo: `Arrival ${arrivalStr}`,
        bookingId: b.id,
      });
    }

    // Leads (new + contacted, last 30 days)
    for (const l of leadsData ?? []) {
      if (l.status !== "new" && l.status !== "contacted") continue;
      const createdAt = l.createdAt ? new Date(l.createdAt) : new Date();
      if (createdAt.getTime() < thirtyDaysAgo) continue;

      let interest = "General interest in WIRO 4x4 tours";
      if (l.interestedTours) {
        try {
          const tours = JSON.parse(l.interestedTours) as string[];
          if (Array.isArray(tours) && tours.length > 0) {
            interest = tours.slice(0, 2).join(", ");
          }
        } catch {
          interest = l.interestedTours.slice(0, 80);
        }
      } else if (l.message) {
        interest = l.message.slice(0, 80) + (l.message.length > 80 ? "…" : "");
      }

      items.push({
        id: `lead-${l.id}`,
        type: "lead",
        name: l.name,
        phone: l.phone ?? null,
        whatsapp: l.phone ?? null, // leads use phone for whatsapp
        createdAt,
        handled: handled.has(`lead-${l.id}`),
        leadStatus: l.status as LeadInboxItem["leadStatus"],
        interest,
        leadId: l.id,
      });
    }

    // Sort by createdAt desc
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return items;
  }, [bookingsData, leadsData, handled]);

  const toggleHandled = (id: string) => {
    setHandled(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Counts
  const unhandledCount = allItems.filter(i => !i.handled).length;
  const needsReplyCount = allItems.filter(i => !i.handled).length;
  const bookingCount = allItems.filter(
    i => i.type === "booking" && !i.handled
  ).length;
  const leadCount = allItems.filter(
    i => i.type === "lead" && !i.handled
  ).length;

  // Filtered view
  const filteredItems = useMemo(() => {
    switch (filter) {
      case "needs_reply":
        return allItems.filter(i => !i.handled);
      case "bookings":
        return allItems.filter(i => i.type === "booking");
      case "leads":
        return allItems.filter(i => i.type === "lead");
      default:
        return allItems;
    }
  }, [allItems, filter]);

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Inbox className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Unified Inbox</h2>
          {unhandledCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unhandledCount > 99 ? "99+" : unhandledCount}
            </span>
          )}
        </div>
        <button
          onClick={handleRefetch}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 flex-wrap">
        <FilterTab
          id="all"
          label="All"
          count={allItems.length}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <FilterTab
          id="needs_reply"
          label="Needs Reply"
          count={needsReplyCount}
          active={filter === "needs_reply"}
          onClick={() => setFilter("needs_reply")}
        />
        <FilterTab
          id="bookings"
          label="Bookings"
          count={bookingCount}
          active={filter === "bookings"}
          onClick={() => setFilter("bookings")}
        />
        <FilterTab
          id="leads"
          label="Leads"
          count={leadCount}
          active={filter === "leads"}
          onClick={() => setFilter("leads")}
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            All caught up!
          </h3>
          <p className="text-sm text-muted-foreground">
            No{" "}
            {filter === "needs_reply"
              ? "items needing reply"
              : filter === "bookings"
                ? "bookings"
                : filter === "leads"
                  ? "leads"
                  : "items"}{" "}
            right now. Check back later.
          </p>
        </div>
      )}

      {/* Items */}
      {!isLoading && filteredItems.length > 0 && (
        <div className="flex flex-col gap-3">
          {/* Urgent section hint */}
          {filteredItems.some(i => isUrgent(i.createdAt) && !i.handled) && (
            <div className="flex items-center gap-2 text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <Clock className="w-4 h-4 shrink-0" />
              Some items haven't been replied to in over 24 hours — act fast!
            </div>
          )}

          {filteredItems.map(item => (
            <InboxCard
              key={item.id}
              item={item}
              onToggleHandled={toggleHandled}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Export count helper for badge ──────────────────────────────────────────

export { UnifiedInboxTab as default };
