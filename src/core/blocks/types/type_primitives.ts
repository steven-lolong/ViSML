import * as Blockly from "blockly";
import getColorByType from "../../seeds/color_definition";

//** Primitive type */
Blockly.Blocks["typ_primtv"] = {
  init: function () {
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["Integer", "int"],
        ["Word", "word"],
        ["Real", "real"],
        ["Character", "char"],
        ["String", "string"],
        ["Boolean", "bool"],
      ]),
      "type"
    );
    this.setOutput(true, "typ");
    this.setColour(getColorByType('type'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
