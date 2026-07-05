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
 * Register the block-scoped "Type" context-menu item.
 *
 * NOTE: This feature relies on the legacy `Blockly.Bubble` API, which was
 * removed in Blockly v11 (replaced by `Blockly.bubbles.*`). The call sites are
 * cast to `any` so the project compiles; the bubble creation logic still needs
 * to be ported to the new `Blockly.bubbles` API before this menu item will work
 * at runtime.
 */
function registBlockScopeMenu() {
  const BlocklyAny = Blockly as any;
  const blockItem = {
    displayText: "Type",
    preconditionFn: function (scope: any) {
      if (scope.block.hasType) return "enabled";
      return "hidden";
    },
    callback: function (scope: any) {
      let parent_: any = scope.block;
      let mainWS = Blockly.getMainWorkspace();

      Blockly.Events.fire(
        new Blockly.Events.BubbleOpen(parent_, parent_.bubileVisible, "type" as any)
      );
      if (!parent_.bubileVisible) {
        let paragraph_ = BlocklyAny.Bubble.textToDom("Hallo");
        let parentLoc = parent_.getRelativeToSurfaceXY();
        let imgVar = Blockly.utils.svgMath.getRelativeXY(parent_.getSvgRoot());
        let newCoor = new Blockly.utils.Coordinate(parentLoc.x, parentLoc.y);
        parent_.bubble_ = BlocklyAny.Bubble.createNonEditableBubble(
          paragraph_,
          parent_,
          newCoor
        );
        parent_.bubble_.setColour(parent_.style.colourPrimary);
        parent_.bubileVisible = true;
        mainWS.addChangeListener((event: any) => {
          if (
            event.blockID === parent_.blockID &&
            event.__proto__.type === "move"
          ) {
            parent_.setAnchorLocation(event.newCoordinate);
          }
        });
      } else {
        parent_.bubileVisible = false;
        parent_.bubble_.dispose();
        parent_.bubble_ = null;
      }
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
