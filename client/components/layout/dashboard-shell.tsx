"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  ShieldCheck,
  UserCog,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getDashboardPathByRole, useAuthUser } from "@/hooks/use-auth-user";
import type { UserRole } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROLE_NAV_ITEMS: Record<UserRole, NavItem[]> = {
  customer: [
    { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard },
    {
      href: "/dashboard/customer/bookings",
      label: "My Bookings",
      icon: CalendarCheck,
    },
    {
      href: "/dashboard/customer/payments",
      label: "Payment History",
      icon: CreditCard,
    },
    { href: "/dashboard/profile", label: "Profile Settings", icon: UserCog },
  ],
  technician: [
    { href: "/dashboard/technician", label: "Overview", icon: LayoutDashboard },
    {
      href: "/dashboard/technician/add-service",
      label: "Add Service",
      icon: PlusCircle,
    },
    {
      href: "/dashboard/technician/my-services",
      label: "My Services",
      icon: Wrench,
    },
    {
      href: "/dashboard/technician/requests",
      label: "Repair Requests",
      icon: ClipboardList,
    },
    { href: "/dashboard/profile", label: "Profile Settings", icon: UserCog },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Manage Users", icon: Users },
    {
      href: "/dashboard/admin/services",
      label: "Service Approvals",
      icon: CheckCircle2,
    },
    {
      href: "/dashboard/admin/bookings",
      label: "All Bookings",
      icon: CalendarCheck,
    },
    {
      href: "/dashboard/admin/transactions",
      label: "Transactions",
      icon: CreditCard,
    },
    { href: "/dashboard/profile", label: "Profile Settings", icon: UserCog },
  ],
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isPending, signOut } = useAuthUser();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    if (isPending) return;
    if (!user) {
      router.replace(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    const isCustomerRoute = pathname.startsWith("/dashboard/customer");
    const isTechnicianRoute = pathname.startsWith("/dashboard/technician");
    const isAdminRoute = pathname.startsWith("/dashboard/admin");

    if (isCustomerRoute && user.role !== "customer") {
      router.replace(getDashboardPathByRole(user.role));
    } else if (isTechnicianRoute && user.role !== "technician") {
      router.replace(getDashboardPathByRole(user.role));
    } else if (isAdminRoute && user.role !== "admin") {
      router.replace(getDashboardPathByRole(user.role));
    }
  }, [isPending, user, pathname, router]);

  if (isPending || !user) {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-10">
        <DashboardSkeleton />
      </div>
    );
  }

  const navItems = ROLE_NAV_ITEMS[user.role] || ROLE_NAV_ITEMS.customer;

  const isNavActive = (href: string) => {
    if (
      href === "/dashboard/customer" ||
      href === "/dashboard/technician" ||
      href === "/dashboard/admin"
    ) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const renderNavLinks = (isCollapsed: boolean) => (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isNavActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            title={isCollapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-brand/10 text-brand"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              isCollapsed && "justify-center px-2"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!isCollapsed ? <span>{item.label}</span> : null}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden border-r border-border bg-card transition-all duration-200 lg:flex lg:flex-col",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!collapsed ? <BrandLogo /> : <Link href="/" className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-foreground"><Wrench className="h-4 w-4" /></Link>}
          {!collapsed ? (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {collapsed ? (
          <div className="flex justify-center border-b border-border py-2">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {renderNavLinks(collapsed)}

        <div className="border-t border-border p-3 space-y-1">
          <Link
            href="/"
            title={collapsed ? "Back to Home" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground",
              collapsed && "justify-center px-2"
            )}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            {!collapsed ? <span>Back to Home</span> : null}
          </Link>
          <button
            type="button"
            onClick={signOut}
            title={collapsed ? "Sign Out" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 cursor-pointer",
              collapsed && "justify-center px-2"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed ? <span>Sign Out</span> : null}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 flex w-72 max-w-[85vw] flex-col border-r border-border bg-card shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <BrandLogo />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close sidebar"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderNavLinks(false)}
            <div className="border-t border-border p-3 space-y-1">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Main Content Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
              <ShieldCheck className="h-4 w-4 text-brand" />
              <span className="capitalize font-medium text-foreground">
                {user.role} Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/">Back to Home</Link>
            </Button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Open profile menu"
                  className="flex items-center gap-2.5 rounded-full border border-border bg-background py-1 pl-1 pr-3 transition-colors hover:bg-secondary cursor-pointer"
                >
                  <UserAvatar
                    name={user.name}
                    image={user.image}
                    className="h-7 w-7"
                  />
                  <span className="hidden max-w-[130px] truncate text-sm font-medium sm:inline">
                    {user.name}
                  </span>
                  <StatusBadge status={user.role} className="text-[10px] px-2 py-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getDashboardPathByRole(user.role)}>
                    <LayoutDashboard className="h-4 w-4 text-brand" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <UserCog className="h-4 w-4 text-muted-foreground" />
                    <span>Update Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                    <span>Back to Home</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={signOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
