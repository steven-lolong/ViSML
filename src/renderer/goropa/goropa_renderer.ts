/**
 * @fileoverview custom render based on Blockly's base renderer, styled to
 * feel like programming in text code: SML-generator-like line breaks (one
 * line per value/dummy input on every block) with indented inline
 * connectors, top-aligned image cues, flat statement stacking, and
 * monospace fields, while keeping the Macaca Nigra grammar notches on
 * value connections as non-terminal cues
 * @name goropa_renderer
 * @author Steven Lolong
 * @description in ES6 syntax
 * @object "GoropaRenderer"
 * @copyright 2026.
 */

import * as Blockly from "blockly";
import { GoropaConstantProvider } from "./goropa_constant_provider";

class GoropaRenderInfo extends Blockly.blockRendering.RenderInfo {
  constructor(renderer, block) {
    super(renderer, block);
    // Sockets always render inline: a value connector sits right after the
    // fields of its own line (or at the code indent when the line has no
    // fields), instead of being carved into the block's right edge the way
    // external inputs are. Line breaking is handled by shouldStartNewRow_.
    this.isInline = !block.isCollapsed();
  }

  /**
   * Line structure mirrors the generated SML text for every block,
   * regardless of its authored inputsInline flag: each value or dummy
   * input begins a new line, the way the generator places its newlines.
   */
  protected override shouldStartNewRow_(currInput, prevInput?) {
    if (super.shouldStartNewRow_(currInput, prevInput)) return true;
    if (!prevInput) return false;
    return (
      currInput instanceof Blockly.inputs.ValueInput ||
      currInput instanceof Blockly.inputs.DummyInput ||
      prevInput instanceof Blockly.inputs.ValueInput
    );
  }

  /**
   * A line that starts with an input socket is an indented continuation
   * line: the connector's distance from the block's left border plays the
   * role of the SML generator's two-space indentation.
   */
  protected override getInRowSpacing_(prev, next) {
    if (!prev && next && Blockly.blockRendering.Types.isInlineInput(next)) {
      return this.constants_.STATEMENT_INPUT_PADDING_LEFT;
    }
    return super.getInRowSpacing_(prev, next);
  }

  protected override addInput_(input, activeRow) {
    super.addInput_(input, activeRow);
    // Text code is left-aligned; ignore per-input RIGHT/CENTRE alignment.
    activeRow.align = Blockly.inputs.Align.LEFT;
  }

  override getElemCenterline_(row, elem) {
    // Image fields (the colored cues sitting next to input and output
    // connectors) pin to the top of their line like glyphs on the first
    // text line, instead of centering against tall nested blocks.
    if (
      Blockly.blockRendering.Types.isField(elem) &&
      elem.field instanceof Blockly.FieldImage
    ) {
      return row.yPos + elem.height / 2;
    }

    return super.getElemCenterline_(row, elem);
  }
}

class GoropaRenderer extends Blockly.blockRendering.Renderer {
  constructor(name) {
    super(name);
  }

  /**
   * @override
   */
  makeConstants_() {
    return new GoropaConstantProvider();
  }

  /**
   * @override
   */
  makeRenderInfo_(block) {
    return new GoropaRenderInfo(this, block);
  }
}
Blockly.blockRendering.register("GoropaRenderer", GoropaRenderer);
