import * as Blockly from "blockly";
import { intLiteral, realLiteral, wordLiteral } from "../preservation/lexical";
import getColorByType from "../seeds/color_definition";
import { yellow_cyan_svg } from "../../ui/svg_picture";

Blockly.Blocks["con_int"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldImage(yellow_cyan_svg, 5, 25, "*")
      )
      .appendField("Integer")
      .appendField(new Blockly.FieldTextInput("0", intLiteral), "inputValue");
    this.setOutput(true, ["con", "exp", "pat"]);
    this.setColour(getColorByType('constant'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["con_string"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldImage(yellow_cyan_svg, 5, 25, "*")
      )
      .appendField("String")
      .appendField(new Blockly.FieldTextInput(""), "inputValue");
    this.setOutput(true, ["con", "exp", "pat"]);
    this.setColour(getColorByType('constant'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["con_char"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldImage(yellow_cyan_svg, 5, 25, "*")
      )
      .appendField("Character")
      .appendField(new Blockly.FieldTextInput(""), "inputValue");
    this.setOutput(true, ["con", "exp", "pat"]);
    this.setColour(getColorByType('constant'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

/**
 * The real literal is held as ONE text field carrying the literal exactly as
 * written, not as a (whole, fraction) pair of numbers. The pair is not
 * injective: `3.05` and `3.5` both reduce to (3, 5), so the fraction's leading
 * zeros \u2014 and with them the original terminal \u2014 are unrecoverable. Storing the
 * literal itself is what makes reconstruction a lookup rather than a guess.
 */
Blockly.Blocks["con_float"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new Blockly.FieldImage(yellow_cyan_svg, 5, 25, "*"))
      .appendField("Real")
      .appendField(new Blockly.FieldTextInput("0.0", realLiteral), "inputValue");
    this.setOutput(true, ["con", "exp", "pat"]);
    this.setColour(getColorByType('constant'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["con_word"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldImage(yellow_cyan_svg, 5, 25, "*")
      )
      .appendField("Word")
      .appendField(new Blockly.FieldTextInput("0w0", wordLiteral), "inputValue");
    this.setOutput(true, ["con", "exp", "pat"]);
    this.setColour(getColorByType('constant'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
