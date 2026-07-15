import * as Blockly from "blockly";
import {
  ActivitySection,
  BottomToolTab,
  IdeLayoutState,
  IdePerspective,
  loadIdeLayoutState,
  saveIdeLayoutState,
} from "./layout_state";

type RightTab = "code" | "outline";

interface WorkbenchOptions {
  workspace: Blockly.WorkspaceSvg;
  requestLayoutUpdate: (message?: string) => void;
  refreshGeneratedCode: () => string;
  exportWorkspaceImage: () => void;
  getRendererName: () => string;
  setRenderer: (rendererName: string) => void;
}

interface IdeCommand {
  id: string;
  label: string;
  category: string;
  shortcut?: string;
  enabled?: boolean;
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
  const compactLayout = window.matchMedia("(max-width: 1080px)");
  const outputEntries: Array<{ time: string; message: string; count: number }> = [];
  let outlineFrame = 0;
  let activeRightTab: RightTab = "code";
  let bottomMaximized = false;
  let preMaximizeBottomHeight = state.bottomHeight;

  const persist = () => saveIdeLayoutState(state);

  const setResizeToken = (name: string, value: number) => {
    root.style.setProperty(name, `${Math.round(value)}px`);
  };

  const updateHandleValues = () => {
    const sidebarHandle = asElement<HTMLElement>("sidebarResizeHandle");
    const codeHandle = asElement<HTMLElement>("resizeHandle");
    const bottomHandle = asElement<HTMLElement>("bottomResizeHandle");
    sidebarHandle?.setAttribute("aria-valuenow", String(state.sidebarWidth));
    codeHandle?.setAttribute("aria-valuenow", String(state.codeWidth));
    bottomHandle?.setAttribute("aria-valuenow", String(state.bottomHeight));
  };

  const syncPanelControls = () => {
    const sidebarVisible = !app.classList.contains("toolbox-hidden");
    const codeVisible = !app.classList.contains("code-hidden");
    const toolboxHide = asElement<HTMLButtonElement>("toggleToolboxPanel");
    const toolboxRestore = asElement<HTMLButtonElement>("showToolboxFromWorkspace");
    const codeHide = asElement<HTMLButtonElement>("toggleCodePanel");
    const codeRestore = asElement<HTMLButtonElement>("showCodeFromWorkspace");

    if (toolboxHide) toolboxHide.setAttribute("aria-expanded", String(sidebarVisible));
    if (toolboxRestore) {
      toolboxRestore.hidden = sidebarVisible;
      toolboxRestore.setAttribute("aria-expanded", String(sidebarVisible));
    }
    if (codeHide) codeHide.setAttribute("aria-expanded", String(codeVisible));
    if (codeRestore) {
      codeRestore.hidden = codeVisible;
      codeRestore.disabled = codeVisible;
      codeRestore.setAttribute("aria-expanded", String(codeVisible));
    }

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

  const setSidebarVisible = (visible: boolean, message = true) => {
    state.sidebarVisible = visible;
    app.classList.toggle("toolbox-hidden", !visible);
    if (!visible) app.classList.remove("compact-sidebar-open");
    syncPanelControls();
    persist();
    options.requestLayoutUpdate(message
      ? visible ? "Primary sidebar shown." : "Primary sidebar hidden."
      : undefined);
  };

  const setCodeVisible = (visible: boolean, message = true) => {
    state.codeVisible = visible;
    app.classList.toggle("code-hidden", !visible);
    if (!visible) app.classList.remove("compact-code-open");
    syncPanelControls();
    persist();
    options.requestLayoutUpdate(message
      ? visible ? "Code and outline region shown." : "Code and outline region hidden."
      : undefined);
  };

  const setBottomVisible = (visible: boolean, message = true) => {
    const panel = asElement<HTMLElement>("bottomTools");
    state.bottomVisible = visible;
    if (panel) panel.hidden = !visible;
    app.classList.toggle("bottom-panel-open", visible);
    if (!visible) {
      bottomMaximized = false;
      app.classList.remove("bottom-panel-maximized");
    }
    syncPanelControls();
    persist();
    options.requestLayoutUpdate(message
      ? visible ? "Bottom tools opened." : "Bottom tools closed."
      : undefined);
  };

  const renderActivity = () => {
    document.querySelectorAll<HTMLElement>("[data-activity]").forEach((button) => {
      const active = button.dataset.activity === state.activeActivity;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute("aria-current", active ? "page" : "false");
    });

    document.querySelectorAll<HTMLElement>("[data-sidebar-view]").forEach((view) => {
      view.hidden = view.dataset.sidebarView !== state.activeActivity;
    });
    const sidebar = asElement<HTMLElement>("toolboxPanel");
    if (sidebar) sidebar.setAttribute("aria-label", state.activeActivity === "blocks"
      ? "Block toolbox"
      : state.activeActivity === "files" ? "Project files" : "Settings");
  };

  const setActivity = (activity: ActivitySection, toggleWhenActive = false) => {
    const isActive = state.activeActivity === activity;
    state.activeActivity = activity;
    renderActivity();

    if (compactLayout.matches) {
      const shouldOpen = !isActive || !app.classList.contains("compact-sidebar-open");
      app.classList.toggle("compact-sidebar-open", shouldOpen);
      app.classList.remove("compact-code-open");
      if (!state.sidebarVisible) setSidebarVisible(true, false);
    } else if (toggleWhenActive && isActive && state.sidebarVisible) {
      setSidebarVisible(false);
    } else if (!state.sidebarVisible) {
      setSidebarVisible(true, false);
    }

    persist();
    options.requestLayoutUpdate(`${activity[0].toUpperCase()}${activity.slice(1)} view selected.`);
  };

  const renderBottomTab = () => {
    document.querySelectorAll<HTMLElement>("[data-bottom-tab]").forEach((tab) => {
      const active = tab.dataset.bottomTab === state.activeBottomTab;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    document.querySelectorAll<HTMLElement>("[data-bottom-pane]").forEach((pane) => {
      pane.hidden = pane.dataset.bottomPane !== state.activeBottomTab;
    });
  };

  const setBottomTab = (tab: BottomToolTab, open = true) => {
    state.activeBottomTab = tab;
    renderBottomTab();
    if (open && !state.bottomVisible) setBottomVisible(true, false);
    persist();
    options.requestLayoutUpdate(`${tab === "problems" ? "Problems" : "Output"} view selected.`);
  };

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
      pane.classList.toggle("active", pane.dataset.rightPane === tab);
    });
    asElement<HTMLElement>("codeHeaderActions")?.toggleAttribute("hidden", tab !== "code");
    if (tab === "outline") scheduleOutlineRender();
    options.requestLayoutUpdate(`${tab === "code" ? "Code" : "Outline"} view selected.`);
  };

  const appendOutput = (message: string) => {
    if (!message) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const previous = outputEntries[outputEntries.length - 1];
    if (previous?.message === message) {
      previous.count += 1;
      previous.time = time;
    } else {
      outputEntries.push({ time, message, count: 1 });
    }
    if (outputEntries.length > 80) outputEntries.splice(0, outputEntries.length - 80);
    const container = asElement<HTMLElement>("outputLog");
    if (!container) return;
    container.replaceChildren(...outputEntries.map((entry) => {
      const row = document.createElement("div");
      row.className = "output-entry";
      const time = document.createElement("time");
      time.textContent = entry.time;
      const text = document.createElement("span");
      text.textContent = entry.count > 1 ? `${entry.message} ×${entry.count}` : entry.message;
      row.append(time, text);
      return row;
    }));
    container.scrollTop = container.scrollHeight;
  };

  const renderProblems = (message = "", level = "idle") => {
    const list = asElement<HTMLElement>("problemsList");
    const badge = asElement<HTMLElement>("problemsCount");
    const statusBadge = asElement<HTMLElement>("statusProblemsCount");
    if (!list) return;
    list.replaceChildren();
    const hasProblem = level === "error" && Boolean(message);
    if (badge) badge.textContent = hasProblem ? "1" : "0";
    if (statusBadge) statusBadge.textContent = hasProblem ? "1" : "0";
    if (!hasProblem) {
      const empty = document.createElement("div");
      empty.className = "tool-empty-state";
      empty.innerHTML = '<span class="empty-state-icon" aria-hidden="true">✓</span><strong>No problems detected</strong><span>Parser feedback will appear here while editing SML.</span>';
      list.append(empty);
      return;
    }
    const item = document.createElement("div");
    item.className = "problem-entry error";
    item.innerHTML = '<span class="problem-severity" aria-hidden="true">×</span>';
    const body = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = "SML parse error";
    const description = document.createElement("span");
    description.textContent = message;
    body.append(title, description);
    item.append(body);
    list.append(item);
  };

  function scheduleOutlineRender() {
    if (outlineFrame) window.cancelAnimationFrame(outlineFrame);
    outlineFrame = window.requestAnimationFrame(() => {
      outlineFrame = 0;
      renderOutline();
    });
  }

  function renderOutline() {
    const container = asElement<HTMLElement>("programOutline");
    if (!container) return;
    container.replaceChildren();
    const topBlocks = options.workspace.getTopBlocks(true);
    if (!topBlocks.length) {
      const empty = document.createElement("div");
      empty.className = "side-empty-state";
      empty.textContent = "The workspace has no blocks.";
      container.append(empty);
      return;
    }

    const addBlock = (block: Blockly.Block, depth: number) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "outline-item";
      button.style.setProperty("--outline-depth", String(depth));
      button.dataset.blockId = block.id;
      const disclosure = document.createElement("span");
      disclosure.className = "outline-disclosure";
      const children = block.getChildren(true);
      disclosure.textContent = children.length ? "⌄" : "·";
      const label = document.createElement("span");
      label.className = "outline-label";
      const blockText = (block as any).toString?.(54, "…") || block.type;
      label.textContent = String(blockText).replace(/\s+/g, " ").trim() || block.type;
      const type = document.createElement("span");
      type.className = "outline-type";
      type.textContent = block.type.replace(/_/g, " ");
      button.append(disclosure, label, type);
      container.append(button);
      children.forEach((child) => addBlock(child, depth + 1));
    };
    topBlocks.forEach((block) => addBlock(block, 0));
  }

  const setPerspective = (perspective: IdePerspective, announce = true) => {
    state.perspective = perspective;
    app.dataset.perspective = perspective;
    app.classList.toggle("perspective-presentation", perspective === "presentation");
    if (perspective === "presentation") {
      app.classList.remove("compact-sidebar-open", "compact-code-open");
    }
    const select = asElement<HTMLSelectElement>("perspectiveSelect");
    if (select) select.value = perspective;
    document.querySelectorAll<HTMLElement>("[data-perspective]").forEach((item) => {
      item.setAttribute("aria-checked", String(item.dataset.perspective === perspective));
    });
    persist();
    options.requestLayoutUpdate(announce
      ? `${perspective === "edit" ? "Edit" : "Presentation"} perspective activated.`
      : undefined);
  };

  const toggleBottomMaximize = () => {
    if (!state.bottomVisible) setBottomVisible(true, false);
    bottomMaximized = !bottomMaximized;
    app.classList.toggle("bottom-panel-maximized", bottomMaximized);
    const button = asElement<HTMLButtonElement>("maximizeBottomPanel");
    if (bottomMaximized) {
      preMaximizeBottomHeight = state.bottomHeight;
      if (button) {
        button.title = "Restore bottom panel";
        button.setAttribute("aria-label", "Restore bottom panel");
      }
    } else {
      state.bottomHeight = preMaximizeBottomHeight;
      setResizeToken("--ide-bottom-panel-height", state.bottomHeight);
      if (button) {
        button.title = "Maximize bottom panel";
        button.setAttribute("aria-label", "Maximize bottom panel");
      }
    }
    options.requestLayoutUpdate(bottomMaximized ? "Bottom tools maximized." : "Bottom tools restored.");
  };

  const openCompactCode = () => {
    if (!state.codeVisible) setCodeVisible(true, false);
    app.classList.toggle("compact-code-open");
    app.classList.remove("compact-sidebar-open");
    options.requestLayoutUpdate();
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
      openCompactCode();
      return;
    }
    setCodeVisible(!state.codeVisible);
  };

  const clickExisting = (id: string) => asElement<HTMLButtonElement>(id)?.click();

  const commands: IdeCommand[] = [
    { id: "file.new", label: "New Workspace", category: "File", run: () => clickExisting("newWorkspace") },
    { id: "file.open", label: "Open Workspace…", category: "File", shortcut: "Ctrl+O", run: () => clickExisting("loadWorkspace") },
    { id: "file.save", label: "Save Workspace…", category: "File", shortcut: "Ctrl+S", run: () => clickExisting("saveWorkspace") },
    { id: "file.autosave", label: "Load Autosave", category: "File", run: () => clickExisting("loadAutosave") },
    { id: "edit.undo", label: "Undo", category: "Edit", shortcut: "Ctrl+Z", run: () => options.workspace.undo(false) },
    { id: "edit.redo", label: "Redo", category: "Edit", shortcut: "Ctrl+Shift+Z", run: () => options.workspace.undo(true) },
    { id: "view.blocks", label: "Show Blocks", category: "View", run: () => setActivity("blocks") },
    { id: "view.files", label: "Show Project Files", category: "View", run: () => setActivity("files") },
    { id: "view.settings", label: "Show Settings", category: "View", run: () => setActivity("settings") },
    { id: "view.sidebar", label: "Toggle Primary Sidebar", category: "View", shortcut: "Ctrl+B", run: toggleSidebarCommand },
    { id: "view.code", label: "Toggle Code / Outline", category: "View", run: toggleCodeCommand },
    { id: "view.bottom", label: "Toggle Bottom Tools", category: "View", shortcut: "Ctrl+J", run: () => setBottomVisible(!state.bottomVisible) },
    { id: "view.problems", label: "Show Problems", category: "View", run: () => setBottomTab("problems") },
    { id: "view.output", label: "Show Output", category: "View", run: () => setBottomTab("output") },
    { id: "view.fullscreen", label: "Toggle Full Screen", category: "View", shortcut: "F11", run: () => toggleFullscreen() },
    { id: "workspace.zoomIn", label: "Zoom In", category: "Workspace", run: () => { (options.workspace as any).zoomCenter(1); options.requestLayoutUpdate(); } },
    { id: "workspace.zoomOut", label: "Zoom Out", category: "Workspace", run: () => { (options.workspace as any).zoomCenter(-1); options.requestLayoutUpdate(); } },
    { id: "workspace.fit", label: "Fit Blocks in View", category: "Workspace", run: () => { (options.workspace as any).zoomToFit(); options.requestLayoutUpdate(); } },
    { id: "workspace.center", label: "Center Workspace", category: "Workspace", run: () => { (options.workspace as any).scrollCenter(); options.requestLayoutUpdate(); } },
    { id: "build.generate", label: "Synchronize Generated SML", category: "Build", run: () => { options.refreshGeneratedCode(); options.requestLayoutUpdate("Generated SML synchronized."); } },
    { id: "build.export", label: "Export Workspace as PNG", category: "Build", run: options.exportWorkspaceImage },
    { id: "run.unavailable", label: "Execution runtime is not configured", category: "Run", enabled: false, run: () => undefined },
    { id: "perspective.edit", label: "Activate Edit Perspective", category: "Perspective", run: () => setPerspective("edit") },
    { id: "perspective.presentation", label: "Activate Presentation Perspective", category: "Perspective", run: () => setPerspective("presentation") },
    { id: "help.usage", label: "Open Usage Guide", category: "Help", run: () => clickExisting("usageApp") },
    { id: "help.about", label: "About Visual SML", category: "Help", run: () => clickExisting("aboutApp") },
  ];
  const commandMap = new Map(commands.map((command) => [command.id, command]));

  const runCommand = (id: string) => {
    const command = commandMap.get(id);
    if (!command || command.enabled === false) return;
    closeMenus();
    closeCommandPalette();
    command.run();
    options.requestLayoutUpdate();
  };

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
    } else {
      app.requestFullscreen().catch((error) => {
        console.error(error);
        options.requestLayoutUpdate("Full screen could not be opened.");
      });
    }
  }

  const closeMenus = () => {
    document.querySelectorAll<HTMLElement>(".app-menu").forEach((menu) => { menu.hidden = true; });
    document.querySelectorAll<HTMLElement>("[data-menu-target]").forEach((button) => {
      button.setAttribute("aria-expanded", "false");
    });
  };

  const palette = asElement<HTMLElement>("commandPalette");
  const paletteInput = asElement<HTMLInputElement>("commandPaletteInput");
  const paletteResults = asElement<HTMLElement>("commandPaletteResults");
  let paletteSelection = 0;
  let filteredCommands = commands;

  const renderCommandPalette = () => {
    if (!paletteResults) return;
    const query = paletteInput?.value.trim().toLowerCase() || "";
    filteredCommands = commands.filter((command) =>
      `${command.category} ${command.label}`.toLowerCase().includes(query));
    paletteSelection = clamp(paletteSelection, 0, Math.max(0, filteredCommands.length - 1));
    paletteResults.replaceChildren(...filteredCommands.map((command, index) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "command-result";
      item.dataset.command = command.id;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", String(index === paletteSelection));
      item.disabled = command.enabled === false;
      if (index === paletteSelection) item.classList.add("selected");
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
    }
  };

  const openCommandPalette = () => {
    if (!palette) return;
    closeMenus();
    palette.hidden = false;
    paletteSelection = 0;
    if (paletteInput) paletteInput.value = "";
    renderCommandPalette();
    window.requestAnimationFrame(() => paletteInput?.focus());
  };

  function closeCommandPalette() {
    if (palette) palette.hidden = true;
  }

  const setupPointerResize = (
    handleId: string,
    bodyClass: string,
    readValue: () => number,
    writeValue: (value: number) => void,
    valueFromPointer: (event: PointerEvent) => number,
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
      writeValue(valueFromPointer(event));
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
    handle.addEventListener("keydown", (event) => {
      const horizontal = handle.getAttribute("aria-orientation") === "vertical";
      const decrease = horizontal ? event.key === "ArrowLeft" : event.key === "ArrowDown";
      const increase = horizontal ? event.key === "ArrowRight" : event.key === "ArrowUp";
      if (!decrease && !increase) return;
      event.preventDefault();
      writeValue(readValue() + (increase ? 16 : -16));
      updateHandleValues();
      persist();
      options.requestLayoutUpdate();
    });
  };

  setupPointerResize(
    "sidebarResizeHandle",
    "resizing-sidebar",
    () => state.sidebarWidth,
    (value) => {
      state.sidebarWidth = clamp(value, 220, 380);
      setResizeToken("--ide-primary-sidebar-width", state.sidebarWidth);
    },
    (event) => event.clientX - (compactLayout.matches ? 0 : 50),
  );

  setupPointerResize(
    "bottomResizeHandle",
    "resizing-bottom-panel",
    () => state.bottomHeight,
    (value) => {
      state.bottomHeight = clamp(value, 160, Math.min(520, window.innerHeight - 180));
      setResizeToken("--ide-bottom-panel-height", state.bottomHeight);
    },
    (event) => window.innerHeight - event.clientY - 24,
  );

  const codeHandle = asElement<HTMLElement>("resizeHandle");
  codeHandle?.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    state.codeWidth = clamp(state.codeWidth + (event.key === "ArrowLeft" ? 16 : -16), 320, 720);
    setResizeToken("--ide-code-panel-width", state.codeWidth);
    root.style.setProperty("--code-panel-width", `${state.codeWidth}px`);
    updateHandleValues();
    persist();
    options.requestLayoutUpdate();
  });
  window.addEventListener("pointerup", () => {
    const value = Number.parseFloat(getComputedStyle(root).getPropertyValue("--ide-code-panel-width"));
    if (Number.isFinite(value)) {
      state.codeWidth = clamp(value, 320, 720);
      persist();
      updateHandleValues();
    }
  });

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

    const activity = target?.closest<HTMLElement>("[data-activity]")?.dataset.activity as ActivitySection | undefined;
    if (activity) {
      setActivity(activity, true);
      return;
    }

    const bottomTab = target?.closest<HTMLElement>("[data-bottom-tab]")?.dataset.bottomTab as BottomToolTab | undefined;
    if (bottomTab) {
      setBottomTab(bottomTab);
      return;
    }

    const rightTab = target?.closest<HTMLElement>("[data-right-tab]")?.dataset.rightTab as RightTab | undefined;
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

    const renderer = target?.closest<HTMLElement>("[data-renderer-choice]")?.dataset.rendererChoice;
    if (renderer) {
      options.setRenderer(renderer);
      return;
    }

    const theme = target?.closest<HTMLElement>("[data-theme-choice]")?.dataset.themeChoice;
    if (theme === "dark") (window as any).setDarkTheme?.();
    if (theme === "light") (window as any).setLightTheme?.();
    if (theme) {
      document.querySelectorAll<HTMLElement>("[data-theme-choice]").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.themeChoice === theme));
      });
    }

    if (!target?.closest(".menu-system")) closeMenus();
  });

  ["toggleToolboxPanel", "showToolboxFromWorkspace", "toggleCodePanel", "showCodeFromWorkspace"].forEach((id) => {
    asElement<HTMLElement>(id)?.addEventListener("click", () => window.setTimeout(() => {
      state.sidebarVisible = !app.classList.contains("toolbox-hidden");
      state.codeVisible = !app.classList.contains("code-hidden");
      if (id.includes("Toolbox")) app.classList.remove("compact-sidebar-open");
      if (id.includes("Code")) app.classList.remove("compact-code-open");
      syncPanelControls();
      persist();
    }, 0));
  });

  asElement<HTMLElement>("commandPaletteTrigger")?.addEventListener("click", openCommandPalette);
  asElement<HTMLElement>("closeBottomPanel")?.addEventListener("click", () => setBottomVisible(false));
  asElement<HTMLElement>("maximizeBottomPanel")?.addEventListener("click", toggleBottomMaximize);
  asElement<HTMLElement>("workspaceToggleBottom")?.addEventListener("click", () => setBottomVisible(!state.bottomVisible));
  asElement<HTMLElement>("workspaceUndo")?.addEventListener("click", () => options.workspace.undo(false));
  asElement<HTMLElement>("workspaceRedo")?.addEventListener("click", () => options.workspace.undo(true));
  asElement<HTMLElement>("workspaceZoomOut")?.addEventListener("click", () => runCommand("workspace.zoomOut"));
  asElement<HTMLElement>("workspaceZoomIn")?.addEventListener("click", () => runCommand("workspace.zoomIn"));
  asElement<HTMLElement>("workspaceFit")?.addEventListener("click", () => runCommand("workspace.fit"));
  asElement<HTMLElement>("workspaceFullscreen")?.addEventListener("click", toggleFullscreen);
  asElement<HTMLSelectElement>("perspectiveSelect")?.addEventListener("change", (event) => {
    setPerspective((event.target as HTMLSelectElement).value as IdePerspective);
  });
  asElement<HTMLInputElement>("themeToggle")?.addEventListener("change", () => window.setTimeout(() => {
    document.querySelectorAll<HTMLElement>("[data-theme-choice]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.themeChoice === root.dataset.theme));
    });
  }, 0));

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

  asElement<HTMLElement>("programOutline")?.addEventListener("keydown", (event) => {
    const target = event.target as HTMLElement;
    if (event.key === "Enter" || event.key === " ") target.click();
  });

  const handleTabKeys = (event: KeyboardEvent, selector: string) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const tabs = [...document.querySelectorAll<HTMLButtonElement>(selector)].filter((tab) => !tab.disabled);
    const current = tabs.indexOf(event.target as HTMLButtonElement);
    if (current < 0) return;
    event.preventDefault();
    tabs[(current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length].focus();
  };
  asElement<HTMLElement>("rightPanelTabs")?.addEventListener("keydown", (event) => handleTabKeys(event, "[data-right-tab]"));
  asElement<HTMLElement>("bottomToolTabs")?.addEventListener("keydown", (event) => handleTabKeys(event, "[data-bottom-tab]"));

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

  document.addEventListener("keydown", (event) => {
    const modifier = event.ctrlKey || event.metaKey;
    if ((modifier && event.shiftKey && event.key.toLowerCase() === "p") || event.key === "F1") {
      event.preventDefault();
      openCommandPalette();
      return;
    }
    if (event.key === "Escape") {
      closeCommandPalette();
      closeMenus();
      app.classList.remove("compact-sidebar-open", "compact-code-open");
      options.requestLayoutUpdate();
      return;
    }
    if (!modifier) return;
    if (event.key.toLowerCase() === "s") {
      event.preventDefault();
      runCommand("file.save");
    } else if (event.key.toLowerCase() === "o") {
      event.preventDefault();
      runCommand("file.open");
    } else if (event.key.toLowerCase() === "b") {
      event.preventDefault();
      runCommand("view.sidebar");
    } else if (event.key.toLowerCase() === "j") {
      event.preventDefault();
      runCommand("view.bottom");
    }
  });

  palette?.addEventListener("mousedown", (event) => {
    if (event.target === palette) closeCommandPalette();
  });
  document.addEventListener("fullscreenchange", () => options.requestLayoutUpdate());
  document.addEventListener("visual-sml:editor-status", (event) => {
    const detail = (event as CustomEvent<{ message?: string; state?: string }>).detail;
    renderProblems(detail?.message || "", detail?.state || "idle");
  });

  compactLayout.addEventListener("change", () => {
    app.classList.remove("compact-sidebar-open", "compact-code-open");
    options.requestLayoutUpdate();
  });

  options.workspace.addChangeListener(() => scheduleOutlineRender());

  const currentFile = asElement<HTMLElement>("workspaceFileLabel");
  const syncFileLabels = () => {
    const name = currentFile?.textContent?.trim() || "untitled.vsml";
    const titleFile = asElement<HTMLElement>("titleFileLabel");
    const projectFile = asElement<HTMLElement>("projectFileName");
    if (titleFile) titleFile.textContent = name;
    if (projectFile) projectFile.textContent = name;
  };
  if (currentFile) new MutationObserver(syncFileLabels).observe(currentFile, { childList: true, characterData: true, subtree: true });

  const editorStatus = asElement<HTMLElement>("smlConvertStatus");
  renderProblems(editorStatus?.textContent || "", editorStatus?.dataset.state || "idle");

  const windowAny = window as any;
  const previousStatusUpdate = windowAny.visualSmlUpdateStatus;
  windowAny.visualSmlUpdateStatus = (message?: string) => {
    previousStatusUpdate?.(message);
    if (!message) return;
    appendOutput(message);
    const saveState = asElement<HTMLElement>("saveStateLabel");
    if (saveState) {
      if (/autosaved|saved|loaded|ready/i.test(message)) saveState.textContent = "Saved";
      else if (/updated|converted|inserted|cleared/i.test(message)) saveState.textContent = "Modified";
    }
  };

  setResizeToken("--ide-primary-sidebar-width", state.sidebarWidth);
  setResizeToken("--ide-code-panel-width", state.codeWidth);
  setResizeToken("--ide-bottom-panel-height", state.bottomHeight);
  app.classList.toggle("toolbox-hidden", !state.sidebarVisible);
  app.classList.toggle("code-hidden", !state.codeVisible);
  renderActivity();
  renderBottomTab();
  setBottomVisible(state.bottomVisible, false);
  setPerspective(state.perspective, false);
  setRightTab(activeRightTab);
  syncPanelControls();
  syncFileLabels();
  updateHandleValues();
  scheduleOutlineRender();
  appendOutput("Visual SML workbench initialized.");

  document.querySelectorAll<HTMLElement>("[data-renderer-choice]").forEach((button) => {
    button.setAttribute("aria-checked", String(button.dataset.rendererChoice === options.getRendererName()));
  });
  document.querySelectorAll<HTMLElement>("[data-theme-choice]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.themeChoice === root.dataset.theme));
  });
  const rendererStatus = asElement<HTMLElement>("statusRenderer");
  if (rendererStatus) rendererStatus.textContent = options.getRendererName() === "GoropaRenderer" ? "Goropa" : "Macaca Nigra";
  options.requestLayoutUpdate("Visual SML workbench ready.");
}
