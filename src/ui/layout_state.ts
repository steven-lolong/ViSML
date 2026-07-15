export type ActivitySection = "blocks" | "files" | "settings";
export type BottomToolTab = "problems" | "output";
export type IdePerspective = "edit" | "presentation";

export interface IdeLayoutState {
  activeActivity: ActivitySection;
  sidebarVisible: boolean;
  sidebarWidth: number;
  codeVisible: boolean;
  codeWidth: number;
  bottomVisible: boolean;
  bottomHeight: number;
  activeBottomTab: BottomToolTab;
  perspective: IdePerspective;
}

export const IDE_LAYOUT_STORAGE_KEY = "visual-sml.layout.v2";

export const DEFAULT_IDE_LAYOUT_STATE: IdeLayoutState = {
  activeActivity: "blocks",
  sidebarVisible: true,
  sidebarWidth: 272,
  codeVisible: true,
  codeWidth: 430,
  bottomVisible: false,
  bottomHeight: 260,
  activeBottomTab: "problems",
  perspective: "edit",
};

const clamp = (value: unknown, minimum: number, maximum: number, fallback: number) => {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.min(maximum, Math.max(minimum, Math.round(number)))
    : fallback;
};

const oneOf = <T extends string>(value: unknown, values: readonly T[], fallback: T): T =>
  values.includes(value as T) ? value as T : fallback;

export function loadIdeLayoutState(): IdeLayoutState {
  let candidate: Partial<IdeLayoutState> = {};
  try {
    candidate = JSON.parse(window.localStorage.getItem(IDE_LAYOUT_STORAGE_KEY) || "{}");
  } catch (error) {
    console.warn("Ignoring invalid saved IDE layout.", error);
  }

  return {
    activeActivity: oneOf(candidate.activeActivity, ["blocks", "files", "settings"], "blocks"),
    sidebarVisible: typeof candidate.sidebarVisible === "boolean"
      ? candidate.sidebarVisible
      : DEFAULT_IDE_LAYOUT_STATE.sidebarVisible,
    sidebarWidth: clamp(candidate.sidebarWidth, 220, 380, DEFAULT_IDE_LAYOUT_STATE.sidebarWidth),
    codeVisible: typeof candidate.codeVisible === "boolean"
      ? candidate.codeVisible
      : DEFAULT_IDE_LAYOUT_STATE.codeVisible,
    codeWidth: clamp(candidate.codeWidth, 320, 720, DEFAULT_IDE_LAYOUT_STATE.codeWidth),
    bottomVisible: typeof candidate.bottomVisible === "boolean"
      ? candidate.bottomVisible
      : DEFAULT_IDE_LAYOUT_STATE.bottomVisible,
    bottomHeight: clamp(candidate.bottomHeight, 160, 520, DEFAULT_IDE_LAYOUT_STATE.bottomHeight),
    activeBottomTab: oneOf(candidate.activeBottomTab, ["problems", "output"], "problems"),
    perspective: oneOf(candidate.perspective, ["edit", "presentation"], "edit"),
  };
}

export function saveIdeLayoutState(state: IdeLayoutState): void {
  try {
    window.localStorage.setItem(IDE_LAYOUT_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("IDE layout could not be saved.", error);
  }
}
