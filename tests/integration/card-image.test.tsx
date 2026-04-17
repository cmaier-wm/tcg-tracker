import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CardImage } from "@/components/cards/card-image";

describe("CardImage", () => {
  it("shows the placeholder when the image url is missing", () => {
    render(<CardImage name="Lugia V" imageUrl={null} />);

    expect(screen.getByLabelText("Lugia V image unavailable")).toBeInTheDocument();
    expect(screen.getByText("Image unavailable")).toBeInTheDocument();
  });

  it("falls back to the placeholder when the image request fails", () => {
    render(<CardImage name="Lugia V - 2023 (Gabriel Fernandez)" imageUrl="https://broken.test/lugia.png" />);

    fireEvent.error(screen.getByRole("img", { name: "Lugia V - 2023 (Gabriel Fernandez)" }));

    expect(
      screen.getByLabelText("Lugia V - 2023 (Gabriel Fernandez) image unavailable")
    ).toBeInTheDocument();
    expect(screen.getByText("Image unavailable")).toBeInTheDocument();
  });
});
