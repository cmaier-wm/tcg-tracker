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
    mockSearchParams.mockReturnValue(new URLSearchParams("q=charizard&set=151&sort=name-asc"));
  });

  it("resets visible filter values when browse props change", () => {
    const { rerender } = render(
      <CardsBrowserPage
        query="charizard"
        selectedCategory="pokemon"
        selectedSet="151"
        selectedSort="name-asc"
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
      />
    );

    expect(screen.getByLabelText("Search cards")).toHaveValue("charizard");
    expect(screen.getByLabelText("Set")).toHaveValue("151");
    expect(screen.getByLabelText("Sort")).toHaveValue("name-asc");

    rerender(
      <CardsBrowserPage
        query={undefined}
        selectedCategory="pokemon"
        selectedSet={undefined}
        selectedSort="price-desc"
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
      />
    );

    expect(screen.getByLabelText("Search cards")).toHaveValue("");
    expect(screen.getByLabelText("Set")).toHaveValue("");
    expect(screen.getByLabelText("Sort")).toHaveValue("price-desc");
  });
});
