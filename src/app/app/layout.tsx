import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr] md:grid-cols-[240px_1fr] md:grid-rows-1">
      {/* Sidebar desktop */}
      <aside className="hidden border-r md:block">
        <Sidebar />
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Topbar (avec burger pour mobile) */}
        <Topbar />
        {/* Contenu */}
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
