"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Box,
  Settings,
  Building,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouteLoading } from "@/components/layout/route-loading";
import { VERSION } from "@/lib/constants";

type NavChild = {
  href: string;
  label: string;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children?: NavChild[];
};

const nav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },

  {
    href: "/dashboard/clients",
    label: "Clients",
    icon: Users,
    children: [
      { href: "/dashboard/clients", label: "Tous les clients" },
      { href: "/dashboard/clients/contacts", label: "Contacts" },
      { href: "/dashboard/clients/addresses", label: "Adresses" },
      { href: "/dashboard/clients/tags", label: "Tags & segments" },
    ],
  },

  {
    href: "/dashboard/documents",
    label: "Documents",
    icon: FileText,
    children: [
      { href: "/dashboard/documents/invoices", label: "Factures" },
      { href: "/dashboard/documents/quotes", label: "Devis" },
      { href: "/dashboard/documents/credits", label: "Avoirs" },
      { href: "/dashboard/documents/subscriptions", label: "Abonnements" },
      { href: "/dashboard/documents/proformas", label: "Pro-forma" },
    ],
  },

  {
    href: "/dashboard/items",
    label: "Articles",
    icon: Box,
    children: [
      { href: "/dashboard/items", label: "Catalogue" },
      { href: "/dashboard/items/categories", label: "Catégories" },
      { href: "/dashboard/items/pricelists", label: "Grilles tarifaires" },
    ],
  },

  {
    href: "/dashboard/companies",
    label: "Entreprises",
    icon: Building,
    children: [
      { href: "/dashboard/companies", label: "Identité & légales" },
      { href: "/dashboard/companies/addresses", label: "Adresses" },
      { href: "/dashboard/companies/bank-accounts", label: "Comptes bancaires" },
      { href: "/dashboard/companies/templates", label: "Modèles de documents" },
      { href: "/dashboard/companies/taxes", label: "TVA & fiscalité" },
    ],
  },

  {
    href: "/dashboard/settings",
    label: "Paramètres",
    icon: Settings,
    children: [
      { href: "/dashboard/settings/general", label: "Général" },
      { href: "/dashboard/settings/payments", label: "Moyens de paiement" },
      { href: "/dashboard/settings/reminders", label: "Relances & emails" },
      { href: "/dashboard/settings/users", label: "Utilisateurs & droits" },
      { href: "/dashboard/settings/integrations", label: "Intégrations" },
    ],
  },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [openSection, setOpenSection] = React.useState<string | null>(null);
  const { startLoading } = useRouteLoading();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b px-4 py-3 font-bold flex items-center justify-between">
        <div className="text-lg">InvoiceFlow</div>
        <div className="text-xs text-muted-foreground">{VERSION}</div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const hasChildren = !!item.children?.length;

          const isExact = pathname === item.href;
          const isChildActive = item.children?.some((child) =>
            pathname === child.href || pathname.startsWith(child.href + "/")
          );
          const active =
            item.href === "/dashboard"
              ? isExact
              : isExact || !!isChildActive || pathname.startsWith(item.href + "/");

          const isOpen = hasChildren && (openSection === item.href || !!isChildActive);

          const toggle = () => {
            setOpenSection((prev) => (prev === item.href ? null : item.href));
          };

          return (
            <div key={item.href} className="select-none">
              {/* Ligne principale */}
              {hasChildren ? (
                <button
                  type="button"
                  onClick={toggle}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <motion.span
                    initial={false}
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => {
                    startLoading();
                    onNavigate?.();
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )}

              {/* Sous-pages animées */}
              <AnimatePresence initial={false}>
                {hasChildren && isOpen && (
                  <motion.div
                    key={item.href}
                    initial={{ height: 0, opacity: 0, y: -4 }}
                    animate={{ height: "auto", opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: -4 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="mt-1 overflow-hidden pl-9"
                  >
                    <div className="space-y-1 pb-1">
                      {item.children!.map((child) => {
                        const childActive =
                          pathname === child.href ||
                          pathname.startsWith(child.href + "/");
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => {
                              startLoading();
                              onNavigate?.();
                            }}
                            className={cn(
                              "block rounded-md px-2 py-1 text-sm transition-colors",
                              childActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
