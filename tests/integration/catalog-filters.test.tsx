import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CatalogFilters } from "@/components/cards/catalog-filters";

const requestSubmit = vi.fn();

describe("catalog filters", () => {
  afterEach(() => {
    requestSubmit.mockReset();
  });

  it("submits immediately when the set or sort dropdown changes", async () => {
    const user = userEvent.setup();

    const requestSubmitDescriptor = Object.getOwnPropertyDescriptor(
      HTMLFormElement.prototype,
      "requestSubmit"
    );

    Object.defineProperty(HTMLFormElement.prototype, "requestSubmit", {
      configurable: true,
      value: requestSubmit
    });

    try {
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
      await user.selectOptions(screen.getByLabelText("Sort"), "name-asc");

      expect(requestSubmit).toHaveBeenCalledTimes(2);
    } finally {
      if (requestSubmitDescriptor) {
        Object.defineProperty(HTMLFormElement.prototype, "requestSubmit", requestSubmitDescriptor);
      } else {
        Reflect.deleteProperty(HTMLFormElement.prototype, "requestSubmit");
      }
    }
  });
});
