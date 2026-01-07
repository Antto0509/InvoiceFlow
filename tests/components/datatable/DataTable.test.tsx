import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/datatable/DataTable";

type Row = { id: string; name: string };

const columns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: "name",
    header: "Nom",
    cell: ({ row }) => row.original.name,
  },
];

const data: Row[] = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
];

describe("[UI / Components / Datatable] DataTable", () => {
  it("rend le header et les cellules quand data est non vide", () => {
    render(<DataTable<Row> columns={columns} data={data} />);

    // Header
    expect(screen.getByText("Nom")).toBeInTheDocument();

    // Cells
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("affiche 'Chargement…' quand isLoading=true", () => {
    render(<DataTable<Row> columns={columns} data={data} isLoading />);

    expect(screen.getByText("Chargement…")).toBeInTheDocument();
    expect(screen.queryByText("Aucune donnée")).not.toBeInTheDocument();
  });

  it("affiche 'Aucune donnée' quand data est vide et pas loading", () => {
    render(<DataTable<Row> columns={columns} data={[]} />);

    expect(screen.getByText("Aucune donnée")).toBeInTheDocument();
    expect(screen.queryByText("Chargement…")).not.toBeInTheDocument();
  });

  it("rend toolbar et footer quand fournis", () => {
    render(
      <DataTable<Row>
        columns={columns}
        data={data}
        toolbar={<div>TOOLBAR</div>}
        footer={<div>FOOTER</div>}
      />
    );

    expect(screen.getByText("TOOLBAR")).toBeInTheDocument();
    expect(screen.getByText("FOOTER")).toBeInTheDocument();
  });

  it("appelle onRowClick avec l'original de la row au clic", () => {
    const onRowClick = vi.fn();

    render(<DataTable<Row> columns={columns} data={data} onRowClick={onRowClick} />);

    // On clique sur une ligne en ciblant une cellule, puis on remonte à la row
    const cell = screen.getByText("Alice");
    const row = cell.closest("tr");
    expect(row).toBeTruthy();

    fireEvent.click(row!);

    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith({ id: "1", name: "Alice" });
  });

  it("ajoute 'cursor-pointer' sur les rows si onRowClick est fourni", () => {
    const onRowClick = vi.fn();

    render(<DataTable<Row> columns={columns} data={data} onRowClick={onRowClick} />);

    const cell = screen.getByText("Alice");
    const row = cell.closest("tr")!;
    expect(row.className).toContain("cursor-pointer");
  });

  it("n'ajoute pas 'cursor-pointer' si onRowClick n'est pas fourni", () => {
    render(<DataTable<Row> columns={columns} data={data} />);

    const cell = screen.getByText("Alice");
    const row = cell.closest("tr")!;
    expect(row.className).not.toContain("cursor-pointer");
  });

  it("met colSpan = columns.length sur les rows 'Chargement…' et 'Aucune donnée'", () => {
    const { rerender } = render(<DataTable<Row> columns={columns} data={data} isLoading />);

    // Loading
    const loadingCell = screen.getByText("Chargement…").closest("td")!;
    expect(loadingCell).toHaveAttribute("colspan", String(columns.length));

    // Empty
    rerender(<DataTable<Row> columns={columns} data={[]} />);
    const emptyCell = screen.getByText("Aucune donnée").closest("td")!;
    expect(emptyCell).toHaveAttribute("colspan", String(columns.length));
  });
});
