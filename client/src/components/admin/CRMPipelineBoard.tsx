import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  MessageCircle,
  StickyNote,
  User,
  Loader2,
  GripVertical,
  ChevronDown,
} from "lucide-react";

interface CRMPipelineBoardProps {
  onSelectCustomer: (customerId: number) => void;
}

type Stage = "prospect" | "active" | "completed" | "vip" | "inactive";

const STAGES: Stage[] = ["prospect", "active", "completed", "vip", "inactive"];

const STAGE_LABELS: Record<Stage, string> = {
  prospect: "Prospect",
  active: "Active",
  completed: "Completed",
  vip: "VIP",
  inactive: "Inactive",
};

const STAGE_COLORS: Record<Stage, string> = {
  prospect: "bg-blue-100 text-blue-800 border-blue-200",
  active: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-purple-100 text-purple-800 border-purple-200",
  vip: "bg-yellow-100 text-yellow-800 border-yellow-200",
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
};

const STAGE_HEADER_BG: Record<Stage, string> = {
  prospect: "bg-blue-100",
  active: "bg-green-100",
  completed: "bg-purple-100",
  vip: "bg-yellow-100",
  inactive: "bg-gray-100",
};

const STAGE_HEADER_TEXT: Record<Stage, string> = {
  prospect: "text-blue-800",
  active: "text-green-800",
  completed: "text-purple-800",
  vip: "text-yellow-800",
  inactive: "text-gray-800",
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

export function CRMPipelineBoard({ onSelectCustomer }: CRMPipelineBoardProps) {
  const [draggedCustomerId, setDraggedCustomerId] = useState<number | null>(
    null
  );

  const {
    data: customersData,
    isLoading: customersLoading,
    refetch: refetchCustomers,
  } = trpc.crm.listCustomers.useQuery({ page: 1, pageSize: 100 });

  const { data: pipelineStats } = trpc.crm.getPipelineStats.useQuery();

  const movePipelineMut = trpc.crm.movePipeline.useMutation({
    onSuccess: () => {
      refetchCustomers();
      toast.success("Customer moved successfully!");
    },
    onError: error => {
      console.error("Failed to move customer:", error);
      toast.error("Failed to move customer. Please try again.");
    },
  });

  const allCustomers = customersData?.items ?? [];

  const customersByStage: Record<Stage, typeof allCustomers> = {
    prospect: allCustomers.filter(c => c.stage === "prospect"),
    active: allCustomers.filter(c => c.stage === "active"),
    completed: allCustomers.filter(c => c.stage === "completed"),
    vip: allCustomers.filter(c => c.stage === "vip"),
    inactive: allCustomers.filter(c => c.stage === "inactive"),
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    customerId: number
  ) => {
    setDraggedCustomerId(customerId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(customerId));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, stage: Stage) => {
    e.preventDefault();
    const customerId = Number(e.dataTransfer.getData("text/plain"));
    if (!customerId) return;

    const customer = allCustomers.find(c => c.id === customerId);
    if (customer && customer.stage !== stage) {
      movePipelineMut.mutate({ customerId, stage });
    }
    setDraggedCustomerId(null);
  };

  const handleDragEnd = () => {
    setDraggedCustomerId(null);
  };

  const handleMobileMove = (customerId: number, newStage: Stage) => {
    const customer = allCustomers.find(c => c.id === customerId);
    if (customer && customer.stage !== newStage) {
      movePipelineMut.mutate({ customerId, stage: newStage });
    }
  };

  if (customersLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading pipeline...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Desktop: horizontal board */}
      <div className="hidden md:flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => (
          <div
            key={stage}
            className="flex-1 min-w-[240px] bg-card rounded-lg border border-border shadow-sm flex flex-col"
            onDragOver={handleDragOver}
            onDrop={e => handleDrop(e, stage)}
          >
            {/* Column header */}
            <div
              className={`px-4 py-3 rounded-t-lg ${STAGE_HEADER_BG[stage]} border-b border-border`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`font-semibold text-sm ${STAGE_HEADER_TEXT[stage]}`}
                >
                  {STAGE_LABELS[stage]}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${STAGE_COLORS[stage]}`}
                >
                  {pipelineStats
                    ? pipelineStats[stage]
                    : customersByStage[stage].length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[600px]">
              {customersByStage[stage].length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-8">
                  No customers
                </p>
              ) : (
                customersByStage[stage].map(customer => (
                  <div
                    key={customer.id}
                    draggable
                    onDragStart={e => handleDragStart(e, customer.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-background border border-border rounded-md p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
                      draggedCustomerId === customer.id ? "opacity-50" : ""
                    }`}
                  >
                    <div
                      className="flex items-start gap-2 cursor-pointer"
                      onClick={() => onSelectCustomer(customer.id)}
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {customer.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {customer.email || customer.phone || "No contact"}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-muted-foreground">
                            {timeAgo(customer.lastContactAt)}
                          </span>
                          {customer.source && (
                            <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-[10px]">
                              {customer.source}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex gap-1 mt-2 pt-2 border-t border-border/50">
                      {customer.whatsapp && (
                        <a
                          href={`https://wa.me/${customer.whatsapp.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="p-1.5 rounded hover:bg-green-50 text-green-600 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSelectCustomer(customer.id);
                        }}
                        className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                        title="View details / Add note"
                      >
                        <StickyNote className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: vertical columns with move dropdown */}
      <div className="md:hidden space-y-4">
        {STAGES.map(stage => (
          <div
            key={stage}
            className="bg-card rounded-lg border border-border shadow-sm"
          >
            {/* Column header */}
            <div
              className={`px-4 py-3 rounded-t-lg ${STAGE_HEADER_BG[stage]} border-b border-border`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`font-semibold text-sm ${STAGE_HEADER_TEXT[stage]}`}
                >
                  {STAGE_LABELS[stage]}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${STAGE_COLORS[stage]}`}
                >
                  {pipelineStats
                    ? pipelineStats[stage]
                    : customersByStage[stage].length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="p-2 space-y-2">
              {customersByStage[stage].length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-4">
                  No customers
                </p>
              ) : (
                customersByStage[stage].map(customer => (
                  <div
                    key={customer.id}
                    className="bg-background border border-border rounded-md p-3"
                  >
                    <div
                      className="flex items-start gap-2 cursor-pointer"
                      onClick={() => onSelectCustomer(customer.id)}
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {customer.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {customer.email || customer.phone || "No contact"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {timeAgo(customer.lastContactAt)}
                          </span>
                          {customer.source && (
                            <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-[10px]">
                              {customer.source}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mobile actions: WhatsApp + Move dropdown */}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                      {customer.whatsapp && (
                        <a
                          href={`https://wa.me/${customer.whatsapp.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-green-50 text-green-600 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                      <div className="relative flex-1">
                        <select
                          value={stage}
                          onChange={e =>
                            handleMobileMove(
                              customer.id,
                              e.target.value as Stage
                            )
                          }
                          className="w-full px-2 py-1.5 border border-border rounded text-xs appearance-none bg-background pr-7"
                        >
                          {STAGES.map(s => (
                            <option key={s} value={s}>
                              Move to {STAGE_LABELS[s]}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
