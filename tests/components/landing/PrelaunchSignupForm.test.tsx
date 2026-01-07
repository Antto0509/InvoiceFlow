import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PrelaunchSignupForm } from "@/components/landing/PrelaunchSignupForm";

describe("[UI / Components / Landing] PrelaunchSignupForm", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rend input + bouton avec cta par défaut", () => {
    render(<PrelaunchSignupForm />);

    expect(screen.getByLabelText("Adresse email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Être prévenu du lancement" })
    ).toBeInTheDocument();
  });

  it("email invalide => message error + pas d'appel API", () => {
    render(<PrelaunchSignupForm />);

    fireEvent.change(screen.getByLabelText("Adresse email"), {
      target: { value: "foo" },
    });
    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Email invalide. Mets un vrai mail et on est bien."
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("email valide => loading puis success + reset input + appelle l'API avec email clean", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    render(<PrelaunchSignupForm />);

    const input = screen.getByLabelText("Adresse email") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "  Antoine@Example.COM " } });
    fireEvent.submit(input.closest("form")!);

    // loading immédiat
    expect(
      screen.getByRole("button", { name: "Enregistrement..." })
    ).toBeDisabled();

    // success
    expect(await screen.findByRole("status")).toHaveTextContent(
      "C’est noté. Tu seras prévenu au lancement 🚀"
    );

    // input reset
    expect((screen.getByLabelText("Adresse email") as HTMLInputElement).value).toBe("");

    // API appelée avec email clean + honeypot vide
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/waitlist");
    expect(opts.method).toBe("POST");
    expect(opts.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(opts.body)).toEqual({
      email: "antoine@example.com",
      company: "",
    });
  });

  it("si l'API renvoie 429 => affiche erreur", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => "rate limited",
    });

    render(<PrelaunchSignupForm />);

    const input = screen.getByLabelText("Adresse email") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "test@site.com" } });
    fireEvent.submit(input.closest("form")!);

    // Ton composant met un message générique en catch()
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Oups. Impossible d’enregistrer. Réessaie."
    );
  });

  it("honeypot rempli => affiche success mais n'appelle pas l'API", async () => {
    render(<PrelaunchSignupForm />);

    const input = screen.getByLabelText("Adresse email") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "test@site.com" } });

    // retrouve le honeypot (il existe dans le DOM)
    const hp = screen.getByLabelText("Company") as HTMLInputElement;
    fireEvent.change(hp, { target: { value: "bot filled me" } });

    fireEvent.submit(input.closest("form")!);

    expect(await screen.findByRole("status")).toHaveTextContent(
      "C’est noté. Tu seras prévenu au lancement 🚀"
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("quand on retape après une erreur, ça reset le message", () => {
    render(<PrelaunchSignupForm />);

    const input = screen.getByLabelText("Adresse email") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "nope" } });
    fireEvent.submit(input.closest("form")!);

    expect(screen.getByRole("status")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "nope@" } });

    expect(screen.queryByRole("status")).toBeNull();
  });
});
