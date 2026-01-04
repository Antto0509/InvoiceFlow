import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SortBtn } from "@/components/datatable/SortBtn";

// Mock icon lucide pour éviter soucis SVG
vi.mock("lucide-react", () => ({
  ArrowUpDown: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-sort" {...props} />,
}));

describe("[UI / Components / Datatable] SortBtn", () => {
  it("si col différent du tri courant => dir=asc", () => {
    const onSortChange = vi.fn();

    render(
      <SortBtn
        col={"name" as const}
        sort={{ column: "created_at" as const, dir: "desc" }}
        onSortChange={onSortChange}
      />
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onSortChange).toHaveBeenCalledTimes(1);
    expect(onSortChange).toHaveBeenCalledWith({ column: "name", dir: "asc" });
  });

  it("si même col et dir=asc => toggle vers desc", () => {
    const onSortChange = vi.fn();

    render(
      <SortBtn
        col={"created_at" as const}
        sort={{ column: "created_at" as const, dir: "asc" }}
        onSortChange={onSortChange}
      />
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onSortChange).toHaveBeenCalledWith({ column: "created_at", dir: "desc" });
  });

  it("si même col et dir=desc => toggle vers asc", () => {
    const onSortChange = vi.fn();

    render(
      <SortBtn
        col={"created_at" as const}
        sort={{ column: "created_at" as const, dir: "desc" }}
        onSortChange={onSortChange}
      />
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onSortChange).toHaveBeenCalledWith({ column: "created_at", dir: "asc" });
  });
});
