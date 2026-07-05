import * as Blockly from "blockly";
import getColorByType from "../../seeds/color_definition";
import { cyan_svg } from "../../../ui/svg_picture";

/** expression of primitive operator */
// ======= Begin arith
Blockly.Blocks["exp_primtv_optr_arith"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      )
      .appendField("Arithmetic");
    this.appendValueInput("exp_1")
      .setCheck("exp")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["+", "+"],
        ["-", "-"],
        ["*", "*"],
        ["/", "/"],
      ]),
      "opt"
    );
    this.appendValueInput("exp_2")
      .setCheck("exp")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.setInputsInline(true);
    this.setOutput(true, ["exp"]);
    this.setColour(getColorByType('operator'));
    this.setTooltip("Arithmetic operators");
    this.setHelpUrl("");
  },
};
// ====== End arith

// ======= Begin logic
Blockly.Blocks["exp_primtv_optr_logic"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      )
      .appendField("Logic");
    this.appendValueInput("exp_1")
      .setCheck("exp")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["<", "<"],
        ["<=", "<="],
        [">", ">"],
        [">=", ">="],
        ["=", "="],
        ["<>", "<>"],
      ]),
      "opt"
    );
    this.appendValueInput("exp_2")
      .setCheck("exp")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.setInputsInline(true);
    this.setOutput(true, ["exp"]);
    this.setColour(getColorByType('operator'));
    this.setTooltip("Arithmetic operators");
    this.setHelpUrl("");
  },
};
// ====== End logic

// ======= Begin record
Blockly.Blocks["exp_primtv_optr_record"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      )
      .appendField("");
    this.appendValueInput("lab_1").setCheck("lab").appendField("Select field");
    this.appendDummyInput().appendField("in");
    this.appendValueInput("exp_1")
      .setCheck("exp")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.setInputsInline(true);
    this.setOutput(true, ["exp"]);
    this.setColour(getColorByType('operator'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
// ====== End record

// ======= Begin list head
Blockly.Blocks["exp_primtv_optr_list_hd"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      )
      .appendField("");
    this.appendValueInput("exp_1")
      .setCheck("exp")
      .appendField("Head")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.setInputsInline(true);
    this.setOutput(true, ["exp"]);
    this.setColour(getColorByType('operator'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
// ====== End list head

// ======= Begin list tail
Blockly.Blocks["exp_primtv_optr_list_tail"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      )
      .appendField("");
    this.appendValueInput("exp_1")
      .setCheck("exp")
      .appendField("Tail")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.setInputsInline(true);
    this.setOutput(true, ["exp"]);
    this.setColour(getColorByType('operator'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
// ====== End list tail
