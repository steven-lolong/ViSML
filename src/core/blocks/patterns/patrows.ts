import * as Blockly from "blockly";
import getColorByType from "../../seeds/color_definition";
import { yellow_svg } from "../../../ui/svg_picture";

// ==== Begin wildcard
Blockly.Blocks["patrow_wildcard"] = {
  init: function () {
    this.appendDummyInput().appendField("Any field");
    this.setInputsInline(true);
    this.setOutput(true, ["patrow"]);
    this.setColour(getColorByType('pattern'));
    this.setTooltip("Wildcard of field");
    this.setHelpUrl("");
  },
};
// ==== End wildcard

// ==== Begin lab=pat
Blockly.Blocks["patrow_lab_pat"] = {
  init: function () {
    this.appendValueInput("lab").setCheck("lab");
    this.appendDummyInput().appendField("=");
    this.appendValueInput("pat")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      )
      .setCheck("pat");
    this.setInputsInline(true);
    this.setOutput(true, "patrow");
    this.setColour(getColorByType('pattern'));
    this.setTooltip("pattern");
    this.setHelpUrl("");
  },
};
// ==== End lab=pat

// ==== Begin variable
Blockly.Blocks["patrow_variable"] = {
  init: function () {
    this.appendValueInput("id").setCheck("id");
    this.appendDummyInput("dumpTyp").appendField(
      new Blockly.FieldCheckbox("TRUE", this.validateTyp),
      "chkTyp"
    );
    this.appendValueInput("inTyp").setCheck("typ").appendField("has type");
    this.appendDummyInput("dumpAs").appendField(
      new Blockly.FieldCheckbox("TRUE", this.validateAs),
      "chkAs"
    );
    this.appendValueInput("inPat")
      .setCheck("pat")
      .appendField("as")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      );
    this.setInputsInline(true);
    this.setOutput(true, "patrow");
    this.setColour(getColorByType('pattern'));
    this.setTooltip("variable");
    this.setHelpUrl("");
  },
  validateTyp: function (newValue) {
    let sourceBlock = this.getSourceBlock();
    sourceBlock.chkTyp = newValue == "TRUE";
    sourceBlock.updateTextFieldTyp();

    return newValue;
  },

  updateTextFieldTyp: function () {
    let input = this.getInput("inTyp");
    if (this.chkTyp && !input) {
      this.appendValueInput("inTyp").setCheck("typ").appendField(":");
      this.moveInputBefore("inTyp", "dumpAs");
    } else if (!this.chkTyp && input) {
      this.removeInput("inTyp");
    }
  },
  validateAs: function (newValue) {
    let sourceBlock = this.getSourceBlock();
    sourceBlock.chkAs = newValue == "TRUE";
    sourceBlock.updateTextFieldAs();

    return newValue;
  },

  updateTextFieldAs: function () {
    let input = this.getInput("inPat");
    if (this.chkAs && !input) {
      this.appendValueInput("inPat")
        .setCheck("pat")
        .appendField("as")
        .appendField(
          new Blockly.FieldImage(yellow_svg, 5, 20, "*")
        );
      this.moveInputBefore("inPat", null);
    } else if (!this.chkAs && input) {
      this.removeInput("inPat");
    }
  },
};
// ==== End variable
