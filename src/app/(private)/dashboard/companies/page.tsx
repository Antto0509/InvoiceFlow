"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { CompanyDialogs } from "@/features/companies/components/dialogs/CompanyDialogs";
import {
  listCompanies,
  getCompanyWithDetails,
} from "@/data/companies.repository";
import { type Company, type CompanyWithDetails, type CompanyListParams, type CompanyIdentity, type CompanyContactBranding, type CompanyBilling, type CompanyAddress, CompanyBankAccount } from "@/schemas/companies.schema";
import EmptyState from "@/components/EmptyState";
import EmptySkeleton from "@/components/EmptySkeleton";
import CompanyHeaderRow from "@/features/companies/components/CompanyHeaderRow";
import IdentityCard from "@/features/companies/components/IdentityCard";
import { ContactBrandingCard } from "@/features/companies/components/ContactBrandingCard";
import BillingSettingsCard from "@/features/companies/components/BillingSettingsCard";
import AddressesCard from "@/features/companies/components/AddressesCard";
import BankAccountsCard from "@/features/companies/components/BankAccountsCard";

export default function CompaniesPage() {
  const [params, setParams] = React.useState<CompanyListParams>({
    page: 1,
    pageSize: 20,
    search: "",
    sort: { column: "name", dir: "asc" },
  });
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [details, setDetails] = React.useState<Record<string, CompanyWithDetails | undefined>>({});
  const [loading, setLoading] = React.useState(false);

  // Dialogs state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [editCompany, setEditCompany] = React.useState<Company | null>(null);
  const [editIdentityCompany, setEditIdentityCompany] = React.useState<CompanyIdentity | null>(null);
  const [editCompanyContactBranding, setEditCompanyContactBranding] = React.useState<CompanyContactBranding | null>(null);
  const [editCompanyBilling, setEditCompanyBilling] = React.useState<CompanyBilling | null>(null);
  const [editCompanyAddresses, setEditCompanyAddresses] = React.useState<CompanyAddress[] | null>(null);
  const [editCompanyBankAccounts, setEditCompanyBankAccounts] = React.useState<CompanyBankAccount[] | null>(null);
  const [updating, setUpdating] = React.useState(false);
  const [deleteCompany, setDeleteCompany] = React.useState<Company | null>(null);

  // Fetch companies
  React.useEffect(() => {
    let aborted = false;
    const ctrl = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const { rows } = await listCompanies({ ...params, signal: ctrl.signal });
        if (!aborted) {
          setCompanies(rows);
          // select the first tab by default
          if (!activeId && rows.length) setActiveId(rows[0].id ?? null);
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
      ctrl.abort();
    };
  }, [params, activeId]);

  // Fetch details of the active company (addresses + bank accounts)
  React.useEffect(() => {
    let aborted = false;
    const ctrl = new AbortController();

    (async () => {
      if (!activeId) return;
      // Cache: fetch once per company id
      if (details[activeId]) return;

      try {
        const d = await getCompanyWithDetails(activeId);
        if (!aborted) {
          setDetails((prev) => ({ ...prev, [activeId]: d }));
        }
      } catch {
        /* no-op */
      }
    })();

    return () => {
      aborted = true;
      ctrl.abort();
    };
  }, [activeId, details]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Entreprises</h1>
          <p className="text-muted-foreground">Gérez l’identité et les paramètres de vos entreprises.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle entreprise
        </Button>
      </div>

      <Separator />

      {loading && companies.length === 0 ? (
        <EmptySkeleton />
      ) : companies.length === 0 ? (
        <EmptyState onCreate={() => setIsCreateOpen(true)} text="Aucune entreprise pour l’instant. Créez votre première pour commencer." label="Créer une entreprise" />
      ) : (
        <Tabs
          value={activeId ?? undefined}
          onValueChange={(v) => setActiveId(v ?? null)}
          className="w-full"
        >
          <TabsList className="flex overflow-x-auto max-w-full">
            {companies.filter((c) => c.id).map((c) => (
              <TabsTrigger key={c.id!} value={c.id!} className="truncate max-w-[220px]">
                {c.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {companies.filter((c) => c.id).map((c) => (
            <TabsContent key={c.id!} value={c.id!} className="space-y-6">
              <CompanyHeaderRow
                company={c}
                onEdit={() => setEditCompany(c)}
                onDelete={() => setDeleteCompany(c)}
              />

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <IdentityCard company={c} onEdit={() => setEditIdentityCompany(c as CompanyIdentity)} />
                <ContactBrandingCard company={c} onEdit={() => setEditCompanyContactBranding(c as CompanyContactBranding)} />
                <BillingSettingsCard company={c} onEdit={() => setEditCompanyBilling(c as CompanyBilling)} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <AddressesCard details={details[c.id!]} onEdit={() => setEditCompanyAddresses(details[c.id!]?.addresses ?? null)} />
                <BankAccountsCard details={details[c.id!]} onEdit={() => setEditCompanyBankAccounts(details[c.id!]?.bank_accounts ?? null)} />
              </div>

              {c.legal_notes ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Mentions légales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm">{c.legal_notes}</p>
                  </CardContent>
                </Card>
              ) : null}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Modales CRUD */}
      <CompanyDialogs
        mode="create"
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        creating={creating}
        setCreating={setCreating}
        setParams={setParams}
      />

      <CompanyDialogs
        mode="edit"
        editCompany={editCompany}
        setEditCompany={setEditCompany}
        updating={updating}
        setUpdating={setUpdating}
        setParams={setParams}
      />

      <CompanyDialogs
        mode="editIdentity"
        editCompanyIdentity={editIdentityCompany}
        setEditCompanyIdentity={setEditIdentityCompany}
        updating={updating}
        setUpdating={setUpdating}
        setParams={setParams}
      />
      
      <CompanyDialogs
        mode="editContactBranding"
        editCompanyContactBranding={editCompanyContactBranding}
        setEditCompanyContactBranding={setEditCompanyContactBranding}
        updating={updating}
        setUpdating={setUpdating}
        setParams={setParams}
      />
      
      <CompanyDialogs
        mode="editBilling"
        editCompanyBilling={editCompanyBilling}
        setEditCompanyBilling={setEditCompanyBilling}
        updating={updating}
        setUpdating={setUpdating}
        setParams={setParams}
      />

      <CompanyDialogs
        mode="editAddresses"
        company_id={activeId!}
        editCompanyAddresses={editCompanyAddresses}
        setEditCompanyAddresses={setEditCompanyAddresses}
        updating={updating}
        setUpdating={setUpdating}
        setParams={setParams}
      />

      <CompanyDialogs
        mode="editBankAccounts"
        company_id={activeId!}
        editCompanyBankAccounts={editCompanyBankAccounts}
        setEditCompanyBankAccounts={setEditCompanyBankAccounts}
        updating={updating}
        setUpdating={setUpdating}
        setParams={setParams}
      />

      <CompanyDialogs
        mode="delete"
        deleteCompany={deleteCompany}
        setDeleteCompany={setDeleteCompany}
        setParams={setParams}
      />
    </div>
  );
}
