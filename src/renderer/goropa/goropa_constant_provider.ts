/**
 * @fileoverview custom render constant provider - text-code look
 * @name goropa_constant_provider
 * @author Steven Lolong
 * @description in ES6 syntax
 * @copyright 2026.
 */

import * as Blockly from "blockly";
import { MacacaNigraConstantProvider } from "../macaca_nigra/macacanigra_constant_provider";

/**
 * A flat notch: statement blocks stack flush on top of each other, like
 * consecutive lines in a text editor.
 */
function makeFlatNotch() {
  const width = 6;
  const height = 0;

  function makeMainPath(direction) {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(direction * width, 0),
    ]);
  }

  return {
    width: width,
    height: height,
    pathLeft: makeMainPath(1),
    pathRight: makeMainPath(-1),
  };
}

/**
 * Goropa's text-code look: statement blocks stack flush like lines in a text
 * editor and typography matches the SML code panel, while value connections
 * keep the Macaca Nigra grammar-shaped notches (inherited shapeFor()) as the
 * visual cue that differentiates the non-terminals.
 */
export class GoropaConstantProvider extends MacacaNigraConstantProvider {
  constructor() {
    super();

    // No hats, near-square corners, compact line-height-like spacing.
    this.ADD_START_HATS = false;
    this.CORNER_RADIUS = 2;
    this.MIN_BLOCK_HEIGHT = 18;
    this.NOTCH_WIDTH = 6;
    this.NOTCH_HEIGHT = 0;
    this.NOTCH_OFFSET_LEFT = 8;
    this.BETWEEN_STATEMENT_PADDING_Y = 2;
    this.EXTERNAL_VALUE_INPUT_PADDING = 1;

    // Code indent (~two monospace spaces, like the SML generator): used for
    // statement inputs and for lines that begin with an input socket.
    this.STATEMENT_INPUT_PADDING_LEFT = 16;

    // Empty slots look like a small gap in the text, not a puzzle socket.
    this.EMPTY_INLINE_INPUT_PADDING = 8;
    this.EMPTY_INLINE_INPUT_HEIGHT = 18;

    // Fields render as monospace tokens, matching the SML code panel.
    this.FIELD_BORDER_RECT_RADIUS = 2;
    this.FIELD_TEXT_FONTFAMILY =
      '"SFMono-Regular", Consolas, "Liberation Mono", monospace';
  }

  /**
   * @override
   */
  init() {
    super.init();
    this.FlatNotch = makeFlatNotch();
  }

  /**
   * @override
   * Statement connections render flat so blocks stack like lines of code;
   * value connections keep the grammar-shaped Macaca Nigra notches so users
   * can still tell the non-terminals apart.
   */
  shapeFor(connection) {
    switch (connection.type) {
      case Blockly.PREVIOUS_STATEMENT:
      case Blockly.NEXT_STATEMENT:
        return this.FlatNotch;
      default:
        return super.shapeFor(connection);
    }
  }
}
