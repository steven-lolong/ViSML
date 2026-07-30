import * as Blockly from "blockly";
import downloadScreenshot from "./screenshot";

/**
 * Register the workspace-scoped context-menu items (screenshot + about).
 */
function registWorspaceScopeMenu() {
  const screenshotDownloadMenu = {
    displayText: "Screenshot",
    preconditionFn: function (scope: any) {
      return "enabled";
    },
    callback: function (scope: any) {
      downloadScreenshot(Blockly.getMainWorkspace());
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: "screenshotDownloadMenu",
    weight: 99,
  };

  const aboutMenu = {
    displayText: "About",
    preconditionFn: function (scope: any) {
      return "enabled";
    },
    callback: function (scope: any) {
      const aboutModal = new assets.Modal(document.getElementById("aboutModal"));
      aboutModal.show();
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: "aboutMenu",
    weight: 100,
  };
  Blockly.ContextMenuRegistry.registry.register(screenshotDownloadMenu as any);
  Blockly.ContextMenuRegistry.registry.register(aboutMenu as any);
}

/**
 * Returns the SML grammar categories a block's output can satisfy (e.g.
 * `["exp"]` or `["con", "exp", "pat"]`), taken directly from the output
 * connection's type check. Blocks without an output connection (bare
 * statements) don't produce a grammar-typed value, so this returns null.
 */
function getBlockGrammarTypes(block: Blockly.Block): string[] | null {
  const check = block.outputConnection?.getCheck();
  return check && check.length > 0 ? check : null;
}

/** Anchor point (top-right corner) for a block's type bubble, in workspace coordinates. */
function getTypeBubbleAnchor(block: Blockly.BlockSvg): InstanceType<typeof Blockly.utils.Coordinate> {
  const rect = block.getBoundingRectangle();
  return new Blockly.utils.Coordinate(rect.right, rect.top);
}

/** Toggles a non-editable text bubble showing a block's SML grammar type(s). */
function toggleTypeBubble(block: Blockly.BlockSvg) {
  if (block.typeBubble_) {
    block.typeBubble_.dispose();
    block.typeBubble_ = null;
    if (block.typeBubbleChangeListener_) {
      block.workspace.removeChangeListener(block.typeBubbleChangeListener_);
      block.typeBubbleChangeListener_ = null;
    }
    return;
  }

  const types = getBlockGrammarTypes(block);
  if (!types) return;

  const workspace = block.workspace as Blockly.WorkspaceSvg;
  const bubble = new Blockly.bubbles.TextBubble(
    `Type: ${types.join(" | ")}`,
    workspace,
    getTypeBubbleAnchor(block),
    block.getBoundingRectangle()
  );
  bubble.setColour(block.getColour());
  block.typeBubble_ = bubble;

  const changeListener = (event: Blockly.Events.Abstract) => {
    const blockEvent = event as any;
    if (blockEvent.blockId !== block.id) return;
    if (event.type === Blockly.Events.BLOCK_MOVE) {
      block.typeBubble_?.setAnchorLocation(getTypeBubbleAnchor(block));
    } else if (event.type === Blockly.Events.BLOCK_DELETE) {
      block.typeBubble_?.dispose();
      block.typeBubble_ = null;
      workspace.removeChangeListener(changeListener);
      block.typeBubbleChangeListener_ = null;
    }
  };
  block.typeBubbleChangeListener_ = changeListener;
  workspace.addChangeListener(changeListener);
}

/** Register the block-scoped "Type" context-menu item. */
function registBlockScopeMenu() {
  const blockItem = {
    displayText: "Type",
    preconditionFn: function (scope: any) {
      return getBlockGrammarTypes(scope.block) ? "enabled" : "hidden";
    },
    callback: function (scope: any) {
      toggleTypeBubble(scope.block as Blockly.BlockSvg);
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: "blockType",
    weight: 10,
  };
  Blockly.ContextMenuRegistry.registry.register(blockItem as any);
}

/**
 * Register all custom context-menu options (workspace + block scope).
 */
export function registerFirstContextMenuOptions() {
  registWorspaceScopeMenu();
  registBlockScopeMenu();
}

/**
 * Remove the built-in context-menu items that are not needed in Visual SML.
 */
export function unregisteredUnnecessaryMenu() {
  Blockly.ContextMenuRegistry.registry.unregister("workspaceDelete");
  // Blockly.ContextMenuRegistry.registry.unregister("blockInline");
  Blockly.ContextMenuRegistry.registry.unregister("blockDisable");
}
