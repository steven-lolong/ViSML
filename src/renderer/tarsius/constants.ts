import * as Blockly from "blockly";

/**
 * Custom constant provider for the (legacy/experimental) Tarsius renderer.
 *
 * NOTE: This renderer is not registered with the running workspace (the app
 * uses the Macaca Nigra renderer). It is migrated here for completeness.
 * Updated for modern Blockly: the base class moved from the (never-public)
 * `Blockly.BaseConstantProvider` to `Blockly.blockRendering.ConstantProvider`.
 */
export class ConstantProvider extends Blockly.blockRendering.ConstantProvider {
  // Custom constants are assigned dynamically; type them loosely.
  [key: string]: any;

  /** @package */
  constructor() {
    super();
    this.FIELD_TEXT_BASELINE_CENTER = false;
    // The dark/shadow path is the normal block path translated down+right one.
    this.DARK_PATH_OFFSET = 1;
    // Max width of a bottom row that follows an inline statement input.
    this.MAX_BOTTOM_WIDTH = 30;
    this.STATEMENT_BOTTOM_SPACER = -this.NOTCH_HEIGHT / 2;
  }

  /**
   * Append the insertion-marker CSS rules to the base renderer CSS.
   * @param selector The CSS selector prefix for this renderer.
   * @returns The full list of CSS rules.
   */
  getCSS_(selector: any) {
    return super.getCSS_(selector).concat([
      selector + " .blocklyInsertionMarker>.blocklyPathLight,",
      selector + " .blocklyInsertionMarker>.blocklyPathDark {",
      "fill-opacity: " + this.INSERTION_MARKER_OPACITY + ";",
      "stroke: none;",
      "}",
    ]);
  }
}

export default ConstantProvider;
