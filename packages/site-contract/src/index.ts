/** Runtime values shared by the web app and documented as the site's motion contract. */
export const SMOOTH_SCROLLBAR_OPTIONS = {
  damping: 0.06,
  renderByPixels: false,
  continuousScrolling: false,
  alwaysShowTracks: false,
} as const;

export const HERO_ENTRANCE = {
  fontReadyEvent: "david:fonts-ready",
  settleAfterMs: 1180,
} as const;

export const SCROLL_WAVE = {
  /** Wickret's live title peaks at about four degrees; only the outer shell is transformed. */
  deltaToDegrees: 0.15,
  maxDegrees: 4,
  attack: 1,
  release: 0.78,
  epsilon: 0.01,
} as const;
