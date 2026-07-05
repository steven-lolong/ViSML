import * as Blockly from "blockly";
import getColorByType from "../seeds/color_definition";
import { yellow_cyan_svg } from "../../ui/svg_picture";

Blockly.Blocks["con_int"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldImage(yellow_cyan_svg, 5, 25, "*")
      )
      .appendField("Integer")
      .appendField(new Blockly.FieldNumber(0, -Infinity, Infinity, 1), "inputValue");
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

Blockly.Blocks["con_float"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldImage(yellow_cyan_svg, 5, 25, "*")
      )
      .appendField("Real")
      .appendField(new Blockly.FieldNumber(0, -Infinity, Infinity, 1), "NAME")
      .appendField("\u2022")
      .appendField(new Blockly.FieldNumber(0, 0), "inputValue");
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
      .appendField(new Blockly.FieldNumber(0, 0, Infinity, 1), "inputValue");
    this.setOutput(true, ["con", "exp", "pat"]);
    this.setColour(getColorByType('constant'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
