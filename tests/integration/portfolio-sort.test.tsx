import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PortfolioSort } from "@/components/portfolio/portfolio-sort";

const { mockReplace, mockPathname, mockSearchParams } = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  mockPathname: vi.fn(),
  mockSearchParams: vi.fn()
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace
  }),
  usePathname: () => mockPathname(),
  useSearchParams: () => mockSearchParams()
}));

describe("portfolio sort", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockPathname.mockReset();
    mockSearchParams.mockReset();
    mockPathname.mockReturnValue("/portfolio");
    mockSearchParams.mockReturnValue(new URLSearchParams());
  });

  afterEach(() => {
    mockReplace.mockReset();
  });

  it("navigates when a non-default sort is selected", async () => {
    const user = userEvent.setup();

    render(<PortfolioSort selectedSort="price-desc" />);

    await user.selectOptions(screen.getByLabelText("Sort"), "name-asc");

    expect(mockReplace).toHaveBeenCalledWith("/portfolio?sort=name-asc");
  });

  it("removes the sort parameter when switching back to highest value first", async () => {
    const user = userEvent.setup();
    mockSearchParams.mockReturnValue(new URLSearchParams("sort=name-desc"));

    render(<PortfolioSort selectedSort="name-desc" />);

    await user.selectOptions(screen.getByLabelText("Sort"), "price-desc");

    expect(mockReplace).toHaveBeenCalledWith("/portfolio");
  });
});
