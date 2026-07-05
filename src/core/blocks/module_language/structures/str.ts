import * as Blockly from "blockly";
import getColorByType from "../../../seeds/color_definition";
import { yellow_svg } from "../../../../ui/svg_picture";

// Begin str_identifier
Blockly.Blocks["str_identifier"] = {
  init: function () {
    this.appendDummyInput().appendField("Identifier");
    this.appendValueInput("longId").setCheck("longid").appendField("");
    this.setInputsInline(true);
    this.setOutput(true, "str");
    this.setColour(getColorByType('structure'));
    this.setTooltip("Identifier");
    this.setHelpUrl("");
  },
};

// Begin str_structure
Blockly.Blocks["str_structure"] = {
  init: function () {
    this.appendValueInput("dec")
      .setCheck("dec")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("Structure")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      );
    this.setInputsInline(false);
    this.setOutput(true, "str");
    this.setColour(getColorByType('structure'));
    this.setTooltip("Structure");
    this.setHelpUrl("");
  },
};
// Begin str_local_declaration
Blockly.Blocks["str_local_declaration"] = {
  init: function () {
    this.appendValueInput("dec")
      .setCheck("dec")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("Declare")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      );
    this.appendValueInput("str")
      .setCheck("str")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("in");
    this.setInputsInline(false);
    this.setOutput(true, "str");
    this.setColour(getColorByType('structure'));
    this.setTooltip("Local declaration");
    this.setHelpUrl("");
  },
};

// Begin transparent annotation
Blockly.Blocks["str_transparent_annotation"] = {
  init: function () {
    this.appendValueInput("str")
      .appendField("Transparent")
      .setCheck("str")
      .appendField(" ");
    this.appendValueInput("sig").appendField("access to").setCheck("sig");
    this.setInputsInline(false);
    this.setOutput(true, "str");
    this.setColour(getColorByType('structure'));
    this.setTooltip("Transparent annotation");
    this.setHelpUrl("");
  },
};

// Begin opaque annotation
Blockly.Blocks["str_opaque_annotation"] = {
  init: function () {
    this.appendValueInput("str")
      .appendField("Opaque")
      .setCheck("str")
      .appendField(" ");
    this.appendValueInput("sig").appendField("access to").setCheck("sig");
    this.setInputsInline(false);
    this.setOutput(true, "str");
    this.setColour(getColorByType('structure'));
    this.setTooltip("Opaque annotation");
    this.setHelpUrl("");
  },
};
// Begin functor application over str
Blockly.Blocks["str_functor_application_str"] = {
  init: function () {
    this.appendValueInput("id").appendField("Apply Functor").setCheck("id");
    this.appendValueInput("str")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("over")
      .setCheck("str");
    this.setInputsInline(false);
    this.setOutput(true, "str");
    this.setColour(getColorByType('structure'));
    this.setTooltip("Functor application");
    this.setHelpUrl("");
  },
};
// Begin functor application over dec
Blockly.Blocks["str_functor_application_dec"] = {
  init: function () {
    this.appendValueInput("id").appendField("Apply Functor").setCheck("id");
    this.appendValueInput("dec")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .setCheck("dec")
      .appendField("over")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      );
    this.setInputsInline(false);
    this.setOutput(true, "str");
    this.setColour(getColorByType('structure'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
