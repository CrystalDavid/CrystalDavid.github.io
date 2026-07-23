export type ScrollRuntimeReadyDetail = {
  mode: "native" | "virtual";
  container: HTMLElement;
};

declare global {
  interface Window {
    __davidScrollRuntimeReady?: ScrollRuntimeReadyDetail;
  }
}

export {};
