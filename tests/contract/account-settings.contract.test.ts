import { beforeEach, describe, expect, it } from "vitest";
import { GET, PUT } from "@/app/api/settings/account/route";
import { resetDemoStore } from "@/lib/db/demo-store";
import { setTestAuthenticatedUser } from "@/lib/auth/auth-session";

describe("account settings contract", () => {
  beforeEach(() => {
    resetDemoStore();
    setTestAuthenticatedUser(undefined);
  });

  it("returns the documented account settings shape", async () => {
    await PUT(
      new Request("http://localhost/api/settings/account", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          themeMode: "light"
        })
      })
    );

    const response = await GET();
    const payload = await response.json();

    expect(payload).toEqual({
      themeMode: expect.stringMatching(/light|dark/)
    });
  });

  it("returns the documented account settings shape while signed out", async () => {
    setTestAuthenticatedUser(null);

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      themeMode: expect.stringMatching(/light|dark/)
    });
  });
});
