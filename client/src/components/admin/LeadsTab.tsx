import { Fragment, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Trash2,
  ArrowRightLeft,
  Download,
  Mail,
  Send,
  Clock,
  RefreshCw,
  Flame,
  Thermometer,
  Snowflake,
  Info,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { PAGE_SIZE } from "./types";
import { TableSkeleton } from "./AdminSkeleton";
import { Pagination } from "./Pagination";
import { exportToCsv, todayStamp, fmtDate } from "@/lib/csvExport";
import { WhatsAppLeadForm } from "./WhatsAppLeadForm";

// ── Score tier helpers ──────────────────────────────────

type ScoreTier = "hot" | "warm" | "cool" | "cold";

function getScoreTier(score: number): ScoreTier {
  if (score >= 75) return "hot";
  if (score >= 50) return "warm";
  if (score >= 25) return "cool";
  return "cold";
}

const TIER_CONFIG: Record<
  ScoreTier,
  { label: string; className: string; icon: typeof Flame }
> = {
  hot: {
    label: "Hot",
    className: "bg-red-100 text-red-700 border-red-200",
    icon: Flame,
  },
  warm: {
    label: "Warm",
    className: "bg-orange-100 text-orange-700 border-orange-200",
    icon: Thermometer,
  },
  cool: {
    label: "Cool",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Snowflake,
  },
  cold: {
    label: "Cold",
    className: "bg-gray-100 text-gray-500 border-gray-200",
    icon: Snowflake,
  },
};

function ScoreBadge({
  score,
  scoreDetails,
}: {
  score: number;
  scoreDetails?: string | null;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tier = getScoreTier(score);
  const config = TIER_CONFIG[tier];
  const TierIcon = config.icon;

  let breakdown: Record<
    string,
    { points: number; max: number; reason: string }
  > | null = null;
  if (scoreDetails) {
    try {
      breakdown = JSON.parse(scoreDetails);
    } catch {
      // ignore parse errors
    }
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${config.className} cursor-default`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(prev => !prev)}
      >
        <TierIcon className="w-3 h-3" />
        {score}
        {breakdown && <Info className="w-3 h-3 opacity-50" />}
      </button>

      {showTooltip && breakdown && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white border border-border rounded-lg shadow-lg text-xs">
          <div className="font-semibold mb-2 text-foreground">
            Score Breakdown ({score}/100) — {config.label}
          </div>
          <div className="space-y-1">
            {Object.entries(breakdown).map(([key, val]) => (
              <div key={key} className="flex justify-between gap-2">
                <span className="text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span className="font-medium whitespace-nowrap">
                  {val.points}/{val.max}
                </span>
              </div>
            ))}
          </div>
          {Object.values(breakdown).some(v => v.reason) && (
            <div className="mt-2 pt-2 border-t border-border space-y-0.5">
              {Object.values(breakdown)
                .filter(v => v.reason && v.points > 0)
                .map((v, i) => (
                  <div key={i} className="text-muted-foreground text-[11px]">
                    {v.reason}
                  </div>
                ))}
            </div>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 bg-white border-b border-r border-border rotate-45" />
        </div>
      )}
    </div>
  );
}

// ── Abandoned Leads Section ─────────────────────────────

function AbandonedLeadsSection() {
  const { data: countData, refetch: refetchCount } =
    trpc.abandoned.count.useQuery();
  const { data: abandonedLeads, refetch: refetchAbandoned } =
    trpc.abandoned.list.useQuery({});

  const sendOneMut = trpc.abandoned.sendRecoveryEmail.useMutation({
    onSuccess: result => {
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      void refetchAbandoned();
      void refetchCount();
    },
    onError: error => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  const sendBatchMut = trpc.abandoned.sendBatchRecovery.useMutation({
    onSuccess: result => {
      toast.success(
        `Recovery emails sent: ${result.sent} succeeded, ${result.failed} failed${result.remaining > 0 ? `, ${result.remaining} remaining` : ""}`
      );
      void refetchAbandoned();
      void refetchCount();
    },
    onError: error => {
      toast.error(`Batch send failed: ${error.message}`);
    },
  });

  const unsentCount = countData?.unsent ?? 0;
  const totalAbandoned = countData?.total ?? 0;

  if (totalAbandoned === 0 && !abandonedLeads?.length) {
    return null;
  }

  return (
    <div className="mt-8 border border-amber-200 rounded-lg bg-amber-50/50">
      <div className="p-4 border-b border-amber-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold text-amber-800">Abandoned Inquiries</h3>
          {unsentCount > 0 && (
            <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full text-xs font-medium">
              {unsentCount} unsent
            </span>
          )}
        </div>
        {unsentCount > 0 && (
          <button
            onClick={() => {
              if (
                confirm(
                  `Send recovery emails to up to ${Math.min(unsentCount, 10)} abandoned leads?`
                )
              ) {
                sendBatchMut.mutate();
              }
            }}
            disabled={sendBatchMut.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {sendBatchMut.isPending ? "Sending..." : `Send All (max 10)`}
          </button>
        )}
      </div>

      {abandonedLeads && abandonedLeads.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-amber-200">
                <th className="text-left py-2 px-4 font-semibold text-amber-800 text-xs">
                  Name
                </th>
                <th className="text-left py-2 px-4 font-semibold text-amber-800 text-xs hidden sm:table-cell">
                  Email
                </th>
                <th className="text-left py-2 px-4 font-semibold text-amber-800 text-xs hidden md:table-cell">
                  Inquiry Date
                </th>
                <th className="text-left py-2 px-4 font-semibold text-amber-800 text-xs hidden lg:table-cell">
                  Message
                </th>
                <th className="text-left py-2 px-4 font-semibold text-amber-800 text-xs">
                  Recovery
                </th>
              </tr>
            </thead>
            <tbody>
              {abandonedLeads.map(lead => (
                <tr
                  key={lead.id}
                  className="border-b border-amber-100 hover:bg-amber-50"
                >
                  <td className="py-2 px-4 text-sm">{lead.name}</td>
                  <td className="py-2 px-4 text-sm hidden sm:table-cell">
                    {lead.email}
                  </td>
                  <td className="py-2 px-4 text-sm text-muted-foreground hidden md:table-cell">
                    {lead.createdAt
                      ? new Date(lead.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="py-2 px-4 text-sm text-muted-foreground hidden lg:table-cell max-w-[200px] truncate">
                    {lead.message || lead.notes || "-"}
                  </td>
                  <td className="py-2 px-4">
                    {(lead as any).recoveryEmailSentAt ? (
                      <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full w-fit">
                        <Mail className="w-3 h-3" />
                        Sent
                      </span>
                    ) : (
                      <button
                        onClick={() => sendOneMut.mutate({ leadId: lead.id })}
                        disabled={sendOneMut.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 rounded text-xs hover:bg-amber-200 transition-colors min-h-[36px] disabled:opacity-50"
                      >
                        <Mail className="w-3 h-3" />
                        <span className="hidden sm:inline">Send Recovery</span>
                        <span className="sm:hidden">Send</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4 text-center text-sm text-amber-600">
          No abandoned inquiries found (leads older than 24h with status "new").
        </div>
      )}
    </div>
  );
}

// ── Main Leads Tab ──────────────────────────────────────

export function LeadsTab() {
  const [leadsPage, setLeadsPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<"score" | "date">("score");
  const [lostReasons, setLostReasons] = useState<Record<number, string>>({});
  const [estimatedValues, setEstimatedValues] = useState<
    Record<number, string>
  >({});
  const [updatingLeadIds, setUpdatingLeadIds] = useState<Set<number>>(
    () => new Set()
  );
  const updatingLeadIdsRef = useRef(new Set<number>());

  const {
    data: leadsData,
    isLoading: leadsLoading,
    refetch: refetchLeads,
  } = trpc.lead.listPaginated.useQuery({
    page: leadsPage,
    pageSize: PAGE_SIZE,
    sortBy,
  });
  const leads = leadsData?.items;
  const leadsTotal = leadsData?.total ?? 0;
  const leadsTotalPages = leadsData?.totalPages ?? 1;

  const rescoreAllMut = trpc.leadScoring.scoreAll.useMutation({
    onSuccess: data => {
      void refetchLeads();
      toast.success(data.message);
    },
    onError: error => {
      toast.error(`Rescore failed: ${error.message}`);
    },
  });

  const updateLeadMut = trpc.lead.update.useMutation({
    onSuccess: () => {
      void refetchLeads();
      toast.success("Lead updated successfully!");
    },
    onError: error => {
      console.error("Failed to update lead:", error);
      toast.error("Failed to update lead. Please try again.");
    },
  });
  const mutateLead = (input: Parameters<typeof updateLeadMut.mutate>[0]) => {
    if (updatingLeadIdsRef.current.has(input.id)) return;

    updatingLeadIdsRef.current.add(input.id);
    setUpdatingLeadIds(new Set(updatingLeadIdsRef.current));
    updateLeadMut.mutate(input, {
      onSettled: () => {
        updatingLeadIdsRef.current.delete(input.id);
        setUpdatingLeadIds(new Set(updatingLeadIdsRef.current));
      },
    });
  };
  const deleteLeadMut = trpc.lead.delete.useMutation({
    onSuccess: () => {
      void refetchLeads();
      toast.success("Lead deleted successfully!");
    },
    onError: error => {
      console.error("Failed to delete lead:", error);
      toast.error("Failed to delete lead. Please try again.");
    },
  });
  const bulkDeleteMut = trpc.lead.bulkDelete.useMutation({
    onSuccess: data => {
      void refetchLeads();
      setSelectedIds(new Set());
      toast.success(`${data.deleted} lead(s) deleted successfully!`);
    },
    onError: error => {
      console.error("Failed to bulk delete leads:", error);
      toast.error("Failed to delete selected leads.");
    },
  });

  const handleLeadStatusChange = (
    lead: NonNullable<typeof leads>[number],
    newStatus: string
  ) => {
    const lostReason = lostReasons[lead.id] ?? lead.lostReason ?? "";
    if (newStatus === "lost" && !lostReason.trim()) {
      toast.error("Add a loss reason below, then choose Lost again.");
      return;
    }
    if (lead.completedAt && newStatus !== "converted") {
      if (!confirm("Undo completed and change this lead's status?")) return;
      mutateLead({
        id: lead.id,
        data: {
          status: newStatus as "new" | "contacted" | "quoted" | "lost",
          completed: false,
          lostReason: newStatus === "lost" ? lostReason.trim() : undefined,
        },
      });
      return;
    }
    mutateLead({
      id: lead.id,
      data: {
        status: newStatus as
          | "new"
          | "contacted"
          | "quoted"
          | "converted"
          | "lost",
        lostReason: newStatus === "lost" ? lostReason.trim() : undefined,
      },
    });
  };

  const handleConvertLead = (leadId: number) => {
    mutateLead({ id: leadId, data: { status: "converted" } });
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
    if (!leads) return;
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map(l => l.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Delete ${selectedIds.size} selected lead(s)?`)) {
      bulkDeleteMut.mutate({ ids: Array.from(selectedIds) });
    }
  };

  const [isExporting, setIsExporting] = useState(false);
  const allLeadsQuery = trpc.lead.list.useQuery(undefined, { enabled: false });

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const { data: allLeads } = await allLeadsQuery.refetch();
      if (!allLeads?.length) {
        toast.error("No leads to export");
        return;
      }
      const headers = [
        "ID",
        "Name",
        "Email",
        "Phone",
        "Source",
        "Source Code",
        "Channel",
        "Language",
        "Landing Page",
        "UTM Source",
        "UTM Medium",
        "UTM Campaign",
        "Status",
        "Tour Interest",
        "Travel Date",
        "Group Size",
        "Estimated Value THB",
        "Completed At",
        "Loss Reason",
        "Score",
        "Message",
        "Created At",
      ];
      const rows = allLeads.map(l => [
        l.id,
        l.name ?? "",
        l.email ?? "",
        l.phone ?? "",
        l.source ?? "",
        l.sourceCode ?? "Unknown",
        l.sourceChannel ?? "Unknown",
        l.language ?? "Unknown",
        l.landingPage ?? "Unknown",
        l.utmSource ?? "Unknown",
        l.utmMedium ?? "Unknown",
        l.utmCampaign ?? "Unknown",
        l.status ?? "",
        l.interestedTours ?? "",
        fmtDate(l.travelDate),
        l.groupSize ?? "",
        l.estimatedValueThb ?? "",
        fmtDate(l.completedAt),
        l.lostReason ?? "",
        l.score ?? 0,
        l.message ?? "",
        fmtDate(l.createdAt),
      ]);
      exportToCsv(`wiro-leads-${todayStamp()}.csv`, headers, rows);
      toast.success("CSV exported successfully!");
    } catch {
      toast.error("Failed to export leads");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <WhatsAppLeadForm onCreated={() => void refetchLeads()} />
      </div>
      {/* Actions bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => rescoreAllMut.mutate()}
          disabled={rescoreAllMut.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-sm disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${rescoreAllMut.isPending ? "animate-spin" : ""}`}
          />
          {rescoreAllMut.isPending ? "Scoring..." : "Rescore All"}
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

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort by:</span>
          <select
            value={sortBy}
            onChange={e => {
              setSortBy(e.target.value as "score" | "date");
              setLeadsPage(1);
            }}
            className="px-2 py-1 border border-border rounded text-xs min-h-[36px]"
          >
            <option value="score">Score (highest first)</option>
            <option value="date">Date (newest first)</option>
          </select>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm font-medium text-blue-700">
            {selectedIds.size} selected
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleteMut.isPending}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Delete Selected
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-blue-600 hover:underline"
          >
            Clear Selection
          </button>
        </div>
      )}

      {leadsLoading ? (
        <TableSkeleton />
      ) : leads?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No leads captured yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm">
                  <input
                    type="checkbox"
                    checked={
                      leads
                        ? leads.length > 0 && selectedIds.size === leads.length
                        : false
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-border"
                  />
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm hidden sm:table-cell">
                  Contact
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm hidden md:table-cell">
                  Source
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm hidden xl:table-cell">
                  Trip context
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm hidden lg:table-cell">
                  Outcome
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm hidden sm:table-cell">
                  Score
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm hidden md:table-cell">
                  Date
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground text-xs md:text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {leads?.map(lead => (
                <Fragment key={lead.id}>
                  <tr className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(lead.id)}
                        onChange={() => toggleSelect(lead.id)}
                        disabled={updatingLeadIds.has(lead.id)}
                        className="w-4 h-4 rounded border-border"
                      />
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <p>{lead.name}</p>
                      <div className="mt-1 text-[11px] leading-4 text-muted-foreground md:hidden">
                        <div
                          aria-label={`Mobile contact for ${lead.name}`}
                          className="mb-1 select-text sm:hidden"
                        >
                          <p>{lead.phone || "No phone"}</p>
                          <p>{lead.email || "No email"}</p>
                        </div>
                        <p>
                          {lead.sourceCode || "Unknown"} ·{" "}
                          {lead.sourceChannel || "Unknown"}
                        </p>
                        <p>
                          {lead.estimatedValueThb != null
                            ? `THB ${Number(lead.estimatedValueThb).toLocaleString()}`
                            : "Unknown value"}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <p className="text-sm">{lead.email || "No email"}</p>
                      {lead.phone && (
                        <p className="text-sm text-muted-foreground">
                          {lead.phone}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm hidden md:table-cell">
                      <p className="font-medium">
                        {lead.sourceCode || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lead.sourceChannel || "Unknown"}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-sm hidden xl:table-cell">
                      <p>{lead.interestedTours || "Unknown tour"}</p>
                      <p className="text-xs text-muted-foreground">
                        {fmtDate(lead.travelDate) || "Unknown date"} ·{" "}
                        {lead.groupSize
                          ? `${lead.groupSize} people`
                          : "Unknown group"}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-sm hidden lg:table-cell">
                      <p className="font-medium">
                        {lead.estimatedValueThb != null
                          ? `THB ${Number(lead.estimatedValueThb).toLocaleString()}`
                          : "Unknown value"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lead.completedAt ? "Completed" : "Not completed"}
                      </p>
                      {lead.lostReason && (
                        <p className="text-xs text-red-700">
                          {lead.lostReason}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      {lead.score != null && lead.score > 0 ? (
                        <ScoreBadge
                          score={lead.score}
                          scoreDetails={lead.scoreDetails}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={lead.status}
                        aria-label={`Status for ${lead.name}`}
                        disabled={updatingLeadIds.has(lead.id)}
                        onChange={e =>
                          handleLeadStatusChange(lead, e.target.value)
                        }
                        className="px-2 py-1 border border-border rounded text-xs md:text-sm min-h-[44px]"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="quoted">Quoted</option>
                        <option value="converted">Confirmed</option>
                        <option value="lost">Lost</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">
                      {lead.createdAt
                        ? new Date(lead.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {lead.status !== "converted" && (
                          <button
                            onClick={() => handleConvertLead(lead.id)}
                            disabled={updatingLeadIds.has(lead.id)}
                            className="px-2 md:px-3 py-1.5 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors min-h-[36px] flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span className="hidden sm:inline">Convert</span>
                          </button>
                        )}
                        {lead.status === "converted" && (
                          <button
                            type="button"
                            onClick={() =>
                              mutateLead({
                                id: lead.id,
                                data: { completed: !lead.completedAt },
                              })
                            }
                            disabled={updatingLeadIds.has(lead.id)}
                            className="flex min-h-[44px] items-center gap-1 rounded bg-blue-100 px-2 text-xs text-blue-700 transition hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {lead.completedAt ? (
                              <Circle className="h-3 w-3" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            {lead.completedAt
                              ? "Undo completed"
                              : "Mark completed"}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm("Delete this lead?"))
                              deleteLeadMut.mutate({ id: lead.id });
                          }}
                          disabled={updatingLeadIds.has(lead.id)}
                          className="px-2 py-1.5 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 transition-colors min-h-[36px] flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td colSpan={11} className="px-4 pb-3">
                      <details className="rounded-lg bg-muted/40 px-3 py-2 text-sm">
                        <summary className="min-h-[44px] cursor-pointer py-3 font-medium">
                          Attribution and outcome details
                        </summary>
                        <div className="grid gap-3 pb-3 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="text-xs leading-5 text-muted-foreground">
                            <strong className="block text-foreground">
                              Attribution
                            </strong>
                            Code: {lead.sourceCode || "Unknown"}
                            <br />
                            Channel: {lead.sourceChannel || "Unknown"}
                            <br />
                            Language: {lead.language || "Unknown"}
                            <br />
                            Landing: {lead.landingPage || "Unknown"}
                          </div>
                          <div className="text-xs leading-5 text-muted-foreground">
                            <strong className="block text-foreground">
                              Trip
                            </strong>
                            Tour: {lead.interestedTours || "Unknown"}
                            <br />
                            Date: {fmtDate(lead.travelDate) || "Unknown"}
                            <br />
                            Group: {lead.groupSize || "Unknown"}
                          </div>
                          <label className="grid gap-1 text-xs font-medium">
                            Estimated value (THB)
                            <div className="flex gap-2">
                              <input
                                aria-label={`Estimated value for ${lead.name}`}
                                type="number"
                                min={0}
                                max={2_147_483_647}
                                disabled={updatingLeadIds.has(lead.id)}
                                value={
                                  estimatedValues[lead.id] ??
                                  String(lead.estimatedValueThb ?? "")
                                }
                                onChange={event =>
                                  setEstimatedValues(values => ({
                                    ...values,
                                    [lead.id]: event.target.value,
                                  }))
                                }
                                className="min-h-[44px] min-w-0 flex-1 rounded border border-border bg-background px-2"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const value =
                                    estimatedValues[lead.id] ??
                                    String(lead.estimatedValueThb ?? "");
                                  mutateLead({
                                    id: lead.id,
                                    data: {
                                      estimatedValueThb: value
                                        ? Number(value)
                                        : null,
                                    },
                                  });
                                }}
                                disabled={updatingLeadIds.has(lead.id)}
                                className="min-h-[44px] rounded bg-muted px-3 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Save
                              </button>
                            </div>
                          </label>
                          <label className="grid gap-1 text-xs font-medium">
                            Loss reason (required before Lost)
                            <input
                              aria-label={`Loss reason for ${lead.name}`}
                              value={
                                lostReasons[lead.id] ?? lead.lostReason ?? ""
                              }
                              disabled={updatingLeadIds.has(lead.id)}
                              onChange={event =>
                                setLostReasons(reasons => ({
                                  ...reasons,
                                  [lead.id]: event.target.value,
                                }))
                              }
                              className="min-h-[44px] rounded border border-border bg-background px-2"
                              placeholder="Price, timing, no response…"
                            />
                          </label>
                        </div>
                      </details>
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={leadsPage}
        totalPages={leadsTotalPages}
        total={leadsTotal}
        onPageChange={setLeadsPage}
      />

      {/* Abandoned Booking Recovery Section */}
      <AbandonedLeadsSection />
    </div>
  );
}
