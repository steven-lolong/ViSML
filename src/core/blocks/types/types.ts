import * as Blockly from "blockly";
import getColorByType from "../../seeds/color_definition";

// ==== Begin variable
Blockly.Blocks["typ_var"] = {
  init: function () {
    this.appendValueInput("typ_var")
      .setCheck("var")
      .appendField("Type variable");
    this.setOutput(true, "typ");
    this.setColour(getColorByType('type'));
    this.setTooltip("Type variable");
    this.setHelpUrl("");
  },
};
// ==== End variable

// ==== Begin parentheses
Blockly.Blocks["typ_parentheses"] = {
  init: function () {
    this.appendValueInput("typ").setCheck("typ").appendField("Parentheses");
    this.setOutput(true, "typ");
    this.setColour(getColorByType('type'));
    this.setTooltip("Parentheses");
    this.setHelpUrl("");
  },
};
// ==== End parentheses

// ==== Begin function
Blockly.Blocks["typ_function"] = {
  init: function () {
    this.appendValueInput("from").setCheck("typ");
    this.appendValueInput("to").setCheck("typ").appendField("to");
    this.setInputsInline(true);
    this.setOutput(true, "typ");
    this.setColour(getColorByType('type'));
    this.setTooltip("Function type");
    this.setHelpUrl("");
  },
};

// ==== End function

// ==== Begin list
Blockly.Blocks["typ_list"] = {
  init: function () {
    this.appendValueInput("typ").setCheck("typ");
    this.appendDummyInput().appendField("list");
    this.setInputsInline(true);
    this.setOutput(true, "typ");
    this.setColour(getColorByType('type'));
    this.setTooltip("Type list");
    this.setHelpUrl("");
  },
};

// ==== End list
