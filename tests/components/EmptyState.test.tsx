import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import EmptyState from "@/components/EmptyState";

describe("EmptyState", () => {
  it("renders text + button label", () => {
    render(<EmptyState onCreate={() => {}} text="Aucun client" label="Créer" />);
    expect(screen.getByText("Aucun client")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /créer/i })).toBeInTheDocument();
  });

  it("calls onCreate when clicking button", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();

    render(<EmptyState onCreate={onCreate} text="Aucun client" label="Créer" />);
    await user.click(screen.getByRole("button", { name: /créer/i }));

    expect(onCreate).toHaveBeenCalledTimes(1);
  });
});
