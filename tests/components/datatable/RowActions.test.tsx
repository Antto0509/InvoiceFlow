import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { RowActions } from "@/components/datatable/RowActions";

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler;
  asChild?: boolean;
}

/**
 * Mock du DropdownMenu shadcn pour éviter Radix/portals.
 * On rend juste des div et on garde le contenu visible.
 */
vi.mock("@/components/ui/dropdown-menu", () => {
  return {
    DropdownMenu: ({ children }: DropdownMenuProps) => <div data-testid="dropdown">{children}</div>,
    DropdownMenuTrigger: ({ children }: DropdownMenuProps) => <div data-testid="trigger">{children}</div>,
    DropdownMenuContent: ({ children, ...props }: DropdownMenuContentProps) => (
      <div data-testid="content" {...props}>
        {children}
      </div>
    ),
    DropdownMenuItem: ({ children, onClick, asChild }: DropdownMenuItemProps) =>
      asChild ? (
        <div data-testid="item-aschild" onClick={onClick}>
          {children}
        </div>
      ) : (
        <button type="button" data-testid="item" onClick={onClick}>
          {children}
        </button>
      ),
    DropdownMenuSeparator: () => <div data-testid="separator" />,
  };
});

type Item = { id: string; name: string };
const item: Item = { id: "1", name: "Alice" };

describe("[UI / Components / Datatable] RowActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche les labels par défaut", () => {
    render(<RowActions item={item} onEdit={vi.fn()} onDelete={vi.fn()} alwaysVisible />);

    expect(screen.getByRole("button", { name: "Éditer" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Supprimer" })).toBeInTheDocument();
  });

  it("utilise les labels custom (et le label du menu)", () => {
    render(
      <RowActions
        item={item}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        labels={{ edit: "Modifier", delete: "Retirer", menu: "Menu actions" }}
      />
    );

    // desktop est hidden sans alwaysVisible, donc on check surtout le menu aria-label
    expect(screen.getByLabelText("Menu actions")).toBeInTheDocument();
  });

  it("quand alwaysVisible=true, affiche les boutons et déclenche onEdit/onDelete", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<RowActions item={item} onEdit={onEdit} onDelete={onDelete} alwaysVisible />);

    fireEvent.click(screen.getByRole("button", { name: "Éditer" }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(item);

    fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(item);
  });

  it("stopPropagation est appelé sur les boutons edit/delete (desktop)", () => {
    const onEdit = vi.fn();
    const stopSpy = vi.spyOn(Event.prototype, "stopPropagation");

    render(<RowActions item={item} onEdit={onEdit} onDelete={vi.fn()} alwaysVisible />);

    fireEvent.click(screen.getByRole("button", { name: "Éditer" }));

    expect(stopSpy).toHaveBeenCalled();
    expect(onEdit).toHaveBeenCalledWith(item);

    stopSpy.mockRestore();
  });

  it("actions custom desktop: onClick reçoit item", () => {
    const extra = vi.fn();

    render(
      <RowActions
        item={item}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        alwaysVisible
        actions={[{ label: "Télécharger", onClick: extra }]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Télécharger" }));
    expect(extra).toHaveBeenCalledTimes(1);
    expect(extra).toHaveBeenCalledWith(item);
  });

  it("actions custom desktop: href rend un lien + stopPropagation au click", () => {
    const stopSpy = vi.spyOn(Event.prototype, "stopPropagation");

    render(
      <RowActions
        item={item}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        alwaysVisible
        actions={[{ label: "Voir", href: "/doc/1" }]}
      />
    );

    const link = screen.getByRole("link", { name: "Voir" });
    expect(link).toHaveAttribute("href", "/doc/1");

    fireEvent.click(link);
    expect(stopSpy).toHaveBeenCalled();

    stopSpy.mockRestore();
  });


  it("mode mobile (alwaysVisible=false): bouton kebab présent + items edit/delete appellent callbacks", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<RowActions item={item} onEdit={onEdit} onDelete={onDelete} />);

    // Bouton kebab (aria-label)
    expect(screen.getByLabelText("Actions")).toBeInTheDocument();

    // Scope dans le dropdown content
    const menu = screen.getByTestId("content");

    fireEvent.click(within(menu).getByText("Éditer"));
    expect(onEdit).toHaveBeenCalledWith(item);

    fireEvent.click(within(menu).getByText("Supprimer"));
    expect(onDelete).toHaveBeenCalledWith(item);
  });


  it("separatorBefore rend un séparateur dans le menu", () => {
    render(
      <RowActions
        item={item}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        actions={[
          { label: "A", onClick: vi.fn() },
          { label: "B", onClick: vi.fn(), separatorBefore: true },
        ]}
      />
    );

    expect(screen.getAllByTestId("separator").length).toBeGreaterThanOrEqual(1);
  });
});
