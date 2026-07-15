/**
 * @fileoverview Live SML code editor for the Code tab.
 *
 * Mirrors the editable code tab of Block-Lambda-Calculus: the textarea and
 * the workspace are kept in sync in both directions.
 *  - Typing SML is debounced, parsed (core/parser/sml_to_visml) and converted
 *    into workspace blocks, with parse feedback in the status line.
 *  - Workspace edits regenerate the SML text into the editor, unless the
 *    user is currently editing there (focus check plus a short suppression
 *    window after an import), so the editor never fights the user's caret.
 */

import hljs from "highlight.js";
import sml from "highlight.js/lib/languages/sml";
import { SmlParseError } from "../core/parser/sml_to_visml";

const IMPORT_DEBOUNCE_MS = 450;
const SYNC_SUPPRESSION_MS = 1500;

let textArea: HTMLTextAreaElement | null = null;
let highlightArea: HTMLElement | null = null;
let lineNumberArea: HTMLElement | null = null;
let statusArea: HTMLElement | null = null;
let convert: ((source: string) => void) | null = null;

let importTimer: number | undefined;
let applyingEditorText = false;
let suppressSyncUntil = 0;

/** Remove the generated banner comment so the editor shows plain code. */
function stripGeneratedBanner(code: string): string {
  return code.replace(/^\s*\(\*[\s\S]*?\*\)\s*\n?/, "");
}

/** True when the text contains something other than whitespace/comments. */
function hasSmlContent(text: string): boolean {
  return text.replace(/\(\*[\s\S]*?\*\)/g, "").trim().length > 0;
}

function setEditorStatus(message: string, state: "idle" | "ok" | "error" = "idle") {
  if (!statusArea) return;
  statusArea.textContent = message;
  if (state === "idle") {
    statusArea.removeAttribute("data-state");
  } else {
    statusArea.dataset.state = state;
  }
  document.dispatchEvent(new CustomEvent("visual-sml:editor-status", {
    detail: { message, state },
  }));
}

function updateEditorHighlight() {
  if (!textArea || !highlightArea) return;
  const highlighted = hljs.highlight(textArea.value, { language: "sml" }).value;
  // A trailing newline keeps the overlay the same height as the textarea.
  highlightArea.innerHTML = highlighted + "\n";
  updateEditorLineNumbers();
  syncEditorHighlightScroll();
}

function updateEditorLineNumbers() {
  if (!textArea || !lineNumberArea) return;
  const lineCount = Math.max(1, textArea.value.split("\n").length);
  lineNumberArea.textContent = Array.from({ length: lineCount }, (_, index) => index + 1).join("\n");
}

function syncEditorHighlightScroll() {
  if (!textArea || !highlightArea) return;
  highlightArea.style.transform =
    `translate(${-textArea.scrollLeft}px, ${-textArea.scrollTop}px)`;
  if (lineNumberArea) lineNumberArea.style.transform = `translateY(${-textArea.scrollTop}px)`;
}

/** Notify the native editor/highlight pair after its containing panel changes. */
export function layoutSmlCodeEditor() {
  syncEditorHighlightScroll();
}

function describeParseError(error: unknown, source: string): string {
  if (error instanceof SmlParseError) {
    const line = source.slice(0, error.position).split("\n").length;
    return `${error.message.replace(/ at character \d+\.$/, "")} (line ${line}).`;
  }
  return error instanceof Error ? error.message : "SML could not be converted.";
}

/**
 * Parse the editor content and rebuild the workspace blocks.
 * @param options.reportEmpty Show a status hint when there is nothing to convert.
 * @returns True when the conversion succeeded.
 */
export function applySmlEditorText(options: { reportEmpty?: boolean } = {}): boolean {
  if (!textArea || !convert) return false;
  const source = textArea.value;

  if (!hasSmlContent(source)) {
    setEditorStatus(options.reportEmpty ? "Enter SML code before converting." : "", "idle");
    return false;
  }

  try {
    applyingEditorText = true;
    try {
      convert(source);
    } finally {
      applyingEditorText = false;
    }
    suppressSyncUntil = Date.now() + SYNC_SUPPRESSION_MS;
    setEditorStatus("Converted SML into workspace blocks.", "ok");
    return true;
  } catch (error) {
    console.error(error);
    setEditorStatus(describeParseError(error, source), "error");
    return false;
  }
}

function scheduleSmlImport() {
  if (!textArea) return;
  if (importTimer !== undefined) window.clearTimeout(importTimer);
  updateEditorHighlight();
  setEditorStatus(hasSmlContent(textArea.value) ? "Parsing..." : "", "idle");
  importTimer = window.setTimeout(() => {
    importTimer = undefined;
    applySmlEditorText();
  }, IMPORT_DEBOUNCE_MS);
}

/**
 * Mirror freshly generated SML into the editor. Called after every workspace
 * change; skipped while the user is editing so their text is never replaced.
 */
export function syncSmlEditorFromCode(code: string) {
  if (!textArea) return;
  if (applyingEditorText || Date.now() < suppressSyncUntil) return;
  if (document.activeElement === textArea) return;
  forceSyncSmlEditorFromCode(code);
}

/** Unconditionally replace the editor content with the generated SML. */
export function forceSyncSmlEditorFromCode(
  code: string,
  options: { preserveStatus?: boolean } = {}
) {
  if (!textArea) return;
  if (importTimer !== undefined) {
    window.clearTimeout(importTimer);
    importTimer = undefined;
  }
  const editable = stripGeneratedBanner(code).replace(/\s+$/, "");
  textArea.value = editable ? editable + "\n" : "";
  updateEditorHighlight();
  if (!options.preserveStatus) {
    setEditorStatus(editable ? "Synchronized from workspace." : "", "idle");
  }
}

/**
 * Wire the Code tab editor. Safe to call once at startup; if the editor
 * elements are missing the module silently disables itself.
 * @param options.convertSmlToBlocks Parses SML text and rebuilds the workspace.
 */
export function initSmlCodeEditor(options: { convertSmlToBlocks: (source: string) => void }) {
  textArea = document.getElementById("smlSourceArea") as HTMLTextAreaElement | null;
  highlightArea = document.getElementById("smlEditorHighlight");
  lineNumberArea = document.getElementById("smlEditorLineNumbers");
  statusArea = document.getElementById("smlConvertStatus");
  convert = options.convertSmlToBlocks;
  if (!textArea) return;

  hljs.registerLanguage("sml", sml);
  textArea.addEventListener("input", scheduleSmlImport);
  textArea.addEventListener("scroll", syncEditorHighlightScroll);
  updateEditorHighlight();
}
