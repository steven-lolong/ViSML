import * as Blockly from "blockly";
import getColorByType from "../../../seeds/color_definition";

// Begin sig id
Blockly.Blocks["sig_id"] = {
  init: function () {
    this.appendValueInput("id").setCheck("id").appendField("Identifier");
    this.setInputsInline(true);
    this.setOutput(true, "sig");
    this.setColour(getColorByType('signature'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

// Begin sig signature
Blockly.Blocks["sig_signature"] = {
  init: function () {
    this.appendValueInput("spec")
      .setCheck("spec")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("Signature");
    this.setInputsInline(false);
    this.setOutput(true, "sig");
    this.setColour(getColorByType('signature'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

// Begin sig refinement
Blockly.Blocks["sig_refinement"] = {
  init: function () {
    this.appendValueInput("sig")
      .appendField("Signature Refinement")
      .setCheck("sig");
    this.appendValueInput("typrefin")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .setCheck("typrefin")
      .appendField("where type");
    this.setInputsInline(false);
    this.setOutput(true, "sig");
    this.setColour(getColorByType('signature'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
