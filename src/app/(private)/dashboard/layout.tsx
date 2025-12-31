import type { ReactNode } from "react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { Toaster } from "@/components/ui/sonner";
import { RouteLoadingProvider } from "@/components/layout/route-loading";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RouteLoadingProvider>
      <div className="min-h-dvh bg-background">
        {/* Sidebar desktop */}
        <aside className="fixed inset-y-0 left-0 hidden w-60 border-r bg-background md:block">
          <Sidebar />
        </aside>

        {/* Contenu (décalé sur desktop) */}
        <div
          className="flex min-h-dvh flex-col ml-0"
        >
          <Topbar />
          {/* Sur desktop, on décale le contenu */}
          <div className="md:ml-60 flex min-h-dvh flex-col">

            {/* Contenu */}
            <main className="flex-1 p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>

        <Toaster richColors position="top-right" />
      </div>
    </RouteLoadingProvider>
  );
}
