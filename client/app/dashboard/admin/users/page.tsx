"use client";

import * as React from "react";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthUser } from "@/hooks/use-auth-user";
import { apiFetch, ApiError } from "@/lib/api";
import { USER_ROLES, type UserRole } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { UserProfile } from "@/types";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuthUser();
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const loadUsers = React.useCallback(async () => {
    try {
      const data = await apiFetch<{ users: UserProfile[] }>("/api/admin/users", {
        auth: true,
      });
      setUsers(data.users || []);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    apiFetch<{ users: UserProfile[] }>("/api/admin/users", { auth: true })
      .then((data) => {
        if (active) setUsers(data.users || []);
      })
      .catch(() => {
        if (active) toast.error("Failed to load users.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setUpdatingId(userId);
    try {
      await apiFetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        auth: true,
        body: { role },
      });
      toast.success(`Role updated to ${role}.`);
      await loadUsers();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not update user role."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Users"
        description="Inspect platform accounts and adjust user roles. Admins cannot modify their own role."
      />

      {loading ? (
        <TableSkeleton rows={5} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Registered users will appear here."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Change Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const isSelf =
                    u.email === currentUser?.email || u._id === currentUser?.id;

                  return (
                    <TableRow key={u._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar name={u.name} image={u.image} />
                          <div>
                            <p className="font-medium text-foreground">
                              {u.name}
                            </p>
                            {isSelf ? (
                              <span className="text-[11px] text-brand font-medium">
                                Current Admin
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={u.role} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(u.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-block w-36 text-left">
                          <Select
                            value={u.role}
                            disabled={isSelf || updatingId === u._id}
                            onValueChange={(val) =>
                              handleRoleChange(u._id, val as UserRole)
                            }
                          >
                            <SelectTrigger
                              aria-label={`Role for ${u.name}`}
                              className="h-9"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {USER_ROLES.map((role) => (
                                <SelectItem key={role} value={role}>
                                  <span className="capitalize">{role}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
