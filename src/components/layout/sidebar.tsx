"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/invoices", label: "Factures", icon: FileText },
  { href: "/app/settings", label: "Paramètres", icon: Settings },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="p-4 border-b font-semibold">InvoiceFlow</div>
      <nav className="flex-1 overflow-y-auto p-2">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 text-xs text-muted-foreground">v0.1.0</div>
    </div>
  );
}
