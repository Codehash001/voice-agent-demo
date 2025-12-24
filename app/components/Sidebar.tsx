"use client";

import { LayoutDashboard, Building2, FileText, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard size={18} />, label: "Dashboard" },
  { icon: <Building2 size={18} />, label: "Businesses", active: true },
  { icon: <FileText size={18} />, label: "Reports" },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[180px] bg-[#0f172a] text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 pt-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Mic size={16} />
          </div>
          <div>
            <div className="text-base font-semibold">Dentavoice</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">
              Admin Hub
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-1">
        {navItems.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            className={cn(
              "w-[calc(100%-16px)] mx-2 justify-start gap-3 h-10",
              item.active
                ? "bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            {item.icon}
            <span className="text-sm">{item.label}</span>
          </Button>
        ))}
      </nav>

      {/* Subscription */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
          Subscription
        </div>
        <div className="text-sm font-medium mb-2">Enterprise Plan</div>
        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div className="w-[35%] h-full bg-blue-500 rounded-full"></div>
        </div>
        <div className="text-xs text-gray-400 mt-2">8 / 23 Numbers Active</div>
      </div>
    </aside>
  );
}
