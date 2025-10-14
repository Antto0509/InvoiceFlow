"use client";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { Toaster } from "sonner";

export default function ClientsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Clients</h1>
        <p className="text-sm text-muted-foreground">Gère tes clients : ajouter, éditer, supprimer.</p>
      </div>
      <ClientsTable />
      <Toaster richColors position="top-right" />
    </div>
  );
}