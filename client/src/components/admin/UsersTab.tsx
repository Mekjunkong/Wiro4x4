import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Shield, ChevronDown, Trash2, Loader2 } from "lucide-react";
import { TableSkeleton } from "./AdminSkeleton";

const ROLE_OPTIONS = ["user", "admin", "owner", "manager", "agent"] as const;

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-red-100 text-red-800",
  admin: "bg-purple-100 text-purple-800",
  manager: "bg-blue-100 text-blue-800",
  agent: "bg-green-100 text-green-800",
  user: "bg-gray-100 text-gray-800",
};

export function UsersTab() {
  const { user: currentUser } = useAuth();

  const {
    data: users,
    isLoading,
    refetch: refetchUsers,
  } = trpc.admin.listUsers.useQuery();

  const updateRoleMut = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      refetchUsers();
      toast.success("User role updated successfully!");
    },
    onError: error => {
      console.error("Failed to update user role:", error);
      toast.error(error.message || "Failed to update user role.");
    },
  });

  const removeUserMut = trpc.admin.removeUser.useMutation({
    onSuccess: () => {
      refetchUsers();
      toast.success("User removed successfully!");
    },
    onError: error => {
      console.error("Failed to remove user:", error);
      toast.error(error.message || "Failed to remove user.");
    },
  });

  const handleRoleChange = (userId: number, role: string) => {
    updateRoleMut.mutate({
      userId,
      role: role as (typeof ROLE_OPTIONS)[number],
    });
  };

  const handleRemoveUser = (userId: number, userName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove admin access for "${userName}"? This action cannot be undone.`
    );
    if (confirmed) {
      removeUserMut.mutate({ userId });
    }
  };

  const isSelf = (userId: number) => currentUser?.id === userId;

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
          <Shield className="w-3.5 h-3.5" />
          Owner Access Only
        </span>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : !users || users.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No admin users found.
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
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">
                    Role
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr
                    key={u.id}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {u.name || "Unnamed"}
                        </span>
                        {isSelf(u.id) && (
                          <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-medium">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {u.email}
                    </td>
                    <td className="py-3 px-4">
                      {isSelf(u.id) ? (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[u.role ?? "user"] ?? ROLE_COLORS.user}`}
                        >
                          {u.role ?? "user"}
                        </span>
                      ) : (
                        <div className="relative inline-block">
                          <select
                            value={u.role ?? "user"}
                            onChange={e =>
                              handleRoleChange(u.id, e.target.value)
                            }
                            disabled={updateRoleMut.isPending}
                            className="px-3 py-1.5 border border-border rounded text-sm appearance-none bg-background pr-7 focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            {ROLE_OPTIONS.map(role => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isSelf(u.id) ? (
                        <span className="text-xs text-muted-foreground">
                          --
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            handleRemoveUser(u.id, u.name ?? u.email ?? "user")
                          }
                          disabled={removeUserMut.isPending}
                          className="p-2 rounded hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove user"
                        >
                          {removeUserMut.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {users.map(u => (
              <div
                key={u.id}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">
                        {u.name || "Unnamed"}
                      </p>
                      {isSelf(u.id) && (
                        <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-medium">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {u.email}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${ROLE_COLORS[u.role ?? "user"] ?? ROLE_COLORS.user}`}
                  >
                    {u.role ?? "user"}
                  </span>
                </div>

                {!isSelf(u.id) && (
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
                    <div className="relative flex-1">
                      <select
                        value={u.role ?? "user"}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        disabled={updateRoleMut.isPending}
                        className="w-full px-3 py-1.5 border border-border rounded text-xs appearance-none bg-background pr-7"
                      >
                        {ROLE_OPTIONS.map(role => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                    <button
                      onClick={() =>
                        handleRemoveUser(u.id, u.name ?? u.email ?? "user")
                      }
                      disabled={removeUserMut.isPending}
                      className="p-2 rounded hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                      title="Remove user"
                    >
                      {removeUserMut.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
