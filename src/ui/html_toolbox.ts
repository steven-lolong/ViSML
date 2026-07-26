import * as Blockly from "blockly";
import { toolbox } from "./toolbox";
import { getGrammarTooltip } from "../core/blocks/grammar_tooltips";

/**
 * Renders the custom HTML toolbox into the left sidebar from the shared Blockly
 * toolbox definition, so the category tree has a single source of truth.
 *
 * Presentation follows the Block-Lambda-Calculus toolbox:
 *   - every category (and sub-category) is a <details> disclosure whose summary
 *     is `icon | title | count | chevron`, with the chevron rotating when open;
 *   - every block is a bordered card carrying a label and a grammar description;
 *   - blocks are inserted by click, or dragged onto the workspace with a pointer
 *     drag that shows a ghost of the card and highlights the drop target.
 *
 * ViSML keeps one thing the reference does not have: the card's visual is an SVG
 * snapshot of the REAL rendered Blockly block, not a stand-in icon. Category
 * accent colours come from the toolbox definition's `colour` (the same value the
 * blocks are painted with), so the sidebar cannot drift from the workspace.
 *
 * The category/sub-category structure itself is defined in ./toolbox.ts and is
 * rendered verbatim — this module only decides how it looks and behaves.
 */

/** SVG namespace for building standalone preview svgs. */
const SVG_NS = "http://www.w3.org/2000/svg";

/** Distance (px) the pointer must travel before a click becomes a drag. */
const DRAG_THRESHOLD = 7;

/** Cascading offset (in workspace units) for click-inserted blocks. */
let insertOffset = 0;

/** Sprite icon id (minus the `icon-` prefix) used for each category name. */
const CATEGORY_ICONS: Record<string, string> = {
  Program: "program",
  Constant: "constant",
  Identitfiers: "identifier",
  Identifiers: "identifier",
  Expression: "expression",
  Pattern: "pattern",
  Type: "type",
  Structure: "structure",
  Signature: "signature",
  Declaration: "declaration",
  Operator: "operator",
  "Lambda & Case": "lambda",
  List: "list",
  Tuple: "tuple",
  Record: "record",
  Specification: "spec",
  Value: "value",
  "Value (Variable)": "value",
  Function: "function",
  "Data type": "datatype",
  Exception: "exception",
};

/**
 * Build a sprite-backed icon element.
 * @param name The sprite symbol name, without the `icon-` prefix.
 * @param className An extra class for sizing/colouring in context.
 * @returns An <svg> referencing the shared sprite.
 */
function createIcon(name: string, className?: string): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
  svg.classList.add("app-icon");
  if (className) svg.classList.add(className);
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const use = document.createElementNS(SVG_NS, "use");
  use.setAttribute("href", `#icon-${name}`);
  svg.appendChild(use);
  return svg;
}

/**
 * Turn a block type id into a human-readable label,
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
 * The one-line description shown under a card's label: the block's grammar
 * production with the "Grammar: " prefix dropped, falling back to the raw type
 * id when no production is registered for the block.
 * @param type The Blockly block type id.
 * @returns The description text.
 */
function describeBlock(type: string): string {
  const tooltip = getGrammarTooltip(type);
  if (!tooltip) return type;
  return tooltip.replace(/^Grammar:\s*/, "");
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

/** State for the card currently being pointer-dragged out of the toolbox. */
type ActiveDrag = {
  type: string;
  pointerId: number;
  originX: number;
  originY: number;
  source: HTMLElement;
  ghost: HTMLElement | null;
  didDrag: boolean;
};

let activeDrag: ActiveDrag | null = null;

/**
 * Set after a drag finishes so the browser's synthetic click on the source card
 * does not insert a second block at the cascading position.
 */
let suppressNextClick = false;

/**
 * The element the toolbox drops onto: the workspace panel, falling back to the
 * Blockly injection div when the panel wrapper is not present.
 * @param workspace The target workspace.
 * @returns The drop surface element, or null.
 */
function getDropSurface(workspace: any): HTMLElement | null {
  return (
    document.querySelector<HTMLElement>(".workspace-panel") ||
    (workspace.getInjectionDiv && workspace.getInjectionDiv()) ||
    document.getElementById("tarsiusWorkspaceDiv")
  );
}

/**
 * Whether the pointer is currently over the workspace, so a release there should
 * insert the block. The ghost is ignored during the hit test because it follows
 * the cursor and would otherwise always be the topmost element.
 * @param clientX The pointer X.
 * @param clientY The pointer Y.
 * @param surface The drop surface.
 * @returns True when the pointer is over the workspace.
 */
function isOverWorkspace(clientX: number, clientY: number, surface: HTMLElement): boolean {
  const ghost = activeDrag?.ghost;
  const previous = ghost?.style.pointerEvents;
  if (ghost) ghost.style.pointerEvents = "none";
  const element = document.elementFromPoint(clientX, clientY);
  if (ghost && previous !== undefined) ghost.style.pointerEvents = previous;

  if (element?.closest(".blocklySvg, .workspace-panel")) return true;
  const rect = surface.getBoundingClientRect();
  return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
}

/**
 * Begin a pointer drag from a toolbox card. Movement under the drag threshold is
 * still treated as a click, so the card keeps its click-to-insert behaviour.
 * @param event The originating pointerdown.
 * @param card The source card.
 * @param type The block type id.
 * @param workspace The target workspace.
 */
function startDrag(event: PointerEvent, card: HTMLElement, type: string, workspace: any): void {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  const surface = getDropSurface(workspace);
  if (!surface) return;

  activeDrag = {
    type,
    pointerId: event.pointerId,
    originX: event.clientX,
    originY: event.clientY,
    source: card,
    ghost: null,
    didDrag: false,
  };
  card.classList.add("is-pointer-ready");

  const cleanup = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onCancel);
  };

  const endDrag = () => {
    if (!activeDrag) return null;
    const drag = activeDrag;
    activeDrag = null;
    drag.source.classList.remove("is-pointer-ready", "is-dragging");
    drag.ghost?.remove();
    surface.classList.remove("is-drag-over");
    return drag;
  };

  const onMove = (moveEvent: PointerEvent) => {
    if (!activeDrag || activeDrag.pointerId !== moveEvent.pointerId) return;
    const distance = Math.hypot(moveEvent.clientX - activeDrag.originX, moveEvent.clientY - activeDrag.originY);
    if (!activeDrag.didDrag && distance < DRAG_THRESHOLD) return;

    if (!activeDrag.ghost) {
      const ghost = card.cloneNode(true) as HTMLElement;
      ghost.classList.add("toolbox-drag-ghost");
      ghost.removeAttribute("id");
      ghost.setAttribute("aria-hidden", "true");
      document.body.appendChild(ghost);
      activeDrag.ghost = ghost;
      activeDrag.didDrag = true;
      card.classList.add("is-dragging");
    }

    activeDrag.ghost.style.transform = `translate3d(${moveEvent.clientX + 14}px, ${moveEvent.clientY + 14}px, 0)`;
    surface.classList.toggle("is-drag-over", isOverWorkspace(moveEvent.clientX, moveEvent.clientY, surface));
    moveEvent.preventDefault();
  };

  const onUp = (upEvent: PointerEvent) => {
    if (!activeDrag || activeDrag.pointerId !== upEvent.pointerId) return;
    const overWorkspace = activeDrag.didDrag && isOverWorkspace(upEvent.clientX, upEvent.clientY, surface);
    const drag = endDrag();
    cleanup();
    if (!drag?.didDrag) return;

    // The click that follows this release belongs to the drag, not to an insert.
    suppressNextClick = true;
    window.setTimeout(() => {
      suppressNextClick = false;
    }, 0);

    if (!overWorkspace) return;
    createBlock(workspace, drag.type, screenToWorkspace(workspace, upEvent.clientX, upEvent.clientY));
  };

  const onCancel = () => {
    endDrag();
    cleanup();
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onCancel);
}

/**
 * Build a single block card: label, grammar description, and a preview of the
 * real rendered block. Clicking inserts at a cascading position; dragging
 * inserts wherever the card is dropped on the workspace.
 * @param workspace The workspace used both to render the preview and to insert.
 * @param type The block type id.
 * @returns The card element.
 */
function makeBlockCard(workspace: any, type: string): HTMLElement {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "toolbox-block-card";
  card.dataset.blockType = type;
  card.setAttribute("aria-label", `Add ${humanize(type)} block`);

  const text = document.createElement("span");
  text.className = "toolbox-block-text";

  const label = document.createElement("span");
  label.className = "toolbox-block-label";
  label.textContent = humanize(type);

  const description = document.createElement("span");
  description.className = "toolbox-block-description";
  description.textContent = describeBlock(type);

  text.appendChild(label);
  text.appendChild(description);

  const preview = document.createElement("span");
  preview.className = "toolbox-preview";
  const svg = renderBlockPreview(workspace, type);
  if (svg) {
    preview.appendChild(svg);
  } else {
    preview.classList.add("is-text");
    preview.textContent = type;
  }

  card.appendChild(preview);
  card.appendChild(text);

  card.addEventListener("pointerdown", (event) => startDrag(event, card, type, workspace));
  card.addEventListener("click", () => {
    if (suppressNextClick) return;
    createBlock(workspace, type);
  });

  return card;
}

/**
 * Recursively render a category (and its nested categories/blocks) as a
 * disclosure. Sub-categories use the same summary layout as top-level ones and
 * inherit the parent's accent colour unless they declare their own.
 * @param workspace The workspace to render previews into / insert from.
 * @param category The category node from the toolbox definition.
 * @param depth Nesting depth (0 for top-level categories).
 * @returns A <details> accordion element.
 */
function renderCategory(workspace: any, category: any, depth: number): HTMLElement {
  const name = category.name || "Category";
  const details = document.createElement("details");
  details.className = "toolbox-category";
  details.dataset.category = name;
  details.dataset.depth = String(depth);
  if (category.colour) details.style.setProperty("--category-accent", category.colour);
  // Categories are collapsed by default (click a category to expand it).

  const summary = document.createElement("summary");
  summary.append(
    createIcon(CATEGORY_ICONS[name] || "blocks", "category-icon"),
    Object.assign(document.createElement("span"), {
      className: "category-title",
      textContent: name,
    }),
    Object.assign(document.createElement("span"), {
      className: "category-count",
      textContent: String(countBlocks(category.contents)),
    }),
    createIcon("chevron-right", "toolbox-disclosure-icon")
  );
  details.appendChild(summary);

  const body = document.createElement("div");
  body.className = "toolbox-blocks";
  for (const item of category.contents || []) {
    if (item.kind === "block") {
      body.appendChild(makeBlockCard(workspace, item.type));
    } else if (item.kind === "category") {
      body.appendChild(renderCategory(workspace, item, depth + 1));
    }
  }
  details.appendChild(body);
  return details;
}

/**
 * Build the full HTML toolbox into the `#htmlToolbox` container, rendering real
 * block previews for every card.
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
}
