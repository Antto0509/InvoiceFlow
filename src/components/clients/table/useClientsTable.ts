"use client";

import * as React from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Client } from "@/schemas/clients";

const SORTABLE = new Set(["name", "email", "company", "created_at"] as const);
type SortKey = "name" | "email" | "company" | "created_at";
type SortDir = "asc" | "desc";

// Colonnes CSV
const CSV_MIN = ["name","email","company","phone","address","notes"] as const;

export function useClientsTable() {
  const supabase = React.useMemo(() => createClient(), []);
  const [loading, setLoading] = React.useState(false);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [total, setTotal] = React.useState(0);

  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("created_at");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editClient, setEditClient] = React.useState<Client | null>(null);
  const [deleteClient, setDeleteClient] = React.useState<Client | null>(null);

  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [isBulkAddOpen, setIsBulkAddOpen] = React.useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = React.useState(false);

  const [confirmSingleEditOpen, setConfirmSingleEditOpen] = React.useState(false);
  const [pendingSingleEditPayload, setPendingSingleEditPayload] = React.useState<Partial<Client> | null>(null);
  const [currentEditingName, setCurrentEditingName] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let q = supabase
      .from("clients")
      .select("*", { count: "exact" })
      .order(sortKey, { ascending: sortDir === "asc", nullsFirst: sortDir === "asc" });

    const term = query.trim();
    if (term) {
      q = q.or(`name.ilike.%${term}%,email.ilike.%${term}%,company.ilike.%${term}%`);
    }

    q = q.range(from, to);
    const { data, error, count } = await q;
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    setClients((data || []) as Client[]);
    setTotal(count ?? 0);
    setLoading(false);
  }, [supabase, page, pageSize, sortKey, sortDir, query]);

  React.useEffect(() => { setPage(1); }, [query, sortKey, sortDir, pageSize]);
  React.useEffect(() => { load(); }, [load, page]);

  const filtered = clients;

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  const allIds = React.useMemo(() => filtered.map((c) => c.id), [filtered]);
  const allSelected = selected.size > 0 && allIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0 && !allSelected && allIds.some((id) => selected.has(id));
  const toggleAll = () => {
    setSelected((prev) => {
      if (prev.size && allSelected) return new Set();
      return new Set(allIds);
    });
  };
  const selectAllRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected;
  }, [someSelected]);

  function toggleSortBy(col: string) {
    if (!SORTABLE.has(col as SortKey)) return;
    if (sortKey === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(col as SortKey); setSortDir("asc"); }
  }

  async function emailExists(email: string, exceptId?: string) {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId || !email) return false;

    let q = supabase.from("clients").select("id", { count: "exact" })
      .eq("user_id", userId)
      .ilike("email", email);

    if (exceptId) q = q.neq("id", exceptId);
    const { count, error } = await q;
    if (error) { toast.error(error.message); return false; }
    return (count ?? 0) > 0;
  }

  async function handleCreate(values: Partial<Client>): Promise<void> {
    if (values.email && (await emailExists(values.email))) {
      toast.warning("Un client avec cet email existe déjà."); return;
    }
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) { toast.error("Authentification requise"); return; }
    const payload = { ...values, user_id: userData.user.id };
    const { error } = await supabase.from("clients").insert(payload);
    if (error) { toast.error(error.message); return; }
    await load();
    setIsCreateOpen(false);
    toast.success(`${values.name ?? "Client"} ajouté.`);
  }

  function requestUpdateConfirm(values: Partial<Client>): void {
    (async () => {
      if (values.email && (await emailExists(values.email, values.id))) {
        toast.warning("Un client avec cet email existe déjà."); return;
      }
      setPendingSingleEditPayload(values);
      setCurrentEditingName(values.name ?? null);
      setConfirmSingleEditOpen(true);
    })();
  }

  function cancelSingleEditConfirm(): void {
    setConfirmSingleEditOpen(false);
    setPendingSingleEditPayload(null);
    setCurrentEditingName(null);
  }

  async function confirmApplySingleEdit(): Promise<void> {
    if (!pendingSingleEditPayload) return;
    const { id, ...rest } = pendingSingleEditPayload;
    const { error } = await supabase
      .from("clients")
      .update({ ...rest, updated_at: new Date().toISOString() })
      .eq("id", id);
    setConfirmSingleEditOpen(false);
    setPendingSingleEditPayload(null);
    if (error) { toast.error(error.message); return; }
    await load();
    setEditClient(null);
    toast.success("Client mis à jour.");
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) return void toast.error(error.message);
    await load();
    setDeleteClient(null);
    toast.success("Client supprimé");
  }

  async function onBulkDeleteConfirmed() {
    const ids = Array.from(selected);
    if (!ids.length) return;
    const { error } = await supabase.from("clients").delete().in("id", ids);
    if (error) return void toast.error(error.message);
    await load();
    setSelected(new Set());
    toast.success("Clients supprimés");
  }

  async function handleBulkEditApply(patch: { company?: string; phone?: string; notes?: string }) {
    const ids = Array.from(selected);
    if (!ids.length) return toast.error("Aucune sélection");

    const clean: Partial<Client> = {};
    if (patch.company) clean.company = patch.company;
    if (patch.phone) clean.phone = patch.phone;
    if (patch.notes) clean.notes = patch.notes;
    if (!Object.keys(clean).length) return toast.error("Aucun champ à mettre à jour");

    clean.updated_at = new Date().toISOString();
    const { error } = await supabase.from("clients").update(clean).in("id", ids);
    if (error) return toast.error(error.message);

    await load();
    setSelected(new Set());
    setIsBulkEditOpen(false);
    toast.success("Édition en lot appliquée");
  }

  async function handleBulkAdd(rows: Array<Partial<Client>>) : Promise<void> {
    if (!rows.length) return void toast.error("Aucune ligne CSV valide");
    // doublons internes
    const emails = rows.map(r => r.email?.toLowerCase()).filter(Boolean) as string[];
    const dup = emails.filter((e, i) => emails.indexOf(e) !== i);
    if (dup.length) { toast.warning("Le CSV contient des emails en doublon."); return; }

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) return void toast.error("Authentification requise");

    const payload = rows.map((r) => ({ ...r, user_id: userData.user.id }));
    const { error } = await supabase.from("clients").insert(payload);
    if (error) return void toast.error(error.message);

    await load();
    setIsBulkAddOpen(false);
    toast.success(`${rows.length} client(s) ajouté(s)`);
  }

  // -------- EXPORTS --------
  function toCSV(rows: Client[], columns: readonly string[]) {
    const escape = (v: unknown) => {
      if (v == null) return "";
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = columns.join(",");
    const body = rows.map(r => columns.map(k => escape((r as Client)[k as keyof Client])).join(",")).join("\n");
    return `${header}\n${body}`;
  }

  function downloadBlob(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  // Export page courante — **format minimal** (round-trip OK)
  function exportCurrentPageCSV() {
    const rows = filtered;
    if (!rows.length) return toast.message("Rien à exporter pour cette page.");
    const csv = toCSV(rows, CSV_MIN);
    downloadBlob(csv, `clients_page_${page}.csv`, "text/csv;charset=utf-8");
  }

  // Export tout — **format minimal** (round-trip OK)
  async function exportAllCSV() {
    const limit = 1000;
    let offset = 0;
    const acc: Client[] = [];
    for (;;) {
      let q = supabase.from("clients").select("*")
        .order(sortKey, { ascending: sortDir === "asc", nullsFirst: sortDir === "asc" })
        .range(offset, offset + limit - 1);

      const term = query.trim();
      if (term) q = q.or(`name.ilike.%${term}%,email.ilike.%${term}%,company.ilike.%${term}%`);

      const { data, error } = await q;
      if (error) { toast.error(error.message); return; }

      const chunk = (data || []) as Client[];
      acc.push(...chunk);
      if (chunk.length < limit) break;
      offset += limit;
    }
    if (!acc.length) return toast.message("Aucun client à exporter.");
    const csv = toCSV(acc, CSV_MIN);
    downloadBlob(csv, `clients_export_${new Date().toISOString().slice(0,10)}.csv`, "text/csv;charset=utf-8");
  }

  return {
    // data
    loading, clients, filtered, total,
    // query/sort/pagination
    query, setQuery, sortKey, sortDir, setSortKey, setSortDir,
    page, pageSize, setPage, setPageSize,
    // dialogs
    isCreateOpen, setIsCreateOpen, editClient, setEditClient, deleteClient, setDeleteClient,
    isBulkAddOpen, setIsBulkAddOpen, isBulkEditOpen, setIsBulkEditOpen,
    // selection
    selected, allSelected, someSelected, toggleAll, toggleOne, selectAllRef,
    // handlers
    handleCreate, requestUpdateConfirm, confirmApplySingleEdit, cancelSingleEditConfirm,
    handleDelete, onBulkDeleteConfirmed, handleBulkEditApply, handleBulkAdd,
    // exports
    exportCurrentPageCSV, exportAllCSV,
    // confirm edit
    confirmSingleEditOpen, currentEditingName,
    // header sort click
    toggleSortBy,
  };
}
