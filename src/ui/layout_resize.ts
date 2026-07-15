import * as Blockly from "blockly";

const LAYOUT_REQUEST_EVENT = "visual-sml:layout-request";

export interface LayoutResizeCoordinator {
  request(message?: string): void;
  dispose(): void;
}

interface LayoutResizeOptions {
  workspace: Blockly.WorkspaceSvg;
  layoutCodeEditor?: () => void;
  updateStatus?: (message?: string) => void;
}

/** Keep viewport-bound CSS, Blockly, and editor geometry in one resize cycle. */
export function createLayoutResizeCoordinator(
  options: LayoutResizeOptions
): LayoutResizeCoordinator {
  let resizeFrame = 0;
  let pendingMessage: string | undefined;

  const updateViewportHeight = () => {
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    document.documentElement.style.setProperty(
      "--viewport-height",
      `${viewportHeight}px`
    );
  };

  const flush = () => {
    resizeFrame = 0;
    updateViewportHeight();
    Blockly.svgResize(options.workspace);
    options.layoutCodeEditor?.();
    options.updateStatus?.(pendingMessage);
    pendingMessage = undefined;
  };

  const request = (message?: string) => {
    if (message !== undefined) pendingMessage = message;
    updateViewportHeight();
    if (resizeFrame) return;
    resizeFrame = window.requestAnimationFrame(flush);
  };

  const handleLayoutRequest = (event: Event) => {
    request((event as CustomEvent<{ message?: string }>).detail?.message);
  };
  const handleResize = () => request();

  window.addEventListener(LAYOUT_REQUEST_EVENT, handleLayoutRequest);
  window.addEventListener("resize", handleResize, false);
  window.addEventListener("orientationchange", handleResize, false);
  window.visualViewport?.addEventListener("resize", handleResize, false);

  const resizeObserver = typeof ResizeObserver === "undefined"
    ? null
    : new ResizeObserver(() => request());

  ["app", "divMainRow", "blocklyArea", "textBasedCodeDiv"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) resizeObserver?.observe(element);
  });

  request();

  return {
    request,
    dispose() {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeObserver?.disconnect();
      window.removeEventListener(LAYOUT_REQUEST_EVENT, handleLayoutRequest);
      window.removeEventListener("resize", handleResize, false);
      window.removeEventListener("orientationchange", handleResize, false);
      window.visualViewport?.removeEventListener("resize", handleResize, false);
    },
  };
}
