import "@testing-library/jest-dom";

if (!globalThis.ResizeObserver) {
  const observed = new Set<Element>();
  class ResizeObserverMock {
    callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    observe(target: Element, options?: ResizeObserverOptions): void {
      observed.add(target);
      void options;
    }
    unobserve(target: Element): void {
      observed.delete(target);
    }
    disconnect(): void {
      observed.clear();
    }
  }
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
}
