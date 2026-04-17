import { beforeEach, describe, expect, it } from "vitest";
import { GET, PUT } from "@/app/api/settings/account/route";
import { resetDemoStore } from "@/lib/db/demo-store";
import { setTestAuthenticatedUser } from "@/lib/auth/auth-session";

describe("account settings route", () => {
  beforeEach(() => {
    resetDemoStore();
    setTestAuthenticatedUser(undefined);
  });

  it("returns dark theme by default for an authenticated user with no saved settings", async () => {
    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      themeMode: "dark"
    });
  });

  it("accepts signed-out theme updates for local persistence", async () => {
    setTestAuthenticatedUser(null);

    const response = await PUT(
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
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      themeMode: "light"
    });
  });

  it("persists account theme updates independently from Teams settings", async () => {
    const response = await PUT(
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
    const payload = await response.json();
    const currentResponse = await GET();
    const currentPayload = await currentResponse.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      themeMode: "light"
    });
    expect(currentPayload).toEqual({
      themeMode: "light"
    });
  });

});
