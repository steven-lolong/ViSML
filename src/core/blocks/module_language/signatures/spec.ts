import * as Blockly from "blockly";
import getColorByType from "../../../seeds/color_definition";

// Begin spec value
Blockly.Blocks["spec_value"] = {
  init: function () {
    this.appendValueInput("valdesc").setCheck("valdesc").appendField("Value");
    this.setInputsInline(false);
    this.setOutput(true, "spec");
    this.setColour(getColorByType('signature'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

// Begin spec type
Blockly.Blocks["spec_type"] = {
  init: function () {
    this.appendValueInput("typdesc").setCheck("typdesc").appendField("Type");
    this.setInputsInline(false);
    this.setOutput(true, "spec");
    this.setColour(getColorByType('signature'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
// Begin spec equality type
Blockly.Blocks["spec_equality_type"] = {
  init: function () {
    this.appendValueInput("typdesc")
      .setCheck("typdesc")
      .appendField("Equality type");
    this.setInputsInline(false);
    this.setOutput(true, "spec");
    this.setColour(getColorByType('signature'));
    this.setTooltip("Equality type");
    this.setHelpUrl("");
  },
};
// Begin spec type abbreviation
Blockly.Blocks["spec_type_abbreviation"] = {
  init: function () {
    this.appendValueInput("typbind")
      .setCheck("typbind")
      .appendField("Type abbreviation");
    this.setInputsInline(false);
    this.setOutput(true, "spec");
    this.setColour(getColorByType('signature'));
    this.setTooltip("Type abbreviation");
    this.setHelpUrl("");
  },
};
// Begin spec data type
Blockly.Blocks["spec_datatype"] = {
  init: function () {
    this.appendValueInput("datdesc")
      .setCheck("datdesc")
      .appendField("Data type");
    this.setInputsInline(false);
    this.setOutput(true, "spec");
    this.setColour(getColorByType('signature'));
    this.setTooltip("Datan type");
    this.setHelpUrl("");
  },
};
// Begin spec data type replication
Blockly.Blocks["spec_datatype_replication"] = {
  init: function () {
    this.appendDummyInput("NAME").appendField("Replication");
    this.appendValueInput("datId")
      .setCheck("id")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("data type");
    this.appendValueInput("datLongId")
      .setCheck("longid")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("is equal to data type");
    this.setInputsInline(false);
    this.setOutput(true, "spec");
    this.setColour(getColorByType('signature'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
// Begin spec exception
Blockly.Blocks["spec_exception"] = {
  init: function () {
    this.appendValueInput("exndesc")
      .setCheck("exndesc")
      .appendField("exception");
    this.setInputsInline(true);
    this.setOutput(true, "spec");
    this.setColour(getColorByType('signature'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
// Begin spec structure
Blockly.Blocks["spec_structure"] = {
  init: function () {
    this.appendValueInput("strdesc")
      .setCheck("strdesc")
      .appendField("structure");
    this.setInputsInline(true);
    this.setOutput(true, "spec");
    this.setColour(getColorByType('signature'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
