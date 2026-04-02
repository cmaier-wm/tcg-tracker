import "@testing-library/jest-dom/vitest";

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

// jsdom does not implement ResizeObserver, but Recharts requires it.
global.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;
