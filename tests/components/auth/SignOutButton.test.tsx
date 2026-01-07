import React, { startTransition } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import SignOutButton from "@/components/auth/SignOutButton";

vi.mock("@/components/auth/signout.action", () => ({
  signOut: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("react", async (importActual) => {
  const React = await importActual<typeof import("react")>();
  return {
    ...React,
    useTransition: vi.fn().mockReturnValue([
      false,
      ((cb: Parameters<typeof startTransition>[0]) => {
        (cb as () => void)();
      }) as typeof startTransition,
    ]),
  };
});

import { signOut } from "@/components/auth/signout.action";

describe("[UI / Components / Auth] SignOutButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rend le bouton avec le label initial et non disabled", async () => {
    // useTransition par défaut (non mocké ici) devrait être pending=false
    render(<SignOutButton />);

    const btn = screen.getByRole("button", { name: "Se déconnecter" });
    expect(btn).toBeInTheDocument();
    expect(btn).not.toBeDisabled();
  });

  it("appelle signOut au clic", async () => {
    render(<SignOutButton />);

    const btn = screen.getByRole("button", { name: "Se déconnecter" });
    fireEvent.click(btn);

    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it("quand pending=true, désactive le bouton et affiche 'Déconnexion...'", async () => {
    const react = await import("react");
    vi.spyOn(react, "useTransition").mockReturnValue([
      true,
      ((cb: Parameters<typeof startTransition>[0]) => {
        (cb as () => void)();
      }) as typeof startTransition,
    ]);

    render(<SignOutButton />);

    const btn = screen.getByRole("button", { name: "Déconnexion..." });
    expect(btn).toBeDisabled();
  });

  it("quand pending=false, bouton activé et label 'Se déconnecter'", async () => {
    const react = await import("react");
    vi.spyOn(react, "useTransition").mockReturnValue([
      false,
      ((cb: Parameters<typeof startTransition>[0]) => {
        (cb as () => void)();
      }) as typeof startTransition,
    ]);

    render(<SignOutButton />);

    const btn = screen.getByRole("button", { name: "Se déconnecter" });
    expect(btn).not.toBeDisabled();
  });
});
