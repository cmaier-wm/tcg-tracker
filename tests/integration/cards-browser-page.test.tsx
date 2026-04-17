import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CardsBrowserPage } from "@/components/cards/cards-browser-page";

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

describe("cards browser page", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockPathname.mockReset();
    mockSearchParams.mockReset();
    mockPathname.mockReturnValue("/");
    mockSearchParams.mockReturnValue(
      new URLSearchParams("q=charizard&set=151&sort=name-asc&productType=sealed-product")
    );
  });

  it("resets visible filter values when browse props change", () => {
    const { rerender } = render(
      <CardsBrowserPage
        query="charizard"
        selectedCategory="pokemon"
        selectedSet="151"
        selectedSort="name-asc"
        selectedProductType="sealed-product"
        items={[]}
        categories={[]}
        sets={[
          {
            id: "sv-151",
            slug: "151",
            name: "151",
            categorySlug: "pokemon"
          }
        ]}
        resetHref="/"
        showProductTypeFilter
      />
    );

    expect(screen.getByLabelText("Search cards")).toHaveValue("charizard");
    expect(screen.getByLabelText("Set")).toHaveValue("151");
    expect(screen.getByLabelText("Sort")).toHaveValue("name-asc");
    expect(screen.getByLabelText("Type")).toHaveValue("sealed-product");

    rerender(
      <CardsBrowserPage
        query={undefined}
        selectedCategory="pokemon"
        selectedSet={undefined}
        selectedSort="price-desc"
        selectedProductType="card"
        items={[]}
        categories={[]}
        sets={[
          {
            id: "sv-151",
            slug: "151",
            name: "151",
            categorySlug: "pokemon"
          }
        ]}
        resetHref="/"
        showProductTypeFilter
      />
    );

    expect(screen.getByLabelText("Search cards")).toHaveValue("");
    expect(screen.getByLabelText("Set")).toHaveValue("");
    expect(screen.getByLabelText("Sort")).toHaveValue("price-desc");
    expect(screen.getByLabelText("Type")).toHaveValue("card");
  });

  it("renders sealed-product rows without card-detail links", () => {
    render(
      <CardsBrowserPage
        query={undefined}
        selectedCategory="pokemon"
        selectedSet={undefined}
        selectedSort="price-desc"
        selectedProductType="sealed-product"
        items={[
          {
            id: "sealed-1",
            productType: "sealed-product",
            category: "pokemon",
            categoryName: "Pokemon",
            setName: "Scarlet & Violet",
            name: "Scarlet & Violet Booster Box",
            currentPrice: 119.99,
            variationCount: 1
          }
        ]}
        categories={[]}
        sets={[]}
        resetHref="/"
        showProductTypeFilter
      />
    );

    expect(screen.getAllByText("Sealed Product").length).toBeGreaterThan(1);
    expect(
      screen.queryByRole("link", {
        name: /Scarlet & Violet Booster Box/i
      })
    ).not.toBeInTheDocument();
  });
});
