import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CatalogFilters } from "@/components/cards/catalog-filters";

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

describe("catalog filters", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockPathname.mockReset();
    mockSearchParams.mockReset();
    mockPathname.mockReturnValue("/cards");
    mockSearchParams.mockReturnValue(new URLSearchParams());
  });

  afterEach(() => {
    mockReplace.mockReset();
  });

  it("navigates immediately when the set or sort dropdown changes", async () => {
    const user = userEvent.setup();
    mockSearchParams.mockReturnValue(new URLSearchParams("q=charizard"));

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
    expect(mockReplace).toHaveBeenCalledWith("/cards?q=charizard&set=scarlet-violet&sort=price-desc");
    await user.selectOptions(screen.getByLabelText("Sort"), "name-asc");

    expect(mockReplace).toHaveBeenLastCalledWith(
      "/cards?q=charizard&set=scarlet-violet&sort=name-asc"
    );
  });

  it("clears the visible filters when reset is clicked", async () => {
    const user = userEvent.setup();
    mockSearchParams.mockReturnValue(
      new URLSearchParams("q=charizard&set=scarlet-violet&sort=name-asc")
    );

    render(
      <CatalogFilters
        query="charizard"
        selectedSet="scarlet-violet"
        selectedSort="name-asc"
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

    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByLabelText("Search cards")).toHaveValue("");
    expect(screen.getByLabelText("Set")).toHaveValue("");
    expect(screen.getByLabelText("Sort")).toHaveValue("price-desc");
    expect(mockReplace).toHaveBeenLastCalledWith("/cards");
  });

  it("does not get stuck loading when reset targets the current route", async () => {
    const user = userEvent.setup();

    mockPathname.mockReturnValue("/cards");
    mockSearchParams.mockReturnValue(new URLSearchParams());

    render(
      <CatalogFilters
        query=""
        selectedSet=""
        selectedSort="price-desc"
        categories={[]}
        sets={[]}
        resetHref="/cards"
      />
    );

    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.queryByRole("status", { name: "Applying filters" })).not.toBeInTheDocument();
  });
});
