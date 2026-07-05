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
    this.TAB_HEIGHT = 20;
    this.TAB_WIDTH = 15;
    this.ADD_START_HATS = true;
    this.FIELD_TEXT_BASELINE_CENTER = true;
    this.DARK_PATH_OFFSET = 1;
    this.DARK_PATH_OFFSET = 0;

    // geras only
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
