import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { PrelaunchSignupForm } from "@/components/landing/PrelaunchSignupForm";

describe("[UI / Components / Landing] PrelaunchSignupForm", () => {
  const key = "invoiceflow_waitlist";

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("rend input + bouton avec cta par défaut", () => {
    render(<PrelaunchSignupForm />);

    expect(screen.getByLabelText("Adresse email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Être prévenu du lancement" })
    ).toBeInTheDocument();
  });

  it("email invalide => message error + pas de localStorage", async () => {
    render(<PrelaunchSignupForm />);

    fireEvent.change(screen.getByLabelText("Adresse email"), {
      target: { value: "foo" },
    });

    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Email invalide. Mets un vrai mail et on est bien."
    );
    expect(localStorage.getItem(key)).toBeNull();
  });

  it("email valide => loading puis success + stocke email nettoyé + reset input", async () => {
    render(<PrelaunchSignupForm />);

    const input = screen.getByLabelText("Adresse email") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "  Antoine@Example.COM " } });
    fireEvent.submit(input.closest("form")!);

    // loading immédiat
    const btn = screen.getByRole("button", { name: "Enregistrement..." });
    expect(btn).toBeDisabled();

    // avance le fake request
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      "C’est noté. Tu seras prévenu au lancement 🚀"
    );

    // input reset
    expect((screen.getByLabelText("Adresse email") as HTMLInputElement).value).toBe("");

    // localStorage contient email propre
    const saved = JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
    expect(saved).toEqual(["antoine@example.com"]);
  });

  it("dédoublonne les emails dans localStorage", async () => {
    render(<PrelaunchSignupForm />);

    const form = screen.getByLabelText("Adresse email").closest("form")!;
    const input = screen.getByLabelText("Adresse email") as HTMLInputElement;

    // 1er submit
    fireEvent.change(input, { target: { value: "test@site.com" } });
    fireEvent.submit(form);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // 2e submit même email (diff casse) -> doit pas dupliquer
    fireEvent.change(input, { target: { value: "TEST@site.com" } });
    fireEvent.submit(form);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const saved = JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
    expect(saved).toEqual(["test@site.com"]);
  });

  it("quand on retape après une erreur, ça reset le message et le status", () => {
    render(<PrelaunchSignupForm />);

    const input = screen.getByLabelText("Adresse email") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "nope" } });
    fireEvent.submit(input.closest("form")!);

    expect(screen.getByRole("status")).toBeInTheDocument();

    // retape -> message disparaît (setMessage(null)) + status idle
    fireEvent.change(input, { target: { value: "nope@" } });

    expect(screen.queryByRole("status")).toBeNull();
  });
});
