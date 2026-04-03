"use client";

import { useEffect } from "react";

export function DevOriginRedirect() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    if (window.location.hostname !== "localhost") {
      return;
    }

    const redirectUrl = new URL(window.location.href);
    redirectUrl.hostname = "127.0.0.1";
    window.location.replace(redirectUrl.toString());
  }, []);

  return null;
}
