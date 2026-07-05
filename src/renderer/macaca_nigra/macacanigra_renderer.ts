/**
 * @fileoverview custom render
 * @name macacanigra_provider
 * @author Steven Lolong
 * @description in ES6 syntax
 * @object "MNRenderer"
 * @copyright 2023.
 */

import * as Blockly from "blockly";
import { MacacaNigraConstantProvider } from "./macacanigra_constant_provider";

class MacacaNigraRenderInfo extends Blockly.thrasos.RenderInfo {
  private inputHasFieldImage_(input) {
    return input.fieldRow.some((field) => field instanceof Blockly.FieldImage);
  }

  protected override addInput_(input, activeRow) {
    super.addInput_(input, activeRow);

    if (
      input instanceof Blockly.inputs.ValueInput &&
      activeRow.hasExternalInput &&
      this.inputHasFieldImage_(input)
    ) {
      activeRow.align = Blockly.inputs.Align.RIGHT;
    }
  }

  override getElemCenterline_(row, elem) {
    if (
      row.hasExternalInput &&
      Blockly.blockRendering.Types.isField(elem) &&
      elem.parentInput instanceof Blockly.inputs.ValueInput &&
      this.inputHasFieldImage_(elem.parentInput)
    ) {
      return row.yPos + elem.height / 2;
    }

    if (
      this.outputConnection &&
      Blockly.blockRendering.Types.isField(elem) &&
      elem.field instanceof Blockly.FieldImage
    ) {
      return row.yPos + elem.height / 2;
    }

    return super.getElemCenterline_(row, elem);
  }
}

// class MacacaNigraRenderer extends Blockly.blockRendering.Renderer {
class MacacaNigraRenderer extends Blockly.thrasos.Renderer {
  // class MacacaNigraRenderer extends Blockly.geras.Renderer {
  constructor(name) {
    super(name);
  }

  /**
   * @override
   */
  makeConstants_() {
    return new MacacaNigraConstantProvider();
  }

  /**
   * @override
   */
  makeRenderInfo_(block) {
    return new MacacaNigraRenderInfo(this, block);
  }
}
Blockly.blockRendering.register("MNRenderer", MacacaNigraRenderer);
