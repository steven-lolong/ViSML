import * as Blockly from "blockly";
import getColorByType from "../../seeds/color_definition";
import { yellow_svg } from "../../../ui/svg_picture";

// ==== Begin wildcard
Blockly.Blocks["pat_wildcard"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      )
      .appendField("Any value");
    this.setOutput(true, ["pat"]);
    this.setColour(getColorByType('pattern'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
// ==== End wildcard

// ==== Begin id
Blockly.Blocks["pat_id"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      )
      .appendField(
        new Blockly.FieldDropdown([
          [" ", "nothing"],
          ["op", "operator"],
        ]),
        "OP"
      );
    this.appendValueInput("id").setCheck(["id"]);
    this.setInputsInline(true);
    this.setOutput(true, ["pat"]);
    this.setColour(getColorByType('pattern'));
    this.setTooltip("Variable");
    this.setHelpUrl("");
  },
};
// ==== End id

// ==== Begin long id
Blockly.Blocks["pat_long_id"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      )
      .appendField(
        new Blockly.FieldDropdown([
          [" ", "nothing"],
          ["op", "operator"],
        ]),
        "OP"
      );
    this.appendValueInput("longId").setCheck(["longid"]);
    let options = [
      ["", "nothing"],
      ["pattern", "pattern"],
    ];
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown(options as any, this.validate),
      "patOpt"
    );
    this.setInputsInline(true);
    this.setOutput(true, ["pat"]);
    this.setColour(getColorByType('pattern'));
    this.setTooltip("Construction");
    this.setHelpUrl("");
  },
  validate: function (newValue) {
    this.getSourceBlock().updateConnections(newValue);
    return newValue;
  },
  updateConnections: function (newValue) {
    this.removeInput("PATTERN", /* no error */ true);
    this.removeInput("NOTHING", /* no error */ true);
    if (newValue == "pattern") {
      let options = [
        ["pattern", "pattern"],
        ["", "nothing"],
      ];
      this.appendValueInput("PATTERN")
        .appendField(
          new Blockly.FieldImage(yellow_svg, 5, 20, "*")
        )
        .setCheck(["pat"]);
    } else if (newValue == "nothing") {
      let options = [
        ["", "nothing"],
        ["pattern", "operator"],
      ];
      this.appendDummyInput("NOTHING");
    }
  },
};
// ==== End long id

// ==== Begin infix construction
Blockly.Blocks["pat_infix"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      )
      .appendField("Infix");
    this.appendValueInput("pat_lhs")
      .setCheck("pat")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      );
    this.appendValueInput("id").setCheck("id");
    this.appendValueInput("pat_rhs")
      .setCheck("pat")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      );
    this.setInputsInline(true);
    this.setOutput(true, ["pat"]);
    this.setColour(getColorByType('pattern'));
    this.setTooltip("Infix construction");
    this.setHelpUrl("");
  },
};
// ==== End infix construction

// ==== Begin parentheses
Blockly.Blocks["pat_parentheses"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      )
      .appendField("Parentheses");
    this.appendValueInput("pat")
      .setCheck("pat")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      );
    this.setInputsInline(true);
    this.setOutput(true, ["pat"]);
    this.setColour(getColorByType('pattern'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
// ==== End parentheses

// ==== Begin type annotation
Blockly.Blocks["pat_type_annotation"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      )
      .appendField("Pattern");
    this.appendValueInput("pat")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      )
      .setCheck("pat");
    this.appendDummyInput().appendField("has type");
    this.appendValueInput("typ").setCheck("typ");
    this.appendDummyInput();
    this.setOutput(true, "pat");
    this.setColour(getColorByType('pattern'));
    this.setTooltip("Type annotation");
    this.setHelpUrl("");
  },
};
// ==== End type annotation

// ==== Begin layered
Blockly.Blocks["pat_layered"] = {
  init: function () {
    this.appendValueInput("id")
      .setCheck("id")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      )
      .appendField(
        new Blockly.FieldDropdown([
          [" ", "nothing"],
          ["op", "operator"],
        ]),
        "Op"
      );
    this.appendDummyInput("dumpTyp").appendField(
      new Blockly.FieldCheckbox("TRUE", this.validateTyp),
      "chkTyp"
    );
    this.appendValueInput("inTyp").setCheck("typ").appendField("has type");
    this.appendDummyInput("comma").appendField(",");
    this.appendValueInput("inPat")
      .setCheck("pat")
      .appendField("as")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      );
    this.setInputsInline(true);
    this.setOutput(true, "pat");
    this.setColour(getColorByType('pattern'));
    this.setTooltip("Layered");
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
      this.appendValueInput("inTyp").setCheck("typ").appendField("has type");
      this.appendDummyInput("comma").appendField(",");
      this.moveInputBefore("comma", "inPat");
      this.moveInputBefore("inTyp", "comma");
    } else if (!this.chkTyp && input) {
      this.removeInput("inTyp");
      this.removeInput("comma");
    }
  },
};
// ==== End layered
