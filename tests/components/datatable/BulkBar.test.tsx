import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BulkBar } from "@/components/datatable/BulkBar";

interface AlertDialogProps {
  children: React.ReactNode;
}

interface AlertDialogActionProps extends AlertDialogProps {
  onClick?: () => void;
}

/**
 * Mock AlertDialog shadcn pour éviter Radix/portals.
 * On rend le contenu tel quel pour test de la logique.
 */
vi.mock("@/components/ui/alert-dialog", () => {
  return {
    AlertDialog: ({ children }: AlertDialogProps) => <div data-testid="alert">{children}</div>,
    AlertDialogTrigger: ({ children }: AlertDialogProps) => <div data-testid="trigger">{children}</div>,
    AlertDialogContent: ({ children }: AlertDialogProps) => <div data-testid="content">{children}</div>,
    AlertDialogHeader: ({ children }: AlertDialogProps) => <div>{children}</div>,
    AlertDialogTitle: ({ children }: AlertDialogProps) => <h2>{children}</h2>,
    AlertDialogDescription: ({ children }: AlertDialogProps) => <p>{children}</p>,
    AlertDialogFooter: ({ children }: AlertDialogProps) => <div>{children}</div>,
    AlertDialogCancel: ({ children }: AlertDialogProps) => (
      <button type="button">{children}</button>
    ),
    AlertDialogAction: ({ children, onClick }: AlertDialogActionProps) => (
      <button type="button" onClick={onClick}>
        {children}
      </button>
    ),
  };
});

describe("[UI / Components / Datatable] BulkBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche '1 sélectionné' (singulier)", () => {
    render(
      <BulkBar count={1} onBulkDelete={vi.fn()} onOpenBulkEdit={vi.fn()} />
    );

    expect(screen.getByText("1 sélectionné")).toBeInTheDocument();
  });

  it("affiche '2 sélectionnés' (pluriel)", () => {
    render(
      <BulkBar count={2} onBulkDelete={vi.fn()} onOpenBulkEdit={vi.fn()} />
    );

    expect(screen.getByText("2 sélectionnés")).toBeInTheDocument();
  });

  it("génère le titre par défaut avec entityLabel au pluriel", () => {
    render(
      <BulkBar
        count={2}
        entityLabel="client"
        onBulkDelete={vi.fn()}
        onOpenBulkEdit={vi.fn()}
      />
    );

    // "Supprimer les clients sélectionnés ?"
    expect(
      screen.getByRole("heading", { name: /Supprimer les clients sélectionnés \?/i })
    ).toBeInTheDocument();
  });

  it("clic sur 'Éditer en lot' appelle onOpenBulkEdit", () => {
    const onOpenBulkEdit = vi.fn();

    render(
      <BulkBar
        count={3}
        onBulkDelete={vi.fn()}
        onOpenBulkEdit={onOpenBulkEdit}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Éditer en lot" }));
    expect(onOpenBulkEdit).toHaveBeenCalledTimes(1);
  });

  it("clic sur 'Confirmer' appelle onBulkDelete", () => {
    const onBulkDelete = vi.fn();

    render(
      <BulkBar
        count={3}
        onBulkDelete={onBulkDelete}
        onOpenBulkEdit={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Confirmer" }));
    expect(onBulkDelete).toHaveBeenCalledTimes(1);
  });

  it("disabled=true désactive les boutons et empêche les callbacks", () => {
    const onOpenBulkEdit = vi.fn();

    render(
      <BulkBar
        count={3}
        disabled
        onBulkDelete={vi.fn()}
        onOpenBulkEdit={onOpenBulkEdit}
      />
    );

    expect(screen.getByRole("button", { name: "Supprimer" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Éditer en lot" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Éditer en lot" }));
    expect(onOpenBulkEdit).not.toHaveBeenCalled();
  });

  it("utilise confirmTitle et confirmDescription si fournis", () => {
    render(
      <BulkBar
        count={5}
        onBulkDelete={vi.fn()}
        onOpenBulkEdit={vi.fn()}
        confirmTitle="Custom title"
        confirmDescription="Custom description"
      />
    );

    expect(screen.getByRole("heading", { name: "Custom title" })).toBeInTheDocument();
    expect(screen.getByText("Custom description")).toBeInTheDocument();
  });
});
