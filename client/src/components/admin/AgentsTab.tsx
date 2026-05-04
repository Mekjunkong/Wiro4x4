import { trpc } from "@/lib/trpc";
import { Phone, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CardGridSkeleton } from "./AdminSkeleton";

type AgentStatus = "active" | "inactive" | "on_leave";

function cycleStatus(current: string): AgentStatus {
  if (current === "active") return "on_leave";
  if (current === "on_leave") return "inactive";
  return "active";
}

const STATUS_LABEL: Record<AgentStatus, string> = {
  active: "Active",
  on_leave: "On Leave",
  inactive: "Inactive",
};

export function AgentsTab() {
  const utils = trpc.useUtils();
  const { data: agents, isLoading: agentsLoading } = trpc.agent.list.useQuery();
  const { data: agentStats } = trpc.agent.stats.useQuery();

  const updateAvailability = trpc.agent.updateAvailability.useMutation({
    onSuccess: () => {
      void utils.agent.list.invalidate();
      void utils.agent.stats.invalidate();
      toast.success("Agent availability updated");
    },
    onError: () => toast.error("Failed to update availability"),
  });

  function handleCycleStatus(agentId: number, currentStatus: string) {
    const next = cycleStatus(currentStatus);
    updateAvailability.mutate({ id: agentId, status: next });
  }

  return (
    <div className="p-6">
      {agentsLoading ? (
        <CardGridSkeleton />
      ) : agents?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No agents found. Add agents to manage your team.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents?.map(agent => {
            const stats = agentStats?.find(
              (s: { id: number }) => s.id === agent.id
            );
            const rating = stats?.rating ?? agent.rating ?? 5;
            const isMutating =
              updateAvailability.isPending &&
              updateAvailability.variables?.id === agent.id;
            return (
              <div
                key={agent.id}
                className="border border-border rounded-lg p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{agent.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {agent.email}
                    </p>
                  </div>
                </div>
                {/* Star Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <span
                      key={s}
                      className={`text-lg ${s <= rating ? "text-yellow-400" : "text-muted-foreground/50"}`}
                    >
                      &#9733;
                    </span>
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">
                    ({rating}/5)
                  </span>
                </div>
                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-blue-700">
                      {stats?.totalBookings ?? 0}
                    </p>
                    <p className="text-xs text-blue-600">Total</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-green-700">
                      {stats?.completedBookings ?? 0}
                    </p>
                    <p className="text-xs text-green-600">Completed</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-purple-700">
                      {stats?.activeBookings ?? 0}
                    </p>
                    <p className="text-xs text-purple-600">Active</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {agent.phone}
                  </p>
                  {agent.languages && (
                    <p className="text-muted-foreground">
                      Languages: {agent.languages}
                    </p>
                  )}
                </div>
                {/* Clickable status toggle */}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleCycleStatus(agent.id, agent.status ?? "active")
                    }
                    disabled={isMutating}
                    className={`px-2 py-1 rounded text-xs cursor-pointer transition-all hover:ring-2 hover:ring-offset-1 hover:ring-primary/30 ${
                      agent.status === "active"
                        ? "bg-green-100 text-green-800"
                        : agent.status === "on_leave"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-foreground"
                    }`}
                    title="Click to cycle status"
                  >
                    {isMutating ? (
                      <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                    ) : null}
                    {STATUS_LABEL[(agent.status as AgentStatus) ?? "active"]}
                  </button>
                  <span className="text-xs text-muted-foreground">
                    (click to change)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Agent Availability Calendar */}
      {agents &&
        agents.length > 0 &&
        (() => {
          const today = new Date();
          const dayOfWeek = today.getDay(); // 0=Sun
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - dayOfWeek);
          const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);
            return d;
          });
          const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          return (
            <div className="mt-6 bg-card border border-border rounded-xl p-4 md:p-6">
              <h4 className="text-sm md:text-base font-semibold text-foreground mb-4">
                Weekly Availability
                <span className="text-xs font-normal text-muted-foreground ml-2">
                  (click a cell to cycle status)
                </span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[500px]">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-3 text-xs md:text-sm font-semibold text-muted-foreground border-b border-border w-32">
                        Agent
                      </th>
                      {days.map((d, i) => {
                        const isToday =
                          d.toDateString() === today.toDateString();
                        return (
                          <th
                            key={i}
                            className={`py-2 px-2 text-xs md:text-sm text-center border-b border-border ${isToday ? "bg-primary/5 font-bold text-primary" : "font-semibold text-muted-foreground"}`}
                          >
                            <div>{dayLabels[i]}</div>
                            <div className="text-xs font-normal">
                              {d.getDate()}/{d.getMonth() + 1}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map(agent => {
                      const stats = agentStats?.find(
                        (s: { id: number }) => s.id === agent.id
                      );
                      const isMutating =
                        updateAvailability.isPending &&
                        updateAvailability.variables?.id === agent.id;
                      return (
                        <tr
                          key={agent.id}
                          className="border-b border-border/50"
                        >
                          <td className="py-2 px-3 text-sm font-medium truncate max-w-[120px]">
                            {agent.name}
                          </td>
                          {days.map((d, i) => {
                            const isToday =
                              d.toDateString() === today.toDateString();
                            const isFriday = i === 5;
                            const isSaturday = i === 6;
                            let bgColor = "bg-green-100";
                            let textColor = "text-green-700";
                            let label = "Active";
                            if (agent.status === "inactive") {
                              bgColor = "bg-gray-100";
                              textColor = "text-muted-foreground";
                              label = "Inactive";
                            } else if (agent.status === "on_leave") {
                              bgColor = "bg-yellow-100";
                              textColor = "text-yellow-700";
                              label = "Leave";
                            } else if (isFriday || isSaturday) {
                              bgColor = "bg-purple-50";
                              textColor = "text-purple-600";
                              label = "Shabbat";
                            }
                            return (
                              <td
                                key={i}
                                className={`py-2 px-1 text-center ${isToday ? "bg-primary/5" : ""}`}
                              >
                                <button
                                  onClick={() =>
                                    handleCycleStatus(
                                      agent.id,
                                      agent.status ?? "active"
                                    )
                                  }
                                  disabled={isMutating}
                                  className={`${bgColor} ${textColor} rounded px-1 py-1 text-xs font-medium w-full cursor-pointer transition-all hover:ring-2 hover:ring-offset-1 hover:ring-primary/30`}
                                  title="Click to cycle status"
                                >
                                  {isMutating ? (
                                    <Loader2 className="w-3 h-3 animate-spin inline" />
                                  ) : (
                                    <>
                                      {label}
                                      {agent.status === "active" && stats && (
                                        <div className="text-xs opacity-75 mt-0.5">
                                          {stats.activeBookings}b
                                        </div>
                                      )}
                                    </>
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-green-100 rounded inline-block"></span>{" "}
                  Active
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-yellow-100 rounded inline-block"></span>{" "}
                  On Leave
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-gray-100 rounded inline-block"></span>{" "}
                  Inactive
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-purple-50 rounded inline-block border border-purple-200"></span>{" "}
                  Shabbat
                </span>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
