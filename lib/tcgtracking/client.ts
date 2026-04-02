import { getOptionalEnv } from "@/lib/db/env";

type FetchJsonOptions = {
  path: string;
  query?: Record<string, string | number | undefined>;
};

export class TcgTrackingClient {
  constructor(
    private readonly baseUrl = getOptionalEnv("TCGTRACKING_API_BASE_URL") ??
      "https://tcgtracking.com/tcgapi"
  ) {}

  async fetchJson<T>({ path, query }: FetchJsonOptions): Promise<T> {
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
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`TCG Tracking request failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }
}

export const tcgTrackingClient = new TcgTrackingClient();

