import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  User,
  Star,
  Clock,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  FileText,
  PhoneCall,
  Send,
  Tag,
  Globe,
  Loader2,
} from "lucide-react";

interface CRMCustomerDetailProps {
  customerId: number;
  onClose: () => void;
}

type Stage = "prospect" | "active" | "completed" | "vip" | "inactive";
type ActivityType =
  | "note"
  | "call"
  | "whatsapp"
  | "email"
  | "follow_up"
  | "status_change";

const STAGES: Stage[] = ["prospect", "active", "completed", "vip", "inactive"];

const STAGE_LABELS: Record<Stage, string> = {
  prospect: "Prospect",
  active: "Active",
  completed: "Completed",
  vip: "VIP",
  inactive: "Inactive",
};

const STAGE_COLORS: Record<Stage, string> = {
  prospect: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-purple-100 text-purple-800",
  vip: "bg-yellow-100 text-yellow-800",
  inactive: "bg-gray-100 text-gray-800",
};

const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  note: "Note",
  call: "Call",
  whatsapp: "WhatsApp",
  email: "Email",
  follow_up: "Follow-up",
  status_change: "Status Change",
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

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "\u0E3F0";
  return `\u0E3F${amount.toLocaleString()}`;
}

function getActivityIcon(type: string) {
  switch (type) {
    case "note":
      return <FileText className="w-4 h-4 text-blue-500" />;
    case "call":
      return <PhoneCall className="w-4 h-4 text-green-500" />;
    case "whatsapp":
      return <MessageCircle className="w-4 h-4 text-green-600" />;
    case "email":
      return <Mail className="w-4 h-4 text-purple-500" />;
    case "follow_up":
      return <Clock className="w-4 h-4 text-orange-500" />;
    case "status_change":
      return <AlertCircle className="w-4 h-4 text-gray-500" />;
    case "lead":
      return <User className="w-4 h-4 text-blue-500" />;
    case "booking":
      return <Calendar className="w-4 h-4 text-indigo-500" />;
    case "review":
      return <Star className="w-4 h-4 text-yellow-500" />;
    default:
      return <FileText className="w-4 h-4 text-gray-400" />;
  }
}

function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

type SubTab = "timeline" | "activities" | "notes";

export function CRMCustomerDetail({
  customerId,
  onClose,
}: CRMCustomerDetailProps) {
  const [activeTab, setActiveTab] = useState<SubTab>("timeline");
  const [newActivityType, setNewActivityType] = useState<ActivityType>("note");
  const [newActivityContent, setNewActivityContent] = useState("");
  const [newActivityDueDate, setNewActivityDueDate] = useState("");

  const { data, isLoading, refetch } = trpc.crm.getCustomer.useQuery({
    id: customerId,
  });

  const movePipelineMut = trpc.crm.movePipeline.useMutation({
    onSuccess: () => {
      void refetch();
      toast.success("Stage updated successfully!");
    },
    onError: error => {
      console.error("Failed to update stage:", error);
      toast.error("Failed to update stage.");
    },
  });

  const addActivityMut = trpc.crm.addActivity.useMutation({
    onSuccess: () => {
      void refetch();
      setNewActivityContent("");
      setNewActivityDueDate("");
      toast.success("Activity added successfully!");
    },
    onError: error => {
      console.error("Failed to add activity:", error);
      toast.error("Failed to add activity.");
    },
  });

  const completeActivityMut = trpc.crm.completeActivity.useMutation({
    onSuccess: () => {
      void refetch();
      toast.success("Activity completed!");
    },
    onError: error => {
      console.error("Failed to complete activity:", error);
      toast.error("Failed to complete activity.");
    },
  });

  const handleStageChange = (newStage: Stage) => {
    if (data?.customer && data.customer.stage !== newStage) {
      movePipelineMut.mutate({ customerId, stage: newStage });
    }
  };

  const handleAddActivity = () => {
    if (!newActivityContent.trim()) {
      toast.error("Please enter activity content.");
      return;
    }
    addActivityMut.mutate({
      customerId,
      type: newActivityType,
      content: newActivityContent.trim(),
      dueDate: newActivityDueDate || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">
            Loading customer...
          </span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground">Customer not found.</p>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  const { customer, activities, timeline } = data;
  const tags = parseTags(customer.tags);

  // Build merged timeline
  const mergedTimeline = [
    ...timeline.map(t => ({
      date: new Date(t.date),
      type: t.type,
      title: t.title,
      detail: t.detail,
      source: t.source,
    })),
    ...activities.map(a => ({
      date: new Date(a.createdAt),
      type: a.type,
      title: `${ACTIVITY_TYPE_LABELS[a.type as ActivityType] ?? a.type}${a.createdBy ? ` by ${a.createdBy}` : ""}`,
      detail: a.content,
      source: "activities",
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  // Separate follow-up / pending activities
  const pendingActivities = activities.filter(a => !a.isCompleted);
  const completedActivities = activities.filter(a => a.isCompleted);

  const isOverdue = (dueDate: Date | string | null | undefined) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const isUpcoming = (dueDate: Date | string | null | undefined) => {
    if (!dueDate) return false;
    const d = new Date(dueDate);
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return d >= now && d <= threeDaysFromNow;
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold truncate">{customer.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${STAGE_COLORS[customer.stage as Stage] ?? "bg-gray-100 text-gray-800"}`}
                >
                  {STAGE_LABELS[customer.stage as Stage] ?? customer.stage}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Stage changer */}
            <div className="relative">
              <select
                value={customer.stage}
                onChange={e => handleStageChange(e.target.value as Stage)}
                className="px-3 py-1.5 border border-border rounded text-sm appearance-none bg-background pr-7"
              >
                {STAGES.map(s => (
                  <option key={s} value={s}>
                    {STAGE_LABELS[s]}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-muted transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contact info row */}
        <div className="flex flex-wrap gap-3 mt-4">
          {customer.email && (
            <a
              href={`mailto:${customer.email}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-4 h-4" />
              {customer.email}
            </a>
          )}
          {customer.phone && (
            <a
              href={`tel:${customer.phone}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Phone className="w-4 h-4" />
              {customer.phone}
            </a>
          )}
          {customer.whatsapp && (
            <a
              href={`https://wa.me/${customer.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          )}
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-4 mt-3 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Star className="w-4 h-4" />
            {formatCurrency(customer.totalSpent)} spent
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {customer.totalBookings ?? 0} bookings
          </span>
          {customer.source && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Globe className="w-4 h-4" />
              {customer.source}
            </span>
          )}
          {customer.language && (
            <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">
              {customer.language === "he" ? "Hebrew" : "English"}
            </span>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="border-b border-border">
        <div className="flex">
          {(["timeline", "activities", "notes"] as SubTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-4 md:p-6 max-h-[500px] overflow-y-auto">
        {/* Timeline tab */}
        {activeTab === "timeline" && (
          <div className="space-y-4">
            {mergedTimeline.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No timeline events yet.
              </p>
            ) : (
              mergedTimeline.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="mt-1 shrink-0">
                    {getActivityIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{item.title}</p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {timeAgo(item.date)}
                      </span>
                    </div>
                    {item.detail && (
                      <p className="text-sm text-muted-foreground mt-0.5 break-words">
                        {item.detail}
                      </p>
                    )}
                    <span className="text-[10px] text-muted-foreground mt-0.5 inline-block">
                      {formatDate(item.date)} &middot; {item.source}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Activities tab */}
        {activeTab === "activities" && (
          <div className="space-y-4">
            {/* Pending activities */}
            {pendingActivities.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Pending</h4>
                <div className="space-y-2">
                  {pendingActivities.map(activity => (
                    <div
                      key={activity.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        activity.dueDate && isOverdue(activity.dueDate)
                          ? "border-red-200 bg-red-50"
                          : activity.dueDate && isUpcoming(activity.dueDate)
                            ? "border-yellow-200 bg-yellow-50"
                            : "border-border bg-background"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-1.5 py-0.5 bg-muted rounded">
                            {ACTIVITY_TYPE_LABELS[
                              activity.type as ActivityType
                            ] ?? activity.type}
                          </span>
                          {activity.dueDate && (
                            <span
                              className={`text-xs ${
                                isOverdue(activity.dueDate)
                                  ? "text-red-600 font-medium"
                                  : isUpcoming(activity.dueDate)
                                    ? "text-yellow-600 font-medium"
                                    : "text-muted-foreground"
                              }`}
                            >
                              Due: {formatDate(activity.dueDate)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm mt-1 break-words">
                          {activity.content}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {activity.createdBy ? `by ${activity.createdBy}` : ""}{" "}
                          {timeAgo(activity.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          completeActivityMut.mutate({ id: activity.id })
                        }
                        disabled={completeActivityMut.isPending}
                        className="p-1.5 rounded hover:bg-green-100 text-green-600 transition-colors shrink-0"
                        title="Mark as complete"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed activities */}
            {completedActivities.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                  Completed
                </h4>
                <div className="space-y-2">
                  {completedActivities.map(activity => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-muted/30"
                    >
                      <div className="mt-0.5 shrink-0 opacity-50">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-1.5 py-0.5 bg-muted rounded line-through">
                            {ACTIVITY_TYPE_LABELS[
                              activity.type as ActivityType
                            ] ?? activity.type}
                          </span>
                        </div>
                        <p className="text-sm mt-1 text-muted-foreground line-through break-words">
                          {activity.content}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {activity.createdBy ? `by ${activity.createdBy}` : ""}{" "}
                          {timeAgo(activity.createdAt)}
                        </p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingActivities.length === 0 &&
              completedActivities.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No activities yet.
                </p>
              )}
          </div>
        )}

        {/* Notes tab */}
        {activeTab === "notes" && (
          <div>
            {customer.notes ? (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{customer.notes}</p>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No notes for this customer.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Add Activity form */}
      <div className="border-t border-border p-4 md:p-6">
        <h4 className="text-sm font-semibold mb-3">Add Activity</h4>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select
                value={newActivityType}
                onChange={e =>
                  setNewActivityType(e.target.value as ActivityType)
                }
                className="px-3 py-2 border border-border rounded-lg text-sm appearance-none bg-background pr-8"
              >
                <option value="note">Note</option>
                <option value="call">Call</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="follow_up">Follow-up</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            {newActivityType === "follow_up" && (
              <input
                type="datetime-local"
                value={newActivityDueDate}
                onChange={e => setNewActivityDueDate(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg text-sm bg-background"
              />
            )}
          </div>
          <textarea
            value={newActivityContent}
            onChange={e => setNewActivityContent(e.target.value)}
            placeholder="Add a note, log a call, or schedule a follow-up..."
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            onClick={handleAddActivity}
            disabled={addActivityMut.isPending || !newActivityContent.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addActivityMut.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Add Activity
          </button>
        </div>
      </div>
    </div>
  );
}
