import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BrandHomeLink } from "@/components/brand-home-link";

const { mockPush, mockPathname, mockSearchParams } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockPathname: vi.fn(),
  mockSearchParams: vi.fn()
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush
  }),
  usePathname: () => mockPathname(),
  useSearchParams: () => mockSearchParams()
}));

describe("brand home link", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockPathname.mockReset();
    mockSearchParams.mockReset();
  });

  it("clears browse query params when clicked from the catalog", async () => {
    const user = userEvent.setup();

    mockPathname.mockReturnValue("/cards");
    mockSearchParams.mockReturnValue(new URLSearchParams("q=charizard&set=151&sort=name-asc"));

    render(<BrandHomeLink>Pokemon TCG Tracker</BrandHomeLink>);

    await user.click(screen.getByRole("link", { name: "Pokemon TCG Tracker" }));

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("does not force navigation when already on the clean browse route", async () => {
    const user = userEvent.setup();

    mockPathname.mockReturnValue("/");
    mockSearchParams.mockReturnValue(new URLSearchParams());

    render(<BrandHomeLink>Pokemon TCG Tracker</BrandHomeLink>);

    await user.click(screen.getByRole("link", { name: "Pokemon TCG Tracker" }));

    expect(mockPush).not.toHaveBeenCalled();
  });
});
