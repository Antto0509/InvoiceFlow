import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "@/components/datatable/Pagination";

describe("[UI / Components / Datatable] Pagination", () => {
  it("calcule correctement le nombre de pages et affiche le texte", () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        total={42}
        onPageChange={vi.fn()}
      />
    );

    // ceil(42 / 10) = 5
    expect(
      screen.getByText("42 éléments • page 1/5")
    ).toBeInTheDocument();
  });

  it("force pages=1 quand total=0", () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        total={0}
        onPageChange={vi.fn()}
      />
    );

    expect(
      screen.getByText("0 éléments • page 1/1")
    ).toBeInTheDocument();
  });

  it("désactive 'Précédent' quand page=1", () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        total={50}
        onPageChange={vi.fn()}
      />
    );

    const prev = screen.getByRole("button", { name: "Précédent" });
    expect(prev).toBeDisabled();
  });

  it("désactive 'Suivant' quand page = dernière page", () => {
    render(
      <Pagination
        page={5}
        pageSize={10}
        total={50}
        onPageChange={vi.fn()}
      />
    );

    const next = screen.getByRole("button", { name: "Suivant" });
    expect(next).toBeDisabled();
  });

  it("appelle onPageChange(page - 1) au clic sur 'Précédent'", () => {
    const onPageChange = vi.fn();

    render(
      <Pagination
        page={3}
        pageSize={10}
        total={50}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Précédent" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("appelle onPageChange(page + 1) au clic sur 'Suivant'", () => {
    const onPageChange = vi.fn();

    render(
      <Pagination
        page={3}
        pageSize={10}
        total={50}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("ne déclenche pas onPageChange si bouton disabled", () => {
    const onPageChange = vi.fn();

    render(
      <Pagination
        page={1}
        pageSize={10}
        total={50}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Précédent" }));
    expect(onPageChange).not.toHaveBeenCalled();
  });
});
