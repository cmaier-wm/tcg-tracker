import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CatalogFilters } from "@/components/cards/catalog-filters";

const { mockReplace, mockPathname } = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  mockPathname: vi.fn()
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace
  }),
  usePathname: () => mockPathname()
}));

describe("catalog filters", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockPathname.mockReset();
    mockPathname.mockReturnValue("/cards");
  });

  afterEach(() => {
    mockReplace.mockReset();
  });

  it("navigates immediately when the set or sort dropdown changes", async () => {
    const user = userEvent.setup();

    render(
      <CatalogFilters
        query="charizard"
        selectedSet=""
        selectedSort="price-desc"
        categories={[]}
        sets={[
          {
            id: "sv1",
            slug: "scarlet-violet",
            name: "Scarlet & Violet",
            categorySlug: "pokemon"
          }
        ]}
        resetHref="/cards"
      />
    );

    await user.selectOptions(screen.getByLabelText("Set"), "scarlet-violet");
    expect(screen.getByRole("status", { name: "Applying filters" })).toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/cards?q=charizard&set=scarlet-violet&sort=price-desc");

    await user.selectOptions(screen.getByLabelText("Sort"), "name-asc");

    expect(mockReplace).toHaveBeenLastCalledWith(
      "/cards?q=charizard&set=scarlet-violet&sort=name-asc"
    );
  });
});
