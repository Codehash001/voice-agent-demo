"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Building2, BarChart3, Users, LogOut, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "./AuthProvider";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  masterOnly?: boolean;
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard size={18} />, label: "Dashboard", href: "/" },
  { icon: <Building2 size={18} />, label: "Businesses", href: "/businesses" },
  { icon: <Users size={18} />, label: "Users", href: "/users", masterOnly: true },
  { icon: <BarChart3 size={18} />, label: "Analytics & Reports", href: "/analytics" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const isMasterAdmin = user?.profile?.role === "master_admin";

  const visibleItems = navItems.filter(
    (item) => !item.masterOnly || isMasterAdmin
  );

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-[#0f172a] text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 pt-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Zap size={16} />
          </div>
          <div>
            <div className="text-base font-semibold">Elion AI</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">
              Admin Hub
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-1">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-[calc(100%-16px)] mx-2 justify-start gap-3 h-10",
                  isActive
                    ? "bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      {user && (
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-semibold">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user.email}</div>
              <div className="text-[10px] text-gray-400 capitalize">
                {user.profile?.role?.replace("_", " ") || "User"}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-9 text-gray-400 hover:text-white hover:bg-white/5"
            onClick={signOut}
          >
            <LogOut size={16} />
            <span className="text-sm">Sign Out</span>
          </Button>
        </div>
      )}
    </aside>
  );
}
