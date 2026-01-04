import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ListPage } from "@/components/ListPage";

describe("[UI / Components] ListPage", () => {
  it("affiche le titre et les children", () => {
    render(
      <ListPage title="Clients">
        <div>TABLE</div>
      </ListPage>
    );

    expect(
      screen.getByRole("heading", { name: "Clients" })
    ).toBeInTheDocument();

    expect(screen.getByText("TABLE")).toBeInTheDocument();
  });

  it("affiche la description si fournie", () => {
    render(
      <ListPage title="Clients" description="Liste des clients">
        <div />
      </ListPage>
    );

    expect(screen.getByText("Liste des clients")).toBeInTheDocument();
  });

  it("n'affiche pas de paragraphe si description absente", () => {
    render(
      <ListPage title="Clients">
        <div />
      </ListPage>
    );

    // On vérifie qu’aucun <p> n’est rendu
    expect(document.querySelector("p")).toBeNull();
  });

  it("affiche les actions quand fournies", () => {
    render(
      <ListPage
        title="Clients"
        actions={<button>Nouvel élément</button>}
      >
        <div />
      </ListPage>
    );

    expect(
      screen.getByRole("button", { name: "Nouvel élément" })
    ).toBeInTheDocument();
  });

  it("affiche la toolbar quand fournie", () => {
    render(
      <ListPage
        title="Clients"
        toolbar={<div>TOOLBAR</div>}
      >
        <div />
      </ListPage>
    );

    expect(screen.getByText("TOOLBAR")).toBeInTheDocument();
  });

  it("merge correctement la className custom", () => {
    const { container } = render(
      <ListPage title="Clients" className="bg-red-500">
        <div />
      </ListPage>
    );

    expect(container.firstChild).toHaveClass("p-6");
    expect(container.firstChild).toHaveClass("bg-red-500");
  });
});
