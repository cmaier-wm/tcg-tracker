import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import SettingsPage from "@/app/settings/page";
import { clearStoredThemeMode, readStoredThemeMode } from "@/lib/settings/theme-storage";

afterEach(() => {
  clearStoredThemeMode();
  document.documentElement.dataset.theme = "";
  document.documentElement.style.colorScheme = "";
});

describe("settings page", () => {
  it("renders the settings area and toggles dark mode", async () => {
    const user = userEvent.setup();

    render(<SettingsPage />);

    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dark mode" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Dark mode toggle" })).toBeInTheDocument();

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("light");
      expect(screen.getByText("Bright default palette active.")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("checkbox", { name: "Dark mode toggle" }));

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("dark");
      expect(readStoredThemeMode()).toBe("dark");
      expect(screen.getByText("V2 dark palette active.")).toBeInTheDocument();
    });
  });
});
