import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SettingsPage from "@/app/settings/page";

describe("settings page contract", () => {
  it("exposes the settings surface and dark mode toggle", () => {
    render(<SettingsPage />);

    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dark mode" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Dark mode toggle" })).toBeInTheDocument();
  });
});
