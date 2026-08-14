export type VirtualScrollListener = (y: number, deltaY: number) => void;

type ScrollRuntimeBase = {
  container: HTMLElement;
  getScrollY: () => number;
};

export type ScrollRuntimeReadyDetail = ScrollRuntimeBase & ({
  mode: "native";
} | {
  mode: "virtual";
  subscribe: (listener: VirtualScrollListener) => () => void;
});

declare global {
  interface Window {
    __davidScrollRuntimeReady?: ScrollRuntimeReadyDetail;
  }
}

export {};
