import { beforeEach, describe, expect, it } from "vitest";
import { GET, PUT } from "@/app/api/settings/account/route";
import { resetDemoStore } from "@/lib/db/demo-store";

describe("account settings contract", () => {
  beforeEach(() => {
    resetDemoStore();
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
});
