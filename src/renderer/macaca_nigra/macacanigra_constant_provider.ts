/**
 * @fileoverview custom render constant provider
 * @name macacanigra_constant_provider
 * @author Steven Lolong
 * @description in ES6 syntax
 * @copyright 2023.
 */

import * as Blockly from "blockly";
import * as vNotch from "./horizontal_notchs_standard";
import { makeVerticalSquare } from "./vartical_notch";

// export class MacacaNigraConstantProvider extends Blockly.blockRendering
//   .ConstantProvider {
export class MacacaNigraConstantProvider extends Blockly.blockRendering
  .ConstantProvider {
  // Custom notch/shape objects are assigned dynamically in init().
  [key: string]: any;
  constructor() {
    super();

    /**
     * @override
     */
    this.NOTCH_WIDTH = 15;
    this.NOTCH_HEIGHT = 7;
    this.CORNER_RADIUS = 8;
    // Scaled down from 20/15 to match the ~10-unit scale every other
    // connector shape in this family uses (see horizontal_notchs_standard.ts).
    // At 20/15 the stock puzzle tab -- the only shape here left unstyled,
    // used for "valbind" -- rendered noticeably larger than its siblings
    // instead of matching their scale.
    this.TAB_HEIGHT = 10;
    this.TAB_WIDTH = 10;
    this.ADD_START_HATS = true;
    this.START_HAT_HEIGHT = 5;
    this.START_HAT_WIDTH = 82;
    this.FIELD_TEXT_BASELINE_CENTER = true;
    this.DARK_PATH_OFFSET = 1;
    this.DARK_PATH_OFFSET = 0;

    // geras only

    // Stock Blockly padding is tuned for the default ~15-tall puzzle-tab/notch
    // look; this renderer's connector shapes (and the padding scale below)
    // are already smaller, so the stock gaps around them read as oversized.
    this.SMALL_PADDING = 2;
    this.MEDIUM_PADDING = 3;
    this.MEDIUM_LARGE_PADDING = 5;
    this.LARGE_PADDING = 6;
    this.STATEMENT_INPUT_PADDING_LEFT = 10;
    this.BETWEEN_STATEMENT_PADDING_Y = 3;
    // These are derived from the padding constants above inside the base
    // provider's own constructor, which already ran (via super(), above)
    // before the overrides just above took effect -- so they're still
    // holding the stock values and must be re-derived here by hand, the
    // same way the base class derives them.
    this.TOP_ROW_MIN_HEIGHT = this.MEDIUM_PADDING;
    this.TOP_ROW_PRECEDES_STATEMENT_MIN_HEIGHT = this.LARGE_PADDING;
    this.BOTTOM_ROW_MIN_HEIGHT = this.MEDIUM_PADDING;
    this.BOTTOM_ROW_AFTER_STATEMENT_MIN_HEIGHT = this.LARGE_PADDING;
    this.TALL_INPUT_FIELD_OFFSET_Y = this.MEDIUM_PADDING;
  }

  /**
   * The hat standing above every block with no previous connection (chiefly
   * the main "Program" block) — same technique as Block-MNL-Dev's Kolintang
   * renderer, which stands "MNL" above its main-file block, applied here to
   * spell "ViSML" above ViSML's program root.
   *
   * Unlike Kolintang, this glyph needs no self-intersecting path trickery:
   * every letter (and the "i"'s dot) is a simple (non-crossing) closed loop
   * entered and left at the same point, so the outline can detour into it,
   * walk all the way around, and rejoin the baseline (or, for the dot, the
   * stem) before moving on — it never doubles back through ink already
   * drawn, so `fill-rule: evenodd` is not required for correctness here.
   * @override
   */
  makeStartHat() {
    const height = this.START_HAT_HEIGHT;
    const width = this.START_HAT_WIDTH;
    const p = Blockly.utils.svgPaths.point;

    const path = Blockly.utils.svgPaths.line([
      // hat start -> V
      p(4, 0),
      // V, entered/left at the point where its outer strokes meet
      p(7, -18), p(-4, 0), p(-3, 10), p(-3, -10), p(-4, 0), p(7, 18),
      // V -> i (stem)
      p(11, 0),
      // i's stem, entered/left at its bottom-left corner
      p(0, -12), p(4, 0), p(0, 12), p(-4, 0),
      // stem -> i's dot
      p(0, -14),
      // i's dot, entered/left at its bottom-left corner
      p(0, -4), p(4, 0), p(0, 4), p(-4, 0),
      // dot -> baseline (retraces the stem->dot bridge back down, then runs
      // along the baseline like every other inter-letter bridge — a diagonal
      // straight to S's entry looked correct on paper but, unlike a bridge
      // that retraces an existing edge or runs flush with the baseline,
      // it doesn't coincide with anything already drawn, so it enclosed and
      // filled a visible wedge instead of staying invisible)
      p(0, 14),
      // baseline -> S
      p(8, 0),
      // S, entered/left at its bottom-left corner
      p(0, -2), p(8, 0), p(0, -6), p(-8, 0), p(0, -10), p(10, 0), p(0, 2),
      p(-8, 0), p(0, 6), p(8, 0), p(0, 10), p(-10, 0),
      // S -> M
      p(14, 0),
      // M, entered/left at its bottom-left corner. The valley notch dives
      // almost all the way to the baseline (16 of the 18-unit leg height) so
      // the gap between the legs reads as clearly transparent rather than
      // leaving a solid wedge that makes the M look like a filled trapezoid.
      p(0, -18), p(4, 0), p(5, 16), p(5, -16), p(4, 0), p(0, 18), p(-18, 0),
      // M -> L
      p(22, 0),
      // L, entered/left at its bottom-left corner
      p(0, -18), p(4, 0), p(0, 14), p(8, 0), p(0, 4), p(-12, 0),
      // L -> hat end
      p(16, 0),
    ]);

    return { height, width, path };
  }

  /**
   * @override
   */

  init() {
    super.init();
    // horizontal notch
    this.HorzSquare = vNotch.makeHorzSquare(); // id
    this.HorzRectangle = vNotch.makeHorzRectangle(); // longid
    this.HorzTriangle = vNotch.makeHorzTriangle(); // typ
    this.HorzHalfSquareTop = vNotch.makeHorzHalfSquareTop(); // var
    this.HorzHalfSquareBottom = vNotch.makeHorzHalfSquareBottom(); //longvar
    this.HorzPentagon = vNotch.makeHorzPentagon(); // con, exp, pat
    this.HorzRevPentagon = vNotch.makeHorzRevPentagon(); // prog, dec
    this.HorzRevTriangle = vNotch.makeHorzRevTringle(); // match
    this.HorzHexagon = vNotch.makeHorzHexagon(); // typbind
    this.HorzSevenAngel = vNotch.makeHorzSevenAngel(); // datbind
    this.HorzTrapeze = vNotch.makeHorzTrapeze(); // funmatch
    this.HorzParallelogramTop = vNotch.makeHorzParallelogramTop(); // patrow
    this.HorzParallelogramBottom = vNotch.makeHorzParallelogramBottom(); // exprow

    // horizontal block notch model
    this.HorzBlockTopTriangle = vNotch.makeHorzBlockTopTriangle(); // conbind
    this.HorzBlockBottomTriangle = vNotch.makeHorzBlockBottomTriangle(); // exnbind
    this.HorzBlockLeftTriangle = vNotch.makeHorzBlockLeftTriangle(); // lab

    // horizontal arrow notch model
    this.HorzPuzzleTab = this.PUZZLE_TAB; // valbind
    this.HorzHammer = vNotch.makeHorzHammer(); // str
    this.HorzHammerWithTriangle = vNotch.makeHorzHammerWithTriangle(); // condesc
    this.HorzHalfHammerTop = vNotch.makeHorzHalfHammerTop(); //typrefin
    this.HorzHalfHammerBottom = vNotch.makeHorzHalfHammerBottom(); // valdesc
    this.HorzHalfHammerRevBottom = vNotch.makeHorzHalfHammerRevBottom(); // typdesc
    this.HorzHalfHammerRevTop = vNotch.makeHorzHalfHammerRevTop(); // datdesc
    this.HorzCross = vNotch.makeHorzCross(); // strbind
    this.HorzArrow = vNotch.makeHorzArrow(); // sig
    this.HorzRevArrow = vNotch.makeHorzRevArrow(); //spec
    this.HorzArrowDiamond = vNotch.makeHorzArrowDiamond(); // exndesc
    this.HorzArrowRevDiamond = vNotch.makeHorzArrowRevDiamond(); // strdec
    this.HorzHammerMdl1 = vNotch.makeHorzHammerMdl1(); // fctbind
    this.HorzHammerMdl2 = vNotch.makeHorzHammerMdl2(); // sigbind

    // vertical notch
    this.VerSquare = this.makeNotch();
  }
  /**
   * @override
   * shaping the notch
   */
  shapeFor(connection) {
    const checks = connection.getCheck();
    switch (connection.type) {
      case Blockly.INPUT_VALUE:
        if (checks && checks.indexOf("exp") != -1) {
          // return this.HorzPentagon;
          return this.HorzArrow;
        }
        if (checks && checks.indexOf("pat") != -1) {
          // return this.HorzPentagon;
          return this.HorzArrow;
        }
        if (checks && checks.indexOf("con") != -1) {
          // return this.HorzPentagon;
          return this.HorzArrow;
        }
        if (checks && checks.indexOf("id") != -1) {
          return this.HorzSquare;
        }
        if (checks && checks.indexOf("var") != -1) {
          return this.HorzHalfSquareTop;
        }
        if (checks && checks.indexOf("longvar") != -1) {
          return this.HorzHalfSquareBottom;
        }
        if (checks && checks.indexOf("longid") != -1) {
          return this.HorzRectangle;
        }
        if (checks && checks.indexOf("lab") != -1) {
          return this.HorzBlockLeftTriangle;
        }
        if (checks && checks.indexOf("exprow") != -1) {
          return this.HorzParallelogramBottom;
        }
        if (checks && checks.indexOf("dec") != -1) {
          return this.HorzRevPentagon;
        }
        if (checks && checks.indexOf("program") != -1) {
          return this.HorzRevPentagon;
        }
        if (checks && checks.indexOf("typ") != -1) {
          return this.HorzTriangle;
        }
        if (checks && checks.indexOf("match") != -1) {
          return this.HorzRevTriangle;
        }
        if (checks && checks.indexOf("patrow") != -1) {
          return this.HorzParallelogramTop;
        }
        if (checks && checks.indexOf("valbind") != -1) {
          return this.HorzPuzzleTab;
        }
        if (checks && checks.indexOf("funmatch") != -1) {
          return this.HorzTrapeze;
        }
        if (checks && checks.indexOf("typbind") != -1) {
          return this.HorzHexagon;
        }
        if (checks && checks.indexOf("datbind") != -1) {
          return this.HorzSevenAngel;
        }
        if (checks && checks.indexOf("conbind") != -1) {
          return this.HorzBlockTopTriangle;
        }
        if (checks && checks.indexOf("exnbind") != -1) {
          return this.HorzBlockBottomTriangle;
        }
        // module language
        if (checks && checks.indexOf("str") != -1) {
          return this.HorzHammer;
        }
        if (checks && checks.indexOf("strbind") != -1) {
          return this.HorzCross;
        }
        if (checks && checks.indexOf("sig") != -1) {
          // return this.HorzArrow;
          return this.HorzPentagon;
        }
        if (checks && checks.indexOf("typrefin") != -1) {
          return this.HorzHalfHammerTop;
        }
        if (checks && checks.indexOf("spec") != -1) {
          return this.HorzRevArrow;
        }
        if (checks && checks.indexOf("valdesc") != -1) {
          return this.HorzHalfHammerBottom;
        }
        if (checks && checks.indexOf("typdesc") != -1) {
          return this.HorzHalfHammerRevBottom;
        }
        if (checks && checks.indexOf("datdesc") != -1) {
          return this.HorzHalfHammerRevTop;
        }
        if (checks && checks.indexOf("condesc") != -1) {
          return this.HorzHammerWithTriangle;
        }
        if (checks && checks.indexOf("exndesc") != -1) {
          return this.HorzArrowDiamond;
        }
        if (checks && checks.indexOf("strdesc") != -1) {
          return this.HorzArrowRevDiamond;
        }
        if (checks && checks.indexOf("fctbind") != -1) {
          return this.HorzHammerMdl1;
        }
        if (checks && checks.indexOf("sigbind") != -1) {
          return this.HorzHammerMdl2;
        }
        return this.HorzTriangle;
      case Blockly.OUTPUT_VALUE:
        if (checks && checks.indexOf("exp") != -1) {
          // return this.HorzPentagon;
          return this.HorzArrow;
        }
        if (checks && checks.indexOf("pat") != -1) {
          // return this.HorzPentagon;
          return this.HorzArrow;
        }
        if (checks && checks.indexOf("con") != -1) {
          // return this.HorzPentagon;
          return this.HorzArrow;
        }
        if (checks && checks.indexOf("id") != -1) {
          return this.HorzSquare;
        }
        if (checks && checks.indexOf("var") != -1) {
          return this.HorzHalfSquareTop;
        }
        if (checks && checks.indexOf("longvar") != -1) {
          return this.HorzHalfSquareBottom;
        }
        if (checks && checks.indexOf("longid") != -1) {
          return this.HorzRectangle;
        }
        if (checks && checks.indexOf("lab") != -1) {
          return this.HorzBlockLeftTriangle;
        }
        if (checks && checks.indexOf("exprow") != -1) {
          return this.HorzParallelogramBottom;
        }
        if (checks && checks.indexOf("dec") != -1) {
          return this.HorzRevPentagon;
        }
        if (checks && checks.indexOf("program") != -1) {
          return this.HorzRevPentagon;
        }
        if (checks && checks.indexOf("typ") != -1) {
          return this.HorzTriangle;
        }
        if (checks && checks.indexOf("match") != -1) {
          return this.HorzRevTriangle;
        }
        if (checks && checks.indexOf("patrow") != -1) {
          return this.HorzParallelogramTop;
        }
        if (checks && checks.indexOf("funmatch") != -1) {
          return this.HorzTrapeze;
        }
        if (checks && checks.indexOf("typbind") != -1) {
          return this.HorzHexagon;
        }
        if (checks && checks.indexOf("datbind") != -1) {
          return this.HorzSevenAngel;
        }
        if (checks && checks.indexOf("valbind") != -1) {
          return this.HorzPuzzleTab;
        }
        if (checks && checks.indexOf("conbind") != -1) {
          return this.HorzBlockTopTriangle;
        }
        if (checks && checks.indexOf("exnbind") != -1) {
          return this.HorzBlockBottomTriangle;
        }
        // module language
        if (checks && checks.indexOf("str") != -1) {
          return this.HorzHammer;
        }
        if (checks && checks.indexOf("strbind") != -1) {
          return this.HorzCross;
        }
        // update here
        if (checks && checks.indexOf("sig") != -1) {
          // return this.HorzArrow;
          return this.HorzPentagon;
        }
        if (checks && checks.indexOf("typrefin") != -1) {
          return this.HorzHalfHammerTop;
        }
        if (checks && checks.indexOf("spec") != -1) {
          return this.HorzRevArrow;
        }
        if (checks && checks.indexOf("valdesc") != -1) {
          return this.HorzHalfHammerBottom;
        }
        if (checks && checks.indexOf("typdesc") != -1) {
          return this.HorzHalfHammerRevBottom;
        }
        if (checks && checks.indexOf("datdesc") != -1) {
          return this.HorzHalfHammerRevTop;
        }
        if (checks && checks.indexOf("condesc") != -1) {
          return this.HorzHammerWithTriangle;
        }
        if (checks && checks.indexOf("exndesc") != -1) {
          return this.HorzArrowDiamond;
        }
        if (checks && checks.indexOf("strdesc") != -1) {
          return this.HorzArrowRevDiamond;
        }
        if (checks && checks.indexOf("fctbind") != -1) {
          return this.HorzHammerMdl1;
        }
        if (checks && checks.indexOf("sigbind") != -1) {
          return this.HorzHammerMdl2;
        }
        return this.HorzTriangle;
      case Blockly.PREVIOUS_STATEMENT:
        return this.VerSquare;
      case Blockly.NEXT_STATEMENT:
        return this.VerSquare;
      default:
        throw Error("Unknown type");
    }
  }
}
