import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CardListItem } from "@/lib/tcgtracking/mappers";

const {
  mockGetCardCatalog,
  mockGetCatalogCategories,
  mockGetCatalogSets,
  mockReplace,
  mockPathname
} = vi.hoisted(() => ({
  mockGetCardCatalog: vi.fn(),
  mockGetCatalogCategories: vi.fn(),
  mockGetCatalogSets: vi.fn(),
  mockReplace: vi.fn(),
  mockPathname: vi.fn()
}));

vi.mock("@/lib/tcgtracking/get-card-catalog", () => ({
  getCardCatalog: mockGetCardCatalog
}));

vi.mock("@/lib/tcgtracking/get-categories", () => ({
  getCatalogCategories: mockGetCatalogCategories
}));

vi.mock("@/lib/tcgtracking/get-sets", () => ({
  getCatalogSets: mockGetCatalogSets
}));

vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();

  return {
    ...actual,
    useRouter: () => ({
      replace: mockReplace
    }),
    usePathname: () => mockPathname()
  };
});

import HomePage from "@/app/page";
import CardsPage from "@/app/cards/page";

const mockItems: CardListItem[] = [
  {
    id: "pokemon-2",
    category: "pokemon",
    categoryName: "Pokemon",
    setName: "151",
    name: "Ivysaur",
    collectorNumber: "2/165",
    rarity: "Uncommon",
    currentPrice: 5,
    variationCount: 1
  },
  {
    id: "pokemon-1",
    category: "pokemon",
    categoryName: "Pokemon",
    setName: "151",
    name: "Bulbasaur",
    collectorNumber: "1/165",
    rarity: "Common",
    currentPrice: 10,
    variationCount: 1
  }
];

beforeEach(() => {
  mockGetCardCatalog.mockReset();
  mockGetCatalogCategories.mockReset();
  mockGetCatalogSets.mockReset();
  mockReplace.mockReset();
  mockPathname.mockReset();

  mockGetCardCatalog.mockResolvedValue(mockItems);
  mockPathname.mockReturnValue("/cards");
  mockGetCatalogCategories.mockResolvedValue([
    {
      id: "pokemon",
      slug: "pokemon",
      name: "Pokemon"
    }
  ]);
  mockGetCatalogSets.mockResolvedValue([
    {
      id: "sv-151",
      slug: "151",
      name: "151",
      categorySlug: "pokemon"
    }
  ]);
});

describe("cards browse pages", () => {
  it("renders the catalog heading and sort control", async () => {
    const page = await CardsPage({ searchParams: Promise.resolve({}) });
    render(page);

    expect(screen.getByText("Pokemon Card Browser")).toBeInTheDocument();
    expect(screen.getByLabelText("Search cards")).toBeInTheDocument();
    expect(screen.getByLabelText("Set")).toBeInTheDocument();
    expect(screen.getByLabelText("Sort")).toHaveValue("price-desc");
  });

  it("preserves the selected search, set, and sort values in the browse filters", async () => {
    const page = await CardsPage({
      searchParams: Promise.resolve({
        q: "bulbasaur",
        set: "151",
        sort: "set-desc"
      })
    });
    render(page);

    expect(screen.getByLabelText("Search cards")).toHaveValue("bulbasaur");
    expect(screen.getByLabelText("Set")).toHaveValue("151");
    expect(screen.getByLabelText("Sort")).toHaveValue("set-desc");
    expect(mockGetCardCatalog).toHaveBeenCalledWith(
      expect.objectContaining({
        q: "bulbasaur",
        set: "151",
        sort: "set-desc"
      })
    );
  });

  it("defaults the home page sort to price-desc when no sort is provided", async () => {
    const page = await HomePage({ searchParams: Promise.resolve({}) });
    render(page);

    expect(screen.getByLabelText("Sort")).toHaveValue("price-desc");
    expect(mockGetCardCatalog).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "pokemon",
        sort: "price-desc"
      })
    );
  });

  it("normalizes invalid sort values to the supported default", async () => {
    const page = await CardsPage({
      searchParams: Promise.resolve({
        sort: "bad-value"
      })
    });
    render(page);

    expect(screen.getByLabelText("Sort")).toHaveValue("price-desc");
    expect(mockGetCardCatalog).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: "price-desc"
      })
    );
  });
});
