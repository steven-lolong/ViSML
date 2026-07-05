import * as Blockly from "blockly";
import { toolbox } from "./toolbox";
import { getGrammarTooltip } from "../core/blocks/grammar_tooltips";

/**
 * Renders a custom HTML toolbox (matching the web-ide-template look) into the
 * left column from the existing Blockly toolbox definition.
 *
 * Each toolbox item shows the REAL rendered Blockly block (an SVG snapshot of
 * the actual block model, like the native flyout) plus a text description.
 * Items can be clicked (inserted at a cascading position) or dragged onto the
 * workspace canvas (inserted at the drop location).
 *
 * Using the shared `toolbox` definition keeps a single source of truth.
 */

/** SVG namespace for building standalone preview svgs. */
const SVG_NS = "http://www.w3.org/2000/svg";

/** Cascading offset (in workspace units) for click-inserted blocks. */
let insertOffset = 0;

/** The block type currently being dragged from the toolbox (drag-and-drop). */
let draggingType: string | null = null;

const CATEGORY_ICONS: Record<string, string> = {
  Program: "P",
  Constant: "C",
  Identitfiers: "I",
  Identifiers: "I",
  Expression: "E",
  Pattern: "M",
  Type: "T",
  Structure: "S",
  Signature: "G",
  Declaration: "D",
  Operator: "O",
  "Lambda & Case": "λ",
  List: "[]",
  Tuple: "()",
  Record: "{}",
};

/**
 * Turn a block type id into a human-readable description label,
 * e.g. "exp_let_in_end" -> "Exp Let In End".
 * @param type The Blockly block type id.
 * @returns A title-cased, space-separated label.
 */
function humanize(type: string): string {
  return type
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Render the given block type once in the workspace, snapshot its SVG into a
 * standalone <svg> sized to the block, then dispose the temporary block. This
 * produces an accurate preview of the real block model for the toolbox.
 * @param workspace The workspace used to render the block (events should be off).
 * @param type The block type id.
 * @returns A standalone SVG element, or null if the block could not be rendered.
 */
function renderBlockPreview(workspace: any, type: string): SVGSVGElement | null {
  let block: any = null;
  let svg: SVGSVGElement | null = null;
  try {
    block = workspace.newBlock(type);
    if (block.initSvg) block.initSvg();
    if (block.render) block.render();

    const root: SVGGElement = block.getSvgRoot();
    const bbox = root.getBBox();
    if (!bbox || !bbox.width || !bbox.height) {
      return null;
    }

    const pad = 3;
    svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
    svg.setAttribute("class", "toolbox-preview-svg");
    svg.setAttribute(
      "viewBox",
      `${-pad} ${-pad} ${bbox.width + pad * 2} ${bbox.height + pad * 2}`
    );
    svg.setAttribute("width", String(Math.ceil(bbox.width + pad * 2)));
    svg.setAttribute("height", String(Math.ceil(bbox.height + pad * 2)));

    const clone = root.cloneNode(true) as SVGGElement;
    clone.removeAttribute("transform");
    clone.setAttribute("transform", `translate(${-bbox.x}, ${-bbox.y})`);
    // Drop references to workspace-scoped filters/clips so the standalone svg
    // renders cleanly without the workspace's <defs>.
    clone.querySelectorAll("[filter]").forEach((el) => el.removeAttribute("filter"));
    clone.querySelectorAll("[clip-path]").forEach((el) => el.removeAttribute("clip-path"));
    clone.style.removeProperty("display");
    svg.appendChild(clone);
  } catch (e) {
    svg = null;
  } finally {
    if (block) {
      try {
        block.dispose(false);
      } catch (_e) {
        /* ignore */
      }
    }
  }
  return svg;
}

/**
 * Create a block of the given type in the workspace, render it, optionally place
 * it at explicit workspace coordinates, and select it.
 * @param workspace The target workspace.
 * @param type The block type id to create.
 * @param at Optional workspace coordinates (used for drag-and-drop drops).
 */
function createBlock(workspace: any, type: string, at?: { x: number; y: number }): void {
  Blockly.Events.setGroup(true);
  try {
    const block: any = workspace.newBlock(type);
    if (block.initSvg) block.initSvg();
    if (block.render) block.render();
    if (at) {
      block.moveTo(new Blockly.utils.Coordinate(at.x, at.y));
    } else {
      insertOffset = (insertOffset + 28) % 220;
      block.moveBy(48 + insertOffset, 48 + insertOffset);
    }
    if (block.select) block.select();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("Could not insert block:", type, e);
  } finally {
    Blockly.Events.setGroup(false);
  }
}

/**
 * Convert a pointer/drop screen position into workspace coordinates.
 * @param workspace The target workspace.
 * @param clientX The screen X.
 * @param clientY The screen Y.
 * @returns Workspace coordinates for the dropped block.
 */
function screenToWorkspace(workspace: any, clientX: number, clientY: number): { x: number; y: number } {
  const coord = Blockly.utils.svgMath.screenToWsCoordinates(
    workspace,
    new Blockly.utils.Coordinate(clientX, clientY)
  );
  return { x: coord.x, y: coord.y };
}

/**
 * Count the number of leaf block items contained in a toolbox node (recursive).
 * @param contents The contents array of a category/toolbox.
 * @returns The total number of block items.
 */
function countBlocks(contents: any[]): number {
  let n = 0;
  for (const item of contents || []) {
    if (item.kind === "block") n += 1;
    else if (item.kind === "category") n += countBlocks(item.contents);
  }
  return n;
}

/**
 * Build a single, draggable block button that shows the real rendered block.
 * @param workspace The workspace used both to render the preview and to insert.
 * @param type The block type id.
 * @param colour The accent colour from the owning category.
 * @returns The button element.
 */
function makeBlockButton(workspace: any, type: string, colour: string): HTMLElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "toolbox-block";
  btn.setAttribute("data-type", type);
  btn.setAttribute("draggable", "true");
  btn.setAttribute("aria-label", "Add " + humanize(type) + " block");
  const tooltip = getGrammarTooltip(type);
  if (tooltip) btn.title = tooltip;

  // Description text (kept as requested).
  const label = document.createElement("span");
  label.className = "toolbox-label";
  label.textContent = humanize(type);

  // Real block model preview (falls back to the type text if rendering fails).
  const preview = document.createElement("span");
  preview.className = "toolbox-preview";
  const svg = renderBlockPreview(workspace, type);
  if (svg) {
    preview.appendChild(svg);
  } else {
    preview.classList.add("is-text");
    preview.textContent = type;
    if (colour) preview.style.borderColor = colour;
  }

  btn.appendChild(label);
  btn.appendChild(preview);

  // Click to insert (cascading position).
  btn.addEventListener("click", () => createBlock(workspace, type));

  // Drag to insert (dropped at the cursor position).
  btn.addEventListener("dragstart", (ev: DragEvent) => {
    draggingType = type;
    if (ev.dataTransfer) {
      ev.dataTransfer.setData("text/plain", type);
      ev.dataTransfer.effectAllowed = "copy";
    }
  });
  btn.addEventListener("dragend", () => {
    draggingType = null;
  });

  return btn;
}

/**
 * Recursively render a category (and its nested categories/blocks).
 * @param workspace The workspace to render previews into / insert from.
 * @param category The category node from the toolbox definition.
 * @param depth Nesting depth (top-level categories start expanded).
 * @returns A <details> accordion element.
 */
function renderCategory(workspace: any, category: any, depth: number): HTMLElement {
  const details = document.createElement("details");
  details.className = "toolbox-category";
  details.setAttribute("data-category", category.name || "Category");
  details.setAttribute("data-depth", String(depth));
  // Categories are collapsed by default (click a category to expand it).

  const summary = document.createElement("summary");
  const icon = document.createElement("span");
  icon.className = "category-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = CATEGORY_ICONS[category.name] || "•";
  const name = document.createElement("span");
  name.className = "category-title";
  name.textContent = category.name || "Category";
  const count = document.createElement("span");
  count.className = "category-count";
  count.textContent = String(countBlocks(category.contents));
  if (category.colour) count.style.borderColor = category.colour;
  summary.appendChild(icon);
  summary.appendChild(name);
  summary.appendChild(count);
  details.appendChild(summary);

  const body = document.createElement("div");
  body.className = "toolbox-blocks";
  for (const item of category.contents || []) {
    if (item.kind === "block") {
      body.appendChild(makeBlockButton(workspace, item.type, category.colour));
    } else if (item.kind === "category") {
      body.appendChild(renderCategory(workspace, item, depth + 1));
    }
  }
  details.appendChild(body);
  return details;
}

/**
 * Wire the workspace canvas as a drop target so toolbox blocks can be dragged
 * onto it. The dropped block is created at the cursor's workspace coordinates.
 * @param workspace The target workspace.
 */
function enableWorkspaceDrop(workspace: any): void {
  const dropZone: HTMLElement | null =
    (workspace.getInjectionDiv && workspace.getInjectionDiv()) ||
    document.getElementById("tarsiusWorkspaceDiv");
  if (!dropZone) return;

  dropZone.addEventListener("dragover", (ev: DragEvent) => {
    if (draggingType) {
      ev.preventDefault();
      if (ev.dataTransfer) ev.dataTransfer.dropEffect = "copy";
    }
  });

  dropZone.addEventListener("drop", (ev: DragEvent) => {
    const type =
      draggingType ||
      (ev.dataTransfer ? ev.dataTransfer.getData("text/plain") : "");
    if (!type) return;
    ev.preventDefault();
    const at = screenToWorkspace(workspace, ev.clientX, ev.clientY);
    createBlock(workspace, type, at);
    draggingType = null;
  });
}

/**
 * Build the full HTML toolbox into the `#htmlToolbox` container (rendering real
 * block previews) and enable drag-and-drop onto the workspace.
 * @param workspace The Blockly workspace used for previews and insertion.
 */
export function buildHtmlToolbox(workspace: any): void {
  const container = document.getElementById("htmlToolbox");
  if (!container) return;
  container.innerHTML = "";

  // Disable events while rendering preview blocks so the temporary blocks do
  // not trigger code generation or undo history.
  Blockly.Events.disable();
  try {
    for (const item of (toolbox as any).contents || []) {
      if (item.kind === "category") {
        container.appendChild(renderCategory(workspace, item, 0));
      }
    }
  } finally {
    Blockly.Events.enable();
  }

  enableWorkspaceDrop(workspace);
}
