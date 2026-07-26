/**
 * @fileoverview Owner of all Visual SML workbench UI state.
 *
 * Panel visibility, sizes, the active sidebar view, theme, the command
 * palette, the block outline and the SML diagnostics pane all live here.
 * `index.html` contributes markup and a pre-paint theme bootstrap only; it
 * deliberately holds no UI state, so there is exactly one writer per concern.
 */

import * as Blockly from "blockly";
import {
  ActivitySection,
  BOTTOM_HEIGHT_RANGE,
  CODE_WIDTH_RANGE,
  IdeLayoutState,
  SIDEBAR_WIDTH_RANGE,
  loadIdeLayoutState,
  saveIdeLayoutState,
} from "./layout_state";
import { SmlDiagnostic, SmlEditorStatusDetail, revealEditorPosition } from "./sml_code_editor";

type RightTab = "code" | "outline";
export type ThemeMode = "dark" | "light";

const THEME_STORAGE_KEY = "visual-sml-theme-mode";
const ACTIVITY_BAR_WIDTH = 50;

interface WorkbenchOptions {
  workspace: Blockly.WorkspaceSvg;
  requestLayoutUpdate: (message?: string) => void;
  refreshGeneratedCode: () => string;
  applySmlEditorNow: () => boolean;
  exportWorkspaceImage: () => void;
  getRendererName: () => string;
  setRenderer: (rendererName: string) => void;
  setBlocklyTheme: (mode: ThemeMode) => void;
  loadSample: (sampleId: string) => void;
  newWorkspace: () => void;
  openWorkspace: () => void;
  saveWorkspace: () => void;
  loadAutosave: () => void;
  getAutosaveMinutes: () => number;
  setAutosaveMinutes: (minutes: number) => number;
  showAbout: () => void;
  showUsage: () => void;
}

interface IdeCommand {
  id: string;
  label: string;
  category: string;
  shortcut?: string;
  run: () => void;
}

const asElement = <T extends HTMLElement>(id: string) =>
  document.getElementById(id) as T | null;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

export function initializeIdeWorkbench(options: WorkbenchOptions): void {
  const root = document.documentElement;
  const app = asElement<HTMLElement>("app");
  if (!app) return;

  const state: IdeLayoutState = loadIdeLayoutState();
  const compactLayout = window.matchMedia("(max-width: 1200px)");

  let activeRightTab: RightTab = "code";
  let outlineFrame = 0;
  let outlineStale = true;
  let diagnostic: SmlDiagnostic | null = null;

  const persist = () => saveIdeLayoutState(state);

  const setToken = (name: string, value: number) => {
    root.style.setProperty(name, `${Math.round(value)}px`);
  };

  /* ---------------------------------------------------------------- theme */

  const applyTheme = (mode: ThemeMode, announce = true) => {
    root.dataset.theme = mode;
    app.dataset.theme = mode;

    const toggle = asElement<HTMLInputElement>("themeToggle");
    if (toggle) {
      toggle.checked = mode === "dark";
      toggle.setAttribute(
        "aria-label",
        mode === "dark" ? "Switch to light theme" : "Switch to dark theme",
      );
    }
    document.querySelectorAll<HTMLElement>("[data-theme-choice]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.themeChoice === mode));
    });
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = mode === "dark" ? "#111318" : "#f2f4f7";

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.warn("Theme preference could not be saved.", error);
    }

    options.setBlocklyTheme(mode);
    options.requestLayoutUpdate(announce
      ? `${mode === "dark" ? "Dark" : "Light"} theme enabled.`
      : undefined);
  };

  const currentTheme = (): ThemeMode => (root.dataset.theme === "light" ? "light" : "dark");

  /* --------------------------------------------------------------- panels */

  const syncPanelControls = () => {
    const sidebarVisible = state.sidebarVisible;
    const codeVisible = state.codeVisible;

    const toolboxHide = asElement<HTMLButtonElement>("toggleToolboxPanel");
    const toolboxRestore = asElement<HTMLButtonElement>("showToolboxFromWorkspace");
    const codeHide = asElement<HTMLButtonElement>("toggleCodePanel");
    const codeRestore = asElement<HTMLButtonElement>("showCodeFromWorkspace");

    toolboxHide?.setAttribute("aria-expanded", String(sidebarVisible));
    if (toolboxRestore) toolboxRestore.hidden = sidebarVisible;
    codeHide?.setAttribute("aria-expanded", String(codeVisible));
    if (codeRestore) codeRestore.hidden = codeVisible;

    document.querySelectorAll<HTMLElement>("[data-panel-state]").forEach((item) => {
      const panel = item.dataset.panelState;
      const checked = panel === "sidebar"
        ? sidebarVisible
        : panel === "code"
          ? codeVisible
          : state.bottomVisible;
      item.setAttribute("aria-checked", String(checked));
    });
  };

  const setSidebarVisible = (visible: boolean, announce = true) => {
    state.sidebarVisible = visible;
    app.classList.toggle("toolbox-hidden", !visible);
    if (!visible) app.classList.remove("compact-sidebar-open");
    syncPanelControls();
    persist();
    options.requestLayoutUpdate(announce
      ? visible ? "Blocks sidebar shown." : "Blocks sidebar hidden."
      : undefined);
  };

  const setCodeVisible = (visible: boolean, announce = true) => {
    state.codeVisible = visible;
    app.classList.toggle("code-hidden", !visible);
    if (!visible) app.classList.remove("compact-code-open");
    syncPanelControls();
    persist();
    if (visible && activeRightTab === "outline") scheduleOutlineRender();
    options.requestLayoutUpdate(announce
      ? visible ? "Code panel shown." : "Code panel hidden."
      : undefined);
  };

  const setBottomVisible = (visible: boolean, announce = true) => {
    state.bottomVisible = visible;
    const panel = asElement<HTMLElement>("bottomTools");
    if (panel) panel.hidden = !visible;
    app.classList.toggle("bottom-panel-open", visible);
    if (visible && compactLayout.matches) {
      app.classList.remove("compact-sidebar-open", "compact-code-open");
    }
    syncPanelControls();
    persist();
    options.requestLayoutUpdate(announce
      ? visible ? "Diagnostics panel opened." : "Diagnostics panel closed."
      : undefined);
  };

  /* ------------------------------------------------------------- activity */

  const renderActivity = () => {
    document.querySelectorAll<HTMLElement>("[data-activity]").forEach((button) => {
      const active = button.dataset.activity === state.activeActivity;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll<HTMLElement>("[data-sidebar-view]").forEach((view) => {
      view.hidden = view.dataset.sidebarView !== state.activeActivity;
    });
    const sidebar = asElement<HTMLElement>("toolboxPanel");
    sidebar?.setAttribute(
      "aria-label",
      state.activeActivity === "blocks" ? "Block toolbox" : "Settings",
    );
  };

  const setActivity = (activity: ActivitySection, toggleWhenActive = false) => {
    const wasActive = state.activeActivity === activity && state.sidebarVisible;
    state.activeActivity = activity;
    renderActivity();

    if (compactLayout.matches) {
      if (state.bottomVisible) setBottomVisible(false, false);
      app.classList.toggle("compact-sidebar-open", !wasActive);
      app.classList.remove("compact-code-open");
      if (!state.sidebarVisible) setSidebarVisible(true, false);
    } else if (toggleWhenActive && wasActive) {
      setSidebarVisible(false, false);
    } else if (!state.sidebarVisible) {
      setSidebarVisible(true, false);
    }

    persist();
    options.requestLayoutUpdate();
  };

  /* ----------------------------------------------------------- right tabs */

  const setRightTab = (tab: RightTab) => {
    activeRightTab = tab;
    document.querySelectorAll<HTMLElement>("[data-right-tab]").forEach((button) => {
      const active = button.dataset.rightTab === tab;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    document.querySelectorAll<HTMLElement>("[data-right-pane]").forEach((pane) => {
      pane.hidden = pane.dataset.rightPane !== tab;
    });
    asElement<HTMLElement>("codeHeaderActions")?.toggleAttribute("hidden", tab !== "code");
    if (tab === "outline") scheduleOutlineRender();
    options.requestLayoutUpdate();
  };

  /* -------------------------------------------------------------- outline */

  /** True when the outline is actually on screen and worth rebuilding. */
  const outlineVisible = () => state.codeVisible && activeRightTab === "outline";

  /**
   * Rebuild the outline if it is both out of date and actually on screen.
   * Rebuilding a hidden tree on every workspace change is pure waste, so a
   * hidden outline is only marked stale and rebuilt when it next appears.
   */
  function scheduleOutlineRender() {
    if (!outlineStale || !outlineVisible() || outlineFrame) return;
    outlineFrame = window.requestAnimationFrame(() => {
      outlineFrame = 0;
      renderOutline();
    });
  }

  function markOutlineStale() {
    outlineStale = true;
    scheduleOutlineRender();
  }

  function renderOutline() {
    const container = asElement<HTMLElement>("programOutline");
    if (!container || !outlineVisible()) return;
    outlineStale = false;

    const topBlocks = options.workspace.getTopBlocks(true);
    if (!topBlocks.length) {
      const empty = document.createElement("div");
      empty.className = "side-empty-state";
      empty.textContent = "The workspace has no blocks.";
      container.replaceChildren(empty);
      return;
    }

    const rows: HTMLElement[] = [];
    const addBlock = (block: Blockly.Block, depth: number) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "outline-item";
      button.style.setProperty("--outline-depth", String(depth));
      button.dataset.blockId = block.id;

      const label = document.createElement("span");
      label.className = "outline-label";
      const blockText = (block as any).toString?.(54, "…") || block.type;
      label.textContent = String(blockText).replace(/\s+/g, " ").trim() || block.type;

      const type = document.createElement("span");
      type.className = "outline-type";
      type.textContent = block.type.replace(/_/g, " ");

      button.append(label, type);
      rows.push(button);
      block.getChildren(true).forEach((child) => addBlock(child, depth + 1));
    };
    topBlocks.forEach((block) => addBlock(block, 0));
    container.replaceChildren(...rows);
  }

  /* ---------------------------------------------------------- diagnostics */

  const renderDiagnostics = () => {
    const list = asElement<HTMLElement>("diagnosticsList");
    const statusCount = asElement<HTMLElement>("statusDiagnostics");
    const statusButton = statusCount?.closest("button");

    if (statusCount) statusCount.textContent = diagnostic ? "1" : "0";
    statusButton?.classList.toggle("has-error", Boolean(diagnostic));
    if (!list) return;

    if (!diagnostic) {
      const empty = document.createElement("div");
      empty.className = "tool-empty-state";
      empty.textContent = "No parse errors. Diagnostics appear here while you edit SML.";
      list.replaceChildren(empty);
      return;
    }

    const entry = document.createElement("button");
    entry.type = "button";
    entry.className = "diagnostic-entry";
    entry.dataset.diagnosticPosition = String(diagnostic.position);

    const location = document.createElement("span");
    location.className = "diagnostic-location";
    location.textContent = diagnostic.line
      ? `Ln ${diagnostic.line}, Col ${diagnostic.column}`
      : "SML";

    const message = document.createElement("span");
    message.className = "diagnostic-message";
    message.textContent = diagnostic.message;

    entry.append(location, message);
    list.replaceChildren(entry);
  };

  /* ------------------------------------------------------------- commands */

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
    } else {
      app.requestFullscreen().catch((error) => {
        console.error(error);
        options.requestLayoutUpdate("Full screen is unavailable.");
      });
    }
  };

  const toggleSidebarCommand = () => {
    if (compactLayout.matches) {
      setActivity(state.activeActivity, true);
      return;
    }
    setSidebarVisible(!state.sidebarVisible);
  };

  const toggleCodeCommand = () => {
    if (compactLayout.matches) {
      if (state.bottomVisible) setBottomVisible(false, false);
      if (!state.codeVisible) setCodeVisible(true, false);
      app.classList.toggle("compact-code-open");
      app.classList.remove("compact-sidebar-open");
      options.requestLayoutUpdate();
      return;
    }
    setCodeVisible(!state.codeVisible);
  };

  const focusBlockSearch = () => {
    setActivity("blocks");
    window.requestAnimationFrame(() => {
      const search = asElement<HTMLInputElement>("toolboxSearch");
      search?.focus();
      search?.select();
    });
  };

  const commands: IdeCommand[] = [
    { id: "file.new", label: "New Workspace", category: "File", run: options.newWorkspace },
    { id: "file.open", label: "Open Workspace…", category: "File", shortcut: "Ctrl+O", run: options.openWorkspace },
    { id: "file.save", label: "Save Workspace…", category: "File", shortcut: "Ctrl+S", run: options.saveWorkspace },
    { id: "file.autosave", label: "Load Autosave", category: "File", run: options.loadAutosave },

    { id: "edit.undo", label: "Undo", category: "Edit", shortcut: "Ctrl+Z", run: () => options.workspace.undo(false) },
    { id: "edit.redo", label: "Redo", category: "Edit", shortcut: "Ctrl+Shift+Z", run: () => options.workspace.undo(true) },
    { id: "edit.findBlock", label: "Search Blocks", category: "Edit", shortcut: "Ctrl+F", run: focusBlockSearch },

    { id: "view.blocks", label: "Show Blocks", category: "View", run: () => setActivity("blocks") },
    { id: "view.settings", label: "Show Settings", category: "View", run: () => setActivity("settings") },
    { id: "view.sidebar", label: "Toggle Blocks Sidebar", category: "View", shortcut: "Ctrl+B", run: toggleSidebarCommand },
    { id: "view.code", label: "Toggle Code Panel", category: "View", run: toggleCodeCommand },
    { id: "view.codeTab", label: "Show Generated Code", category: "View", run: () => { if (!state.codeVisible) setCodeVisible(true, false); setRightTab("code"); } },
    { id: "view.outline", label: "Show Program Outline", category: "View", run: () => { if (!state.codeVisible) setCodeVisible(true, false); setRightTab("outline"); } },
    { id: "view.diagnostics", label: "Toggle Diagnostics", category: "View", shortcut: "Ctrl+J", run: () => setBottomVisible(!state.bottomVisible) },
    { id: "view.fullscreen", label: "Toggle Full Screen", category: "View", shortcut: "F11", run: toggleFullscreen },
    { id: "view.theme", label: "Toggle Light / Dark Theme", category: "View", run: () => applyTheme(currentTheme() === "dark" ? "light" : "dark") },

    { id: "workspace.zoomIn", label: "Zoom In", category: "Workspace", run: () => { (options.workspace as any).zoomCenter(1); options.requestLayoutUpdate(); } },
    { id: "workspace.zoomOut", label: "Zoom Out", category: "Workspace", run: () => { (options.workspace as any).zoomCenter(-1); options.requestLayoutUpdate(); } },
    { id: "workspace.fit", label: "Fit Blocks in View", category: "Workspace", run: () => { (options.workspace as any).zoomToFit(); options.requestLayoutUpdate(); } },
    { id: "workspace.center", label: "Center Workspace", category: "Workspace", run: () => { (options.workspace as any).scrollCenter(); options.requestLayoutUpdate(); } },

    { id: "build.generate", label: "Regenerate SML from Blocks", category: "SML", run: () => { options.refreshGeneratedCode(); options.requestLayoutUpdate("SML regenerated from blocks."); } },
    { id: "build.apply", label: "Apply Edited SML to Blocks", category: "SML", run: () => options.applySmlEditorNow() },
    { id: "build.export", label: "Export Workspace as PNG", category: "SML", run: options.exportWorkspaceImage },

    { id: "help.usage", label: "Usage Guide", category: "Help", run: options.showUsage },
    { id: "help.about", label: "About Visual SML", category: "Help", run: options.showAbout },
  ];
  const commandMap = new Map(commands.map((command) => [command.id, command]));

  const closeMenus = () => {
    document.querySelectorAll<HTMLElement>(".app-menu").forEach((menu) => { menu.hidden = true; });
    document.querySelectorAll<HTMLElement>("[data-menu-target]").forEach((button) => {
      button.setAttribute("aria-expanded", "false");
    });
  };

  const runCommand = (id: string) => {
    const command = commandMap.get(id);
    if (!command) return;
    closeMenus();
    closeTopbarMenu();
    closeCommandPalette();
    command.run();
  };

  /* ------------------------------------------------------- command palette */

  const palette = asElement<HTMLElement>("commandPalette");
  const paletteInput = asElement<HTMLInputElement>("commandPaletteInput");
  const paletteResults = asElement<HTMLElement>("commandPaletteResults");
  let paletteSelection = 0;
  let filteredCommands = commands;
  let paletteReturnFocus: HTMLElement | null = null;

  const renderCommandPalette = () => {
    if (!paletteResults) return;
    const query = paletteInput?.value.trim().toLowerCase() || "";
    filteredCommands = commands.filter((command) =>
      `${command.category} ${command.label}`.toLowerCase().includes(query));
    paletteSelection = clamp(paletteSelection, 0, Math.max(0, filteredCommands.length - 1));

    paletteResults.replaceChildren(...filteredCommands.map((command, index) => {
      const item = document.createElement("button");
      item.type = "button";
      item.id = `command-result-${index}`;
      item.className = "command-result";
      item.dataset.command = command.id;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", String(index === paletteSelection));
      item.classList.toggle("selected", index === paletteSelection);

      const category = document.createElement("span");
      category.className = "command-category";
      category.textContent = command.category;
      const label = document.createElement("span");
      label.className = "command-label";
      label.textContent = command.label;
      item.append(category, label);

      if (command.shortcut) {
        const shortcut = document.createElement("kbd");
        shortcut.textContent = command.shortcut;
        item.append(shortcut);
      }
      return item;
    }));

    if (!filteredCommands.length) {
      const empty = document.createElement("div");
      empty.className = "command-empty";
      empty.textContent = "No matching commands";
      paletteResults.append(empty);
      paletteInput?.removeAttribute("aria-activedescendant");
    } else {
      paletteInput?.setAttribute("aria-activedescendant", `command-result-${paletteSelection}`);
      paletteResults.querySelector(".selected")?.scrollIntoView({ block: "nearest" });
    }
  };

  const openCommandPalette = () => {
    if (!palette) return;
    closeMenus();
    paletteReturnFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    palette.hidden = false;
    paletteSelection = 0;
    if (paletteInput) paletteInput.value = "";
    renderCommandPalette();
    window.requestAnimationFrame(() => paletteInput?.focus());
  };

  function closeCommandPalette() {
    if (!palette || palette.hidden) return;
    palette.hidden = true;
    paletteReturnFocus?.focus();
    paletteReturnFocus = null;
  }

  /* --------------------------------------------------------------- resize */

  const setupPointerResize = (
    handleId: string,
    bodyClass: string,
    read: () => number,
    write: (value: number) => void,
    fromPointer: (event: PointerEvent) => number,
    step = 16,
  ) => {
    const handle = asElement<HTMLElement>(handleId);
    if (!handle) return;
    let dragging = false;

    handle.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      dragging = true;
      handle.setPointerCapture(event.pointerId);
      document.body.classList.add(bodyClass);
      event.preventDefault();
    });
    handle.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      write(fromPointer(event));
      updateHandleValues();
      options.requestLayoutUpdate();
    });
    const finish = () => {
      if (!dragging) return;
      dragging = false;
      document.body.classList.remove(bodyClass);
      persist();
      options.requestLayoutUpdate();
    };
    handle.addEventListener("pointerup", finish);
    handle.addEventListener("pointercancel", finish);
    handle.addEventListener("dblclick", () => {
      // Double-click a divider to collapse the panel it borders.
      if (handleId === "sidebarResizeHandle") setSidebarVisible(false);
      if (handleId === "resizeHandle") setCodeVisible(false);
      if (handleId === "bottomResizeHandle") setBottomVisible(false);
    });
    handle.addEventListener("keydown", (event) => {
      const vertical = handle.getAttribute("aria-orientation") === "vertical";
      const decrease = vertical ? event.key === "ArrowLeft" : event.key === "ArrowDown";
      const increase = vertical ? event.key === "ArrowRight" : event.key === "ArrowUp";
      if (!decrease && !increase) return;
      event.preventDefault();
      write(read() + (increase ? step : -step));
      updateHandleValues();
      persist();
      options.requestLayoutUpdate();
    });
  };

  const writeSidebarWidth = (value: number) => {
    state.sidebarWidth = clamp(value, SIDEBAR_WIDTH_RANGE.min, SIDEBAR_WIDTH_RANGE.max);
    setToken("--ide-primary-sidebar-width", state.sidebarWidth);
  };
  const writeCodeWidth = (value: number) => {
    state.codeWidth = clamp(value, CODE_WIDTH_RANGE.min, CODE_WIDTH_RANGE.max);
    setToken("--ide-code-panel-width", state.codeWidth);
    setToken("--code-panel-width", state.codeWidth);
  };
  const writeBottomHeight = (value: number) => {
    state.bottomHeight = clamp(
      value,
      BOTTOM_HEIGHT_RANGE.min,
      Math.min(BOTTOM_HEIGHT_RANGE.max, window.innerHeight - 200),
    );
    setToken("--ide-bottom-panel-height", state.bottomHeight);
  };

  function updateHandleValues() {
    asElement<HTMLElement>("sidebarResizeHandle")?.setAttribute("aria-valuenow", String(state.sidebarWidth));
    asElement<HTMLElement>("resizeHandle")?.setAttribute("aria-valuenow", String(state.codeWidth));
    asElement<HTMLElement>("bottomResizeHandle")?.setAttribute("aria-valuenow", String(state.bottomHeight));
  }

  setupPointerResize(
    "sidebarResizeHandle", "resizing-sidebar",
    () => state.sidebarWidth, writeSidebarWidth,
    (event) => event.clientX - (compactLayout.matches ? 0 : ACTIVITY_BAR_WIDTH),
  );
  // The code panel is resized here too; index.html no longer duplicates this.
  setupPointerResize(
    "resizeHandle", "resizing-code-panel",
    () => state.codeWidth, writeCodeWidth,
    (event) => window.innerWidth - event.clientX,
  );
  setupPointerResize(
    "bottomResizeHandle", "resizing-bottom-panel",
    () => state.bottomHeight, writeBottomHeight,
    (event) => window.innerHeight - event.clientY - 24,
  );

  /* --------------------------------------------------------------- events */

  document.addEventListener("click", (event) => {
    const target = event.target as Element | null;

    const menuButton = target?.closest<HTMLElement>("[data-menu-target]");
    if (menuButton) {
      const menu = asElement<HTMLElement>(menuButton.dataset.menuTarget || "");
      const opening = Boolean(menu?.hidden);
      closeMenus();
      if (menu && opening) {
        menu.hidden = false;
        menuButton.setAttribute("aria-expanded", "true");
      }
      event.stopPropagation();
      return;
    }

    const commandItem = target?.closest<HTMLElement>("[data-command]");
    if (commandItem) {
      runCommand(commandItem.dataset.command || "");
      return;
    }

    const activity = target?.closest<HTMLElement>("[data-activity]")?.dataset.activity as
      ActivitySection | undefined;
    if (activity) {
      setActivity(activity, true);
      return;
    }

    const rightTab = target?.closest<HTMLElement>("[data-right-tab]")?.dataset.rightTab as
      RightTab | undefined;
    if (rightTab) {
      setRightTab(rightTab);
      return;
    }

    const outlineItem = target?.closest<HTMLElement>("[data-block-id]");
    if (outlineItem) {
      const block = options.workspace.getBlockById(outlineItem.dataset.blockId || "");
      if (block) {
        block.select();
        (options.workspace as any).centerOnBlock(block.id);
      }
      return;
    }

    const diagnosticEntry = target?.closest<HTMLElement>("[data-diagnostic-position]");
    if (diagnosticEntry) {
      if (!state.codeVisible) setCodeVisible(true, false);
      setRightTab("code");
      revealEditorPosition(Number(diagnosticEntry.dataset.diagnosticPosition) || 0);
      return;
    }

    const sample = target?.closest<HTMLElement>("[data-sample-id]")?.dataset.sampleId;
    if (sample) {
      closeMenus();
      options.loadSample(sample);
      window.setTimeout(() => {
        options.refreshGeneratedCode();
        options.requestLayoutUpdate(`Loaded example: ${sample}.`);
      }, 0);
      return;
    }

    const renderer = target?.closest<HTMLElement>("[data-renderer-id],[data-renderer-choice]");
    if (renderer) {
      const name = renderer.dataset.rendererId || renderer.dataset.rendererChoice || "";
      closeMenus();
      options.setRenderer(name);
      return;
    }

    const theme = target?.closest<HTMLElement>("[data-theme-choice]")?.dataset.themeChoice;
    if (theme === "dark" || theme === "light") {
      applyTheme(theme);
      return;
    }

    if (!target?.closest(".menu-system")) closeMenus();
  });

  // Panel chrome buttons.
  asElement<HTMLElement>("toggleToolboxPanel")?.addEventListener("click", () => setSidebarVisible(false));
  asElement<HTMLElement>("showToolboxFromWorkspace")?.addEventListener("click", () => setSidebarVisible(true));
  asElement<HTMLElement>("toggleCodePanel")?.addEventListener("click", () => setCodeVisible(false));
  asElement<HTMLElement>("showCodeFromWorkspace")?.addEventListener("click", () => setCodeVisible(true));
  asElement<HTMLElement>("closeBottomPanel")?.addEventListener("click", () => setBottomVisible(false));
  asElement<HTMLElement>("commandPaletteTrigger")?.addEventListener("click", openCommandPalette);

  // Compact layouts collapse the menu bar behind a hamburger.
  const menuToggle = asElement<HTMLButtonElement>("menuToggle");
  const renderMenuToggle = () => {
    const open = app.classList.contains("menu-open");
    menuToggle?.setAttribute("aria-expanded", String(open));
    if (menuToggle) {
      menuToggle.innerHTML = open
        ? '<span aria-hidden="true">×</span><span class="visually-hidden">Close application menu</span>'
        : '<span aria-hidden="true">☰</span><span class="visually-hidden">Open application menu</span>';
    }
  };
  menuToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    app.classList.toggle("menu-open");
    renderMenuToggle();
    options.requestLayoutUpdate();
  });
  const closeTopbarMenu = () => {
    if (!app.classList.contains("menu-open")) return;
    app.classList.remove("menu-open");
    renderMenuToggle();
  };

  asElement<HTMLElement>("workspaceUndo")?.addEventListener("click", () => runCommand("edit.undo"));
  asElement<HTMLElement>("workspaceRedo")?.addEventListener("click", () => runCommand("edit.redo"));
  asElement<HTMLElement>("workspaceZoomOut")?.addEventListener("click", () => runCommand("workspace.zoomOut"));
  asElement<HTMLElement>("workspaceZoomIn")?.addEventListener("click", () => runCommand("workspace.zoomIn"));
  asElement<HTMLElement>("workspaceFit")?.addEventListener("click", () => runCommand("workspace.fit"));
  asElement<HTMLElement>("workspaceFullscreen")?.addEventListener("click", toggleFullscreen);

  asElement<HTMLInputElement>("themeToggle")?.addEventListener("change", (event) => {
    applyTheme((event.target as HTMLInputElement).checked ? "dark" : "light");
  });

  asElement<HTMLElement>("copyCode")?.addEventListener("click", () => {
    const source = asElement<HTMLTextAreaElement>("smlSourceArea");
    const button = asElement<HTMLButtonElement>("copyCode");
    if (!source || !navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(source.value).then(
      () => {
        if (button) {
          button.textContent = "✓";
          window.setTimeout(() => { button.textContent = "⧉"; }, 1200);
        }
        options.requestLayoutUpdate("SML copied to clipboard.");
      },
      () => options.requestLayoutUpdate("SML could not be copied."),
    );
  });

  asElement<HTMLElement>("convertSmlToBlocks")?.addEventListener("click", () => {
    options.applySmlEditorNow();
  });

  const autosaveSlider = asElement<HTMLInputElement>("autosaveInterval");
  const autosaveLabel = asElement<HTMLElement>("autosaveIntervalLabel");
  const renderAutosave = (minutes: number) => {
    if (autosaveSlider) autosaveSlider.value = String(minutes);
    if (autosaveLabel) autosaveLabel.textContent = `${minutes} min`;
  };
  autosaveSlider?.addEventListener("input", (event) => {
    renderAutosave(options.setAutosaveMinutes(Number((event.target as HTMLInputElement).value)));
  });

  // Searching force-opens the categories that still have hits; clearing the box
  // puts every category back the way the user left it rather than leaving the
  // whole tree expanded.
  const openBeforeSearch = new WeakMap<HTMLDetailsElement, boolean>();
  asElement<HTMLInputElement>("toolboxSearch")?.addEventListener("input", (event) => {
    const query = (event.target as HTMLInputElement).value.trim().toLowerCase();
    let matches = 0;
    document.querySelectorAll<HTMLElement>("#htmlToolbox .toolbox-block-card").forEach((card) => {
      const hit = !query || card.textContent!.toLowerCase().includes(query);
      card.hidden = !hit;
      if (hit) matches++;
    });
    document.querySelectorAll<HTMLDetailsElement>("#htmlToolbox .toolbox-category").forEach((category) => {
      const visible = category.querySelectorAll(".toolbox-block-card:not([hidden])").length;
      category.hidden = Boolean(query) && visible === 0;
      if (query) {
        if (!openBeforeSearch.has(category)) openBeforeSearch.set(category, category.open);
        if (visible) category.open = true;
      } else if (openBeforeSearch.has(category)) {
        category.open = openBeforeSearch.get(category)!;
        openBeforeSearch.delete(category);
      }
    });
    const empty = asElement<HTMLElement>("toolboxSearchEmpty");
    if (empty) empty.hidden = !query || matches > 0;
  });

  asElement<HTMLInputElement>("toolboxSearch")?.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const input = event.target as HTMLInputElement;
    if (!input.value) return;
    event.stopPropagation();
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });

  // Menu bar keyboard navigation.
  document.querySelector<HTMLElement>(".menu-system")?.addEventListener("keydown", (event) => {
    const target = event.target as HTMLElement;
    const trigger = target.closest<HTMLElement>("[data-menu-target]");
    const menu = target.closest<HTMLElement>(".app-menu");
    if (trigger && (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      trigger.click();
      window.requestAnimationFrame(() => {
        asElement<HTMLElement>(trigger.dataset.menuTarget || "")
          ?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
      });
      return;
    }
    if (!menu || (event.key !== "ArrowDown" && event.key !== "ArrowUp")) return;
    const items = [...menu.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")];
    const index = items.indexOf(target as HTMLButtonElement);
    if (index < 0) return;
    event.preventDefault();
    items[(index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length].focus();
  });

  asElement<HTMLElement>("rightPanelTabs")?.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const tabs = [...document.querySelectorAll<HTMLButtonElement>("[data-right-tab]")];
    const current = tabs.indexOf(event.target as HTMLButtonElement);
    if (current < 0) return;
    event.preventDefault();
    const next = tabs[(current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    next.focus();
    next.click();
  });

  paletteInput?.addEventListener("input", () => {
    paletteSelection = 0;
    renderCommandPalette();
  });
  paletteInput?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      paletteSelection = clamp(
        paletteSelection + (event.key === "ArrowDown" ? 1 : -1),
        0,
        Math.max(0, filteredCommands.length - 1),
      );
      renderCommandPalette();
      return;
    }
    if (event.key === "Enter" && filteredCommands[paletteSelection]) {
      event.preventDefault();
      runCommand(filteredCommands[paletteSelection].id);
    }
  });
  palette?.addEventListener("mousedown", (event) => {
    if (event.target === palette) closeCommandPalette();
  });

  document.addEventListener("keydown", (event) => {
    const modifier = event.ctrlKey || event.metaKey;
    const inTextField = document.activeElement instanceof HTMLTextAreaElement
      || document.activeElement instanceof HTMLInputElement;

    if ((modifier && event.shiftKey && event.key.toLowerCase() === "p") || event.key === "F1") {
      event.preventDefault();
      openCommandPalette();
      return;
    }
    if (event.key === "Escape") {
      closeCommandPalette();
      closeMenus();
      closeTopbarMenu();
      app.classList.remove("compact-sidebar-open", "compact-code-open");
      return;
    }
    if (!modifier || event.shiftKey || event.altKey) return;

    switch (event.key.toLowerCase()) {
      case "s":
        event.preventDefault();
        runCommand("file.save");
        break;
      case "o":
        event.preventDefault();
        runCommand("file.open");
        break;
      case "b":
        event.preventDefault();
        runCommand("view.sidebar");
        break;
      case "j":
        event.preventDefault();
        runCommand("view.diagnostics");
        break;
      case "f":
        // Ctrl+F is the IDE-conventional block search, but never steal it
        // from the SML editor or the search field itself.
        if (inTextField) return;
        event.preventDefault();
        focusBlockSearch();
        break;
      default:
        break;
    }
  });

  document.addEventListener("visual-sml:editor-status", (event) => {
    const detail = (event as CustomEvent<SmlEditorStatusDetail>).detail;
    const next = detail?.state === "error" ? detail.diagnostic ?? null : null;
    const changed = (next?.position ?? -1) !== (diagnostic?.position ?? -1)
      || (next?.message ?? "") !== (diagnostic?.message ?? "");
    diagnostic = next;
    if (changed) renderDiagnostics();
  });

  document.addEventListener("fullscreenchange", () => options.requestLayoutUpdate());
  compactLayout.addEventListener("change", () => {
    app.classList.remove("compact-sidebar-open", "compact-code-open");
    options.requestLayoutUpdate();
  });
  window.addEventListener("resize", () => {
    // Keep the bottom panel inside the viewport when the window shrinks.
    if (state.bottomVisible) writeBottomHeight(state.bottomHeight);
  });

  options.workspace.addChangeListener(markOutlineStale);

  /* --------------------------------------------------------------- startup */

  const savedTheme = (() => {
    try {
      return window.localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      return null;
    }
  })();

  writeSidebarWidth(state.sidebarWidth);
  writeCodeWidth(state.codeWidth);
  writeBottomHeight(state.bottomHeight);

  app.classList.toggle("toolbox-hidden", !state.sidebarVisible);
  app.classList.toggle("code-hidden", !state.codeVisible);

  renderActivity();
  setBottomVisible(state.bottomVisible, false);
  setRightTab(activeRightTab);
  syncPanelControls();
  updateHandleValues();
  renderDiagnostics();
  renderAutosave(options.getAutosaveMinutes());
  applyTheme(savedTheme === "light" ? "light" : "dark", false);

  document.querySelectorAll<HTMLElement>("[data-renderer-id],[data-renderer-choice]").forEach((button) => {
    const name = button.dataset.rendererId || button.dataset.rendererChoice;
    button.setAttribute("aria-checked", String(name === options.getRendererName()));
  });
  const rendererStatus = asElement<HTMLElement>("statusRenderer");
  if (rendererStatus) {
    rendererStatus.textContent = options.getRendererName() === "GoropaRenderer"
      ? "Goropa"
      : "Macaca Nigra";
  }

  options.requestLayoutUpdate("Visual SML ready.");
}
