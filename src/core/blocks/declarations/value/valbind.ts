import * as Blockly from "blockly";
import getColorByType from "../../../seeds/color_definition";
import { yellow_svg, cyan_svg } from "../../../../ui/svg_picture";

// ==== Begin type
Blockly.Blocks["valbind"] = {
  init: function () {
    this.appendValueInput("pat")
      .setCheck("pat")
      .appendField(
        new Blockly.FieldDropdown([
          ["", ""],
          ["rec", "rec"],
        ]),
        "recVal"
      )
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      );
    this.appendValueInput("exp")
      .setCheck("exp")
      .appendField("=")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.setInputsInline(true);
    this.setOutput(true, "valbind");
    this.setColour(getColorByType('declaration'));
    this.setTooltip("Value binding");
    this.setHelpUrl("");
  },
};
// ==== End type
