import * as Blockly from "blockly";
import getColorByType from "../../seeds/color_definition";
import { cyan_svg } from "../../../ui/svg_picture";

Blockly.Blocks["exprow"] = {
  init: function () {
    this.appendValueInput("lab").setCheck(["lab"]).appendField("Field");
    this.appendValueInput("exp")
      .appendField("=")
      .setCheck(["exp"])
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.setInputsInline(true);
    this.setOutput(true, ["exprow"]);
    this.setColour(getColorByType('expression'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
