import { getOptionalEnv } from "@/lib/db/env";

type FetchJsonOptions = {
  path: string;
  query?: Record<string, string | number | undefined>;
};

export class TcgTrackingClient {
  private lastRequestAt = 0;

  constructor(
    private readonly baseUrl = getOptionalEnv("TCGTRACKING_API_BASE_URL") ??
      "https://tcgtracking.com/tcgapi",
    private readonly requestDelayMs =
      Number.parseInt(getOptionalEnv("TCGTRACKING_REQUEST_DELAY_MS") ?? "", 10) || 250
  ) {}

  private async waitForTurn() {
    const elapsed = Date.now() - this.lastRequestAt;
    const waitMs = this.requestDelayMs - elapsed;

    if (waitMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    this.lastRequestAt = Date.now();
  }

  async fetchJson<T>({ path, query }: FetchJsonOptions): Promise<T> {
    await this.waitForTurn();

    const url = new URL(path, this.baseUrl.endsWith("/") ? this.baseUrl : `${this.baseUrl}/`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const response = await fetch(url, {
      headers: {
        Accept: "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`TCG Tracking request failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }
}

export const tcgTrackingClient = new TcgTrackingClient();
