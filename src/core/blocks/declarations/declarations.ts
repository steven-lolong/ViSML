import * as Blockly from "blockly";
import getColorByType from "../../seeds/color_definition";
import { yellow_svg } from "../../../ui/svg_picture";

// ==== Begin type
Blockly.Blocks["dec_type"] = {
  init: function () {
    this.appendValueInput("typbind")
      .setCheck("typbind")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      )
      .appendField("type");
    this.setOutput(true, "dec");
    this.setColour(getColorByType('declaration'));
    this.setTooltip("Data type");
    this.setHelpUrl("");
  },
};
// ==== End type

// ==== Begin data type replication
Blockly.Blocks["dec_datatype_replication"] = {
  init: function () {
    this.appendValueInput("id")
      .setCheck("id")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      )
      .appendField("Data type");
    this.appendValueInput("longid")
      .setCheck("longid")
      .appendField(" = Data type  ");
    this.setOutput(true, "dec");
    this.setInputsInline(true);
    this.setColour(getColorByType('declaration'));
    this.setTooltip("Data type replication");
    this.setHelpUrl("");
  },
};
// ==== End data type replication

// ==== Begin datatype
Blockly.Blocks["dec_datatype_bind"] = {
  init: function () {
    this.appendValueInput("datbind")
      .setCheck("datbind")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      )
      .appendField("Datatype  ");
    this.appendDummyInput().appendField(
      new Blockly.FieldCheckbox("TRUE", this.validateTyp),
      "chkTyp"
    );
    this.setInputsInline(true);
    this.setOutput(true, "dec");
    this.setColour(getColorByType('declaration'));
    this.setTooltip("Data type constructor");
    this.setHelpUrl("");
  },
  validateTyp: function (newValue) {
    let sourceBlock = this.getSourceBlock();
    sourceBlock.chkTyp = newValue == "TRUE";
    sourceBlock.updateTextFieldTyp();

    return newValue;
  },

  updateTextFieldTyp: function () {
    let input = this.getInput("inVar");
    if (this.chkTyp && !input) {
      this.appendValueInput("inVar")
        .setCheck("typbind")
        .appendField("with type ");
      this.moveInputBefore("inVar", null);
    } else if (!this.chkTyp && input) {
      this.removeInput("inVar");
    }
  },
};
// ==== End datatype

// ==== Begin abstype
Blockly.Blocks["dec_abstype"] = {
  init: function () {
    this.appendValueInput("datbind")
      .setCheck("datbind")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      )
      .appendField("Abstract type  ");
    this.appendDummyInput("wth")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField(
        new Blockly.FieldCheckbox("FALSE", this.validateTyp),
        "chkTyp"
      )
      .appendField("has type");
    this.appendValueInput("withDec")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("with ")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      )
      .setCheck("dec");
    this.setInputsInline(false);
    this.setOutput(true, "dec");
    this.setColour(getColorByType('declaration'));
    this.setTooltip("Abstract type constructor");
    this.setHelpUrl("");
    this.moveInputBefore("withDec", null);
  },
  validateTyp: function (newValue) {
    let sourceBlock = this.getSourceBlock();
    sourceBlock.chkTyp = newValue == "TRUE";
    sourceBlock.updateTextFieldTyp();

    return newValue;
  },

  updateTextFieldTyp: function () {
    let input = this.getInput("inVar");
    if (this.chkTyp && !input) {
      this.appendValueInput("inVar")
        .setCheck("datbind")
        .appendField(
          new Blockly.FieldCheckbox("TRUE", this.validateTyp),
          "chkTyp"
        )
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField("has type  ");
      this.removeInput("wth");
      this.moveInputBefore("withDec", null);
      this.moveInputBefore("inVar", "withDec");
    } else if (!this.chkTyp && input) {
      this.removeInput("inVar");
      this.appendDummyInput("wth")
        .setAlign(Blockly.inputs.Align.RIGHT)

        .appendField(
          new Blockly.FieldCheckbox("FALSE", this.validateTyp),
          "chkTyp"
        )
        .appendField("has type");
      this.moveInputBefore("wth", "withDec");
    }
  },
};
// ==== End abstype

// ==== Begin exception
Blockly.Blocks["dec_exception"] = {
  init: function () {
    this.appendValueInput("exnbind")
      .setCheck("exnbind")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      )
      .appendField("Exception ");
    this.setOutput(true, "dec");
    this.setInputsInline(true);
    this.setColour(getColorByType('declaration'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
// ==== End exception

// ==== Begin structure
Blockly.Blocks["dec_structure"] = {
  init: function () {
    this.appendValueInput("strbind")
      .setCheck("strbind")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      )
      .appendField("Structure");
    this.setOutput(true, "dec");
    this.setInputsInline(true);
    this.setColour(getColorByType('declaration'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
// ==== End structure

// ==== Begin data local
Blockly.Blocks["dec_local"] = {
  init: function () {
    this.appendValueInput("local")
      .setCheck("dec")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      )
      .appendField("Declaration of")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      );

    this.appendValueInput("in")
      .setCheck("dec")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("in ")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      );
    this.setOutput(true, "dec");
    this.setInputsInline(false);
    this.setColour(getColorByType('declaration'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
// ==== End data local
