import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormShell } from "@/components/forms/FormShell";

describe("[UI / Components / Forms] FormShell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rend les children", () => {
    render(
      <FormShell onSubmit={vi.fn()}>
        <div>CONTENT</div>
      </FormShell>
    );

    expect(screen.getByText("CONTENT")).toBeInTheDocument();
  });

  it("affiche 'Enregistrer' quand loading=false", () => {
    render(
      <FormShell onSubmit={vi.fn()} loading={false}>
        <div />
      </FormShell>
    );

    const btn = screen.getByRole("button", { name: "Enregistrer" });
    expect(btn).toBeInTheDocument();
    expect(btn).not.toBeDisabled();
  });

  it("affiche 'Enregistrement...' et désactive le bouton quand loading=true", () => {
    render(
      <FormShell onSubmit={vi.fn()} loading>
        <div />
      </FormShell>
    );

    const btn = screen.getByRole("button", { name: "Enregistrement..." });
    expect(btn).toBeDisabled();
  });

  it("au submit: preventDefault est appelé + onSubmit est appelé", () => {
    const onSubmit = vi.fn();

    // spy global sur preventDefault (fiable)
    const preventSpy = vi.spyOn(Event.prototype, "preventDefault");

    render(
      <FormShell onSubmit={onSubmit}>
        <input name="foo" defaultValue="bar" />
      </FormShell>
    );

    const form = screen
      .getByRole("button", { name: "Enregistrer" })
      .closest("form")!;

    fireEvent.submit(form);

    expect(preventSpy).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toBeTruthy();

    preventSpy.mockRestore();
  });


  it("ne crash pas si onSubmit throw en synchrone", () => {
    const onSubmit = vi.fn(() => {
      throw new Error("boom");
    });

    render(
      <FormShell onSubmit={onSubmit}>
        <input name="foo" defaultValue="bar" />
      </FormShell>
    );

    const form = screen.getByRole("button", { name: "Enregistrer" }).closest("form")!;

    // Si ça crash, le test explose. Donc ici: juste submit + expect onSubmit called.
    fireEvent.submit(form);

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
