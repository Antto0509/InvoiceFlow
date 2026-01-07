import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EntitySelect } from "@/components/datatable/EntitySelect";

/* ---------------------------------------
   Mocks
---------------------------------------- */

// Debounce -> direct (pas de timer)
vi.mock("@/hooks/useDebouncedValue", () => ({
  useDebouncedValue: (v: string) => v,
}));

// Lucide icons -> remplaçants testables
vi.mock("lucide-react", () => ({
  X: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-x" {...props} />,
  Check: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-check" {...props} />,
  ChevronsUpDown: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-chevrons" {...props} />,
}));

/**
 * Mock Popover shadcn/radix avec contexte + toggle au clic
 * - Popover stocke open/onOpenChange dans un contexte
 * - PopoverTrigger (asChild) clone l’enfant et injecte un onClick qui toggle
 * - PopoverContent rend uniquement si open=true
 */
vi.mock("@/components/ui/popover", async () => {
  const ReactMod = await import("react");

  // ✅ On stocke le context dans globalThis pour éviter les refs top-level
  const KEY = "__vitest_popover_ctx__" as const;

  type PopoverCtxValue = { open: boolean; onOpenChange: (v: boolean) => void };
  type GlobalWithPopoverCtx = typeof globalThis & {
    [K in typeof KEY]?: React.Context<PopoverCtxValue | null>;
  };

  const g = globalThis as GlobalWithPopoverCtx;

  if (!g[KEY]) {
    g[KEY] = ReactMod.createContext<PopoverCtxValue | null>(null);
  }

  const Ctx = g[KEY]!;

  return {
    Popover: ({
      open,
      onOpenChange,
      children,
    }: {
      open: boolean;
      onOpenChange: (v: boolean) => void;
      children: React.ReactNode;
    }) => (
      <Ctx.Provider value={{ open, onOpenChange }}>
        <div data-testid="popover">{children}</div>
      </Ctx.Provider>
    ),

    PopoverTrigger: ({
      asChild,
      children,
    }: {
      asChild?: boolean;
      children: React.ReactElement<{ onClick?: React.MouseEventHandler<HTMLElement> }>;
    }) => {
      const ctx = ReactMod.useContext(Ctx);
      if (!ctx) return <>{children}</>;

      const toggle: React.MouseEventHandler<HTMLElement> = (e) => {
        ctx.onOpenChange(!ctx.open);
        children.props.onClick?.(e);
      };

      return asChild
        ? ReactMod.cloneElement(children, { onClick: toggle })
        : (
          <button type="button" onClick={toggle}>
            {children}
          </button>
        );
    },

    PopoverContent: ({ children }: { children: React.ReactNode }) => {
      const ctx = ReactMod.useContext(Ctx);
      if (!ctx?.open) return null;
      return <div data-testid="popover-content">{children}</div>;
    },
  };
});

/**
 * Mock Command (cmdk/shadcn)
 * - CommandInput: input contrôlé via value/onValueChange
 * - CommandEmpty/Group/List: wrappers
 * - CommandItem: bouton qui appelle onSelect
 */
vi.mock("@/components/ui/command", () => {
  return {
    Command: ({ children }: { children: React.ReactNode }) => <div data-testid="command">{children}</div>,
    CommandInput: ({ value, onValueChange, placeholder }: { value: string; onValueChange: (value: string) => void; placeholder?: string }) => (
      <input
        data-testid="command-input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onValueChange?.((e.target as HTMLInputElement).value)}
      />
    ),
    CommandList: ({ children }: { children: React.ReactNode }) => <div data-testid="command-list">{children}</div>,
    CommandEmpty: ({ children }: { children: React.ReactNode }) => <div data-testid="command-empty">{children}</div>,
    CommandGroup: ({ children }: { children: React.ReactNode }) => <div data-testid="command-group">{children}</div>,
    CommandItem: ({ children, onSelect }: { children: React.ReactNode; onSelect?: (value: string) => void }) => (
      <button type="button" data-testid="command-item" onClick={() => onSelect?.("")}>
        {children}
      </button>
    ),
  };
});

type Item = { id: string; name: string };
const toLabel = (i: Item) => i.name;

describe("[UI / Components / Datatable] EntitySelect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ouvre le popover au clic sur le bouton combobox", async () => {
    const fetch = vi.fn().mockResolvedValue([]);
    render(<EntitySelect<Item> value={undefined} onChange={vi.fn()} toLabel={toLabel} fetch={fetch} />);

    // fermé au départ
    expect(screen.queryByTestId("popover-content")).toBeNull();

    // clic => toggle open
    fireEvent.click(screen.getByRole("combobox"));

    // maintenant ouvert
    expect(screen.getByTestId("popover-content")).toBeInTheDocument();
    expect(screen.getByTestId("command-input")).toBeInTheDocument();
  });

  it("quand on tape, appelle fetch avec search=term (debounce mock direct)", async () => {
    const fetch = vi.fn().mockResolvedValue([]);
    render(
      <EntitySelect<Item>
        value={undefined}
        onChange={vi.fn()}
        toLabel={toLabel}
        fetch={fetch}
        searchPlaceholder="Rechercher…"
      />
    );

    // fetch au mount
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(fetch.mock.calls[0][0].search).toBeUndefined();

    // ouvre le popover
    fireEvent.click(screen.getByRole("combobox"));

    const input = screen.getByTestId("command-input");
    fireEvent.change(input, { target: { value: "ali" } });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(fetch.mock.calls[1][0].search).toBe("ali");
  });

  it("affiche les items après fetch et sélectionne un item (onChange + reset term + close)", async () => {
    const fetch = vi.fn().mockResolvedValue([
      { id: "1", name: "Alice" },
      { id: "2", name: "Bob" },
    ] satisfies Item[]);
    const onChange = vi.fn();

    render(<EntitySelect<Item> value={undefined} onChange={onChange} toLabel={toLabel} fetch={fetch} />);

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    // ouvre
    fireEvent.click(screen.getByRole("combobox"));

    // items visibles
    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(await screen.findByText("Bob")).toBeInTheDocument();

    // tape pour déclencher un fetch avec search="al"
    const input = screen.getByTestId("command-input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "al" } });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(fetch.mock.calls[1][0].search).toBe("al");

    // clique sur le 1er item
    const items = screen.getAllByTestId("command-item");
    fireEvent.click(items[0]);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("1");

    // popover fermé (setOpen(false) dans ton code)
    await waitFor(() => {
      expect(screen.queryByTestId("popover-content")).toBeNull();
    });

    // term reset => refetch avec search undefined (useDebouncedValue mock direct)
    // (on attend un nouvel appel après la sélection)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    expect(fetch.mock.calls[2][0].search).toBeUndefined();
  });

  it("affiche 'Aucun résultat' quand items=[] et loading=false", async () => {
    const fetch = vi.fn().mockResolvedValue([]);

    render(<EntitySelect<Item> value={undefined} onChange={vi.fn()} toLabel={toLabel} fetch={fetch} />);

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getByTestId("command-empty")).toHaveTextContent("Aucun résultat");
  });
});
