import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

const { mockPush, mockRefresh } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRefresh: vi.fn()
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh
  })
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe("reset password form", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockRefresh.mockReset();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows the invalid-link recovery state when rendered with an initial error", () => {
    render(
      <ResetPasswordForm
        token="expired-token"
        initialErrorMessage="This password reset link is invalid or has expired. Request a new reset link."
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent("invalid or has expired");
    expect(screen.getByRole("link", { name: "Request New Reset Link" })).toBeInTheDocument();
  });

  it("shows a validation message for a short password before submitting", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<ResetPasswordForm token="reset-token" />);

    await user.type(screen.getByLabelText("New Password"), "short");
    await user.click(screen.getByRole("button", { name: "Update Password" }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Password must contain at least 8 characters."
    );
    expect(toast.error).toHaveBeenCalledWith("Password must contain at least 8 characters.");
  });

  it("redirects to login after a successful reset", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: "Your password has been updated. Sign in with your new password."
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        )
      )
    );

    render(<ResetPasswordForm token="reset-token" />);

    await user.type(screen.getByLabelText("New Password"), "new-password123");
    await user.click(screen.getByRole("button", { name: "Update Password" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
      expect(mockRefresh).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });
  });
});
