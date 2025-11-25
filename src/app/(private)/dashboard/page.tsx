"use client";

import * as React from "react";
import Link from "next/link";

import { ListPage } from "@/components/ListPage";
import { Button } from "@/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/ui/card";
import { Plus, FileText, CheckCircle2, AlertCircle } from "lucide-react";

import { useDataTable } from "@/hooks/useDataTable";

import {
  listDocuments,
  DocumentCreateDialog,
  type DocumentListRow,
  type DocumentListParams,
} from "@/features/documents";
import { DOC_STATUS_BY_KIND } from "@/lib/utils";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/ui/chart";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";

const DASHBOARD_PAGE_SIZE = 200;

// Config shadcn pour les couleurs / labels
const revenueChartConfig = {
  revenue: {
    label: "CA encaissé",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const statusChartConfig = {
  amount: {
    label: "Montant",
  },
  draft: {
    label: "Brouillon",
    color: "hsl(var(--chart-3))",
  },
  sent: {
    label: "Envoyée",
    color: "hsl(var(--chart-2))",
  },
  paid: {
    label: "Payée",
    color: "hsl(var(--chart-1))",
  },
  overdue: {
    label: "En retard",
    color: "hsl(var(--chart-4))",
  },
  void: {
    label: "Annulée",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

function formatMonthKey(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "Inconnu";
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

function formatMonthLabel(key: string) {
  const [year, month] = key.split("-");
  return `${month}/${year.slice(-2)}`;
}

export default function DashboardHome(): React.ReactElement {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);

  const kind: DocumentListParams["kind"] = "invoice";

  const { data, total, loading, setParams } =
    useDataTable<DocumentListRow, DocumentListParams>(
      async (p) => {
        const res = await listDocuments({
          page: p.page,
          pageSize: p.pageSize,
          search: p.search,
          status: p.status,
          sort: p.sort,
          kind: p.kind,
        });
        return { rows: res.rows, total: res.total };
      },
      {
        page: 1,
        pageSize: DASHBOARD_PAGE_SIZE,
        search: "",
        status: "all",
        sort: { column: "issue_date", dir: "desc" },
        kind,
      }
    );

  const invoices = React.useMemo(() => data ?? [], [data]);
  const hasData = invoices.length > 0;
  const currency = invoices[0]?.currency_code ?? "EUR";

  // KPIs
  const totalPaid = invoices
    .filter((i) => i.status === "paid" && i.total != null)
    .reduce((sum, i) => sum + (i.total ?? 0), 0);

  const totalOverdue = invoices
    .filter((i) => i.status === "overdue" && i.total != null)
    .reduce((sum, i) => sum + (i.total ?? 0), 0);

  // CA par mois (paid)
  const revenueByMonth = React.useMemo(() => {
    const map = new Map<string, number>();

    for (const inv of invoices) {
      if (inv.status !== "paid" || inv.total == null) continue;
      if (!inv.issue_date) continue;

      const key = formatMonthKey(inv.issue_date);
      map.set(key, (map.get(key) ?? 0) + inv.total);
    }

    const entries = Array.from(map.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    const limited = entries.slice(-6);

    return limited.map(([key, value]) => ({
      monthKey: key,
      month: formatMonthLabel(key),
      revenue: value,
    }));
  }, [invoices]);

  // Répartition par statut
  const statusBreakdown = React.useMemo(() => {
    const map = new Map<string, number>();

    for (const inv of invoices) {
      if (inv.total == null) continue;
      const key = inv.status ?? "unknown";
      map.set(key, (map.get(key) ?? 0) + inv.total);
    }

    return Array.from(map.entries()).map(([status, amount]) => ({
      status,
      label:
        (DOC_STATUS_BY_KIND["invoice"] as Record<string, string>)[
          status
        ] ?? status,
      amount,
    }));
  }, [invoices]);

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">Chargement...</div>
    );
  }

  return (
    <ListPage
      title="Tableau de bord"
      description="Une vue claire sur ta facturation : encaissements, retards, tendances."
      actions={
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Nouvelle facture
        </Button>
      }
    >
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Factures
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">
              Total créées (tous statuts)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Encaissements
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPaid.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              {currency}
            </div>
            <p className="text-xs text-muted-foreground">
              Total des factures payées (données chargées)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              En retard
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalOverdue.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              {currency}
            </div>
            <p className="text-xs text-muted-foreground">
              Montant des factures en retard
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* CA encaissé par mois */}
        <Card className="h-[320px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              CA encaissé par mois
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Somme des factures payées par mois.
            </p>
          </CardHeader>
          <CardContent className="h-full">
            {!hasData || revenueByMonth.length === 0 ? (
              <div className="flex h-56 items-center justify-center text-xs text-muted-foreground">
                Pas encore assez de données pour afficher le graphique.
              </div>
            ) : (
              <ChartContainer
                config={revenueChartConfig}
                className="h-56 w-full"
              >
                <AreaChart data={revenueByMonth}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickMargin={8}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickMargin={8}
                    tick={{ fontSize: 11 }}
                    width={70}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(value) =>
                          `${(value as number).toLocaleString("fr-FR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })} ${currency}`
                        }
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    fill="var(--color-revenue)"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Répartition par statut */}
        <Card className="h-[320px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Répartition par statut
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Montant total par statut de facture.
            </p>
          </CardHeader>
          <CardContent className="h-full">
            {!hasData || statusBreakdown.length === 0 ? (
              <div className="flex h-56 items-center justify-center text-xs text-muted-foreground">
                Pas encore assez de données pour afficher le graphique.
              </div>
            ) : (
              <ChartContainer
                config={statusChartConfig}
                className="h-56 w-full"
              >
                <BarChart data={statusBreakdown}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickMargin={8}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickMargin={8}
                    tick={{ fontSize: 11 }}
                    width={70}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(value) =>
                          `${(value as number).toLocaleString("fr-FR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })} ${currency}`
                        }
                      />
                    }
                  />
                  <Bar
                    dataKey="amount"
                    radius={[4, 4, 0, 0]}
                    // la couleur vient de chartConfig via CSS vars
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <DocumentCreateDialog
        kind="invoice"
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        creating={creating}
        setCreating={setCreating}
        setParams={(
          p: DocumentListParams | ((prev: DocumentListParams) => DocumentListParams)
        ) => setParams(p)}
      />

      <div className="mt-6 text-xs text-muted-foreground">
        Besoin de voir la liste des factures ?{" "}
        <Button variant="link" size="sm" className="px-0 text-xs" asChild>
          <Link href="/dashboard/documents/invoices">Aller aux factures</Link>
        </Button>
      </div>
    </ListPage>
  );
}
