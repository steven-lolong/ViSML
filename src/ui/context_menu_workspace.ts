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

/** Expose the unavailable type inspector honestly without invoking legacy UI. */
function registBlockScopeMenu() {
  const blockItem = {
    displayText: "Type information unavailable",
    preconditionFn: function (scope: any) {
      if (scope.block.hasType) return "disabled";
      return "hidden";
    },
    callback: function () { /* Disabled until a real type-information provider exists. */ },
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
