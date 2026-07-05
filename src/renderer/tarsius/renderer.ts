/**
 * @fileoverview Custom (legacy/experimental) Tarsius renderer.
 * Not registered with the running workspace; migrated for completeness.
 * Updated for modern Blockly (`Blockly.blockRendering.Renderer`).
 * @author Steven Lolong
 * @copyright 2023.
 */

import * as Blockly from "blockly";
import ConstantProvider from "./constants";

/** Experimental renderer that uses the Tarsius constant provider. */
class TarsiusRenderer extends Blockly.blockRendering.Renderer {
  // highlightConstants_ is assigned dynamically below.
  [key: string]: any;

  /**
   * @param name The registered name of the renderer.
   */
  constructor(name: string) {
    super(name);
  }

  /**
   * Build the constant provider for this renderer.
   * @returns A new Tarsius constant provider.
   */
  makeConstants_() {
    return new ConstantProvider();
  }

  /**
   * Initialise the renderer, including the (legacy) highlight constants.
   * @param theme The workspace theme.
   * @param opt_rendererOverrides Optional renderer overrides.
   */
  init(theme: any, opt_rendererOverrides?: any) {
    super.init(theme, opt_rendererOverrides);
    this.highlightConstants_ = this.makeHighlightConstants_();
    this.highlightConstants_.init();
  }
}

Blockly.blockRendering.register("TarsiusRenderer", TarsiusRenderer as any);

export default TarsiusRenderer;
