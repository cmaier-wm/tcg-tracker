import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe("forgot password form", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows a validation message for an invalid email before submitting", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: "Send Reset Link" }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid email address.");
    expect(toast.error).toHaveBeenCalledWith("Enter a valid email address.");
  });

  it("shows the generic success confirmation after a successful request", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: "If an account exists for that email, a password reset link has been sent."
          }),
          {
            status: 202,
            headers: { "Content-Type": "application/json" }
          }
        )
      )
    );

    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "collector@example.com");
    await user.click(screen.getByRole("button", { name: "Send Reset Link" }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "If an account exists for that email, a password reset link has been sent."
      );
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
