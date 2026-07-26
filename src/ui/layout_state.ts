export type ActivitySection = "blocks" | "settings";

export interface IdeLayoutState {
  activeActivity: ActivitySection;
  sidebarVisible: boolean;
  sidebarWidth: number;
  codeVisible: boolean;
  codeWidth: number;
  bottomVisible: boolean;
  bottomHeight: number;
}

export const IDE_LAYOUT_STORAGE_KEY = "visual-sml.layout.v3";

export const SIDEBAR_WIDTH_RANGE = { min: 220, max: 380 } as const;
export const CODE_WIDTH_RANGE = { min: 320, max: 720 } as const;
export const BOTTOM_HEIGHT_RANGE = { min: 120, max: 420 } as const;

export const DEFAULT_IDE_LAYOUT_STATE: IdeLayoutState = {
  activeActivity: "blocks",
  sidebarVisible: true,
  sidebarWidth: 272,
  codeVisible: true,
  codeWidth: 430,
  bottomVisible: false,
  bottomHeight: 180,
};

const clamp = (value: unknown, minimum: number, maximum: number, fallback: number) => {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.min(maximum, Math.max(minimum, Math.round(number)))
    : fallback;
};

const oneOf = <T extends string>(value: unknown, values: readonly T[], fallback: T): T =>
  values.includes(value as T) ? value as T : fallback;

const bool = (value: unknown, fallback: boolean) =>
  typeof value === "boolean" ? value : fallback;

/** Convert untrusted persisted JSON into a complete, bounded layout state. */
export function normalizeIdeLayoutState(candidate: unknown): IdeLayoutState {
  const value = candidate && typeof candidate === "object" && !Array.isArray(candidate)
    ? candidate as Partial<IdeLayoutState>
    : {};

  return {
    activeActivity: oneOf(value.activeActivity, ["blocks", "settings"], "blocks"),
    sidebarVisible: bool(value.sidebarVisible, DEFAULT_IDE_LAYOUT_STATE.sidebarVisible),
    sidebarWidth: clamp(
      value.sidebarWidth,
      SIDEBAR_WIDTH_RANGE.min,
      SIDEBAR_WIDTH_RANGE.max,
      DEFAULT_IDE_LAYOUT_STATE.sidebarWidth,
    ),
    codeVisible: bool(value.codeVisible, DEFAULT_IDE_LAYOUT_STATE.codeVisible),
    codeWidth: clamp(
      value.codeWidth,
      CODE_WIDTH_RANGE.min,
      CODE_WIDTH_RANGE.max,
      DEFAULT_IDE_LAYOUT_STATE.codeWidth,
    ),
    bottomVisible: bool(value.bottomVisible, DEFAULT_IDE_LAYOUT_STATE.bottomVisible),
    bottomHeight: clamp(
      value.bottomHeight,
      BOTTOM_HEIGHT_RANGE.min,
      BOTTOM_HEIGHT_RANGE.max,
      DEFAULT_IDE_LAYOUT_STATE.bottomHeight,
    ),
  };
}

export function loadIdeLayoutState(): IdeLayoutState {
  let candidate: unknown = {};
  try {
    candidate = JSON.parse(window.localStorage.getItem(IDE_LAYOUT_STORAGE_KEY) || "{}");
  } catch (error) {
    console.warn("Ignoring invalid saved IDE layout.", error);
  }

  return normalizeIdeLayoutState(candidate);
}

export function saveIdeLayoutState(state: IdeLayoutState): void {
  try {
    window.localStorage.setItem(IDE_LAYOUT_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("IDE layout could not be saved.", error);
  }
}
