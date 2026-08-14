type ScrollRuntimeBase = {
  container: HTMLElement;
  getScrollY: () => number;
};

export type ScrollRuntimeReadyDetail =
  | (ScrollRuntimeBase & {
      mode: "native";
    })
  | (ScrollRuntimeBase & {
      mode: "virtual";
      subscribe: (listener: (y: number) => void) => () => void;
    });

declare global {
  interface Window {
    __davidScrollRuntimeReady?: ScrollRuntimeReadyDetail;
  }
}

export {};
