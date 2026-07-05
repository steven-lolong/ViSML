import * as Blockly from "blockly";
import getColorByType from "../../seeds/color_definition";
import { cyan_svg } from "../../../ui/svg_picture";

Blockly.Blocks["exp_bound"] = {
  init: function () {
    this.appendValueInput("longid")
      .setCheck("longid")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      )
      .appendField("Bound")
      .appendField(
        new Blockly.FieldDropdown([
          [" ", "NON_OP"],
          ["op", "OP"],
        ]),
        "opt"
      )
      .appendField(" ");
    this.setInputsInline(true);
    this.setOutput(true, ["exp"]);
    this.setColour(getColorByType('expression'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
// ====== End bound

// ======= Begin application
Blockly.Blocks["exp_application"] = {
  init: function () {
    this.appendValueInput("exp1")
      .setCheck("exp")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      )
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("Application of")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.appendValueInput("exp2")
      .setCheck("exp")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("over")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.setInputsInline(false);
    this.setOutput(true, "exp");
    this.setColour(getColorByType('expression'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
// ======= End application

// ======= Begin infix application
Blockly.Blocks["exp_infix_application"] = {
  init: function () {
    this.appendValueInput("exp1")
      .setCheck("exp")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      )
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("Infix application")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.appendValueInput("id").setCheck("id");
    this.appendValueInput("exp2")
      .setCheck("exp")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.setInputsInline(true);
    this.setOutput(true, "exp");
    this.setColour(getColorByType('expression'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
// ======= End infix application

// ======= Begin parentheses
Blockly.Blocks["exp_parentheses"] = {
  init: function () {
    this.appendValueInput("exp")
      .setCheck("exp")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      )
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("Parentheses")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.setInputsInline(true);
    this.setOutput(true, "exp");
    this.setColour(getColorByType('expression'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
// ======= End parentheses

// ======= Begin expression with explicit type annotation
Blockly.Blocks["exp_with_type"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      )
      .appendField("Expression");
    this.appendValueInput("exp")
      .setCheck(["exp"])

      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.appendDummyInput().appendField("has type");
    this.appendValueInput("typ").setCheck(["typ"]);
    this.setInputsInline(true);
    this.setOutput(true, ["exp"]);
    this.setColour(getColorByType('expression'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
// ======= End expression with explicit type annotation

// ======= Begin raise
Blockly.Blocks["exp_raise"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      )
      .appendField("Raise");
    this.appendValueInput("exp")
      .setCheck(["exp"])
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.setInputsInline(true);
    this.setOutput(true, ["exp"]);
    this.setColour(getColorByType('expression'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
// ======= End raise

// ======== Begin exception handle
Blockly.Blocks["exp_handle"] = {
  init: function () {
    this.appendValueInput("exp")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      )
      .setCheck(["exp"])
      .appendField("Exception")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.appendValueInput("match")
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("handling")
      .setCheck(["match"]);
    this.setInputsInline(false);
    this.setOutput(true, ["exp"]);
    this.setColour(getColorByType('expression'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
// ======= End exception handle

// ======== Begin andalso
Blockly.Blocks["exp_andalso"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      )
      .appendField(" ");
    this.appendValueInput("exp1")
      .setCheck(["exp"])
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.appendDummyInput().appendField("and also ");
    this.appendValueInput("exp2")
      .setCheck(["exp"])
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.setInputsInline(true);
    this.setOutput(true, ["exp"]);
    this.setColour(getColorByType('expression'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
// ======= End andalso

// ======== Begin orelse
Blockly.Blocks["exp_orelse"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      )
      .appendField(" ");
    this.appendValueInput("exp1")
      .setCheck(["exp"])
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.appendDummyInput().appendField("or else ");
    this.appendValueInput("exp2")
      .setCheck(["exp"])
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.setInputsInline(true);
    this.setOutput(true, ["exp"]);
    this.setColour(getColorByType('expression'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
// ======= End orelse

// ======== Begin if_else
Blockly.Blocks["exp_if_else"] = {
  init: function () {
    this.appendValueInput("if")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      )
      .appendField("Condition of")
      .setCheck(["exp"])
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.appendValueInput("then")
      .setCheck(["exp"])
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("is true ")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.appendValueInput("else")
      .setCheck(["exp"])
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("else ")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.setInputsInline(false);
    this.setOutput(true, ["exp"]);
    this.setColour(getColorByType('expression'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
// ======= End if_else

// ======== Begin while_do
Blockly.Blocks["exp_while_do"] = {
  init: function () {
    this.appendValueInput("while")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      )
      .setCheck(["exp"])
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("While")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.appendValueInput("do")
      .setCheck(["exp"])
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("do ")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.setInputsInline(false);
    this.setOutput(true, ["exp"]);
    this.setColour(getColorByType('expression'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};
// ======= End while_do

// ======== Begin case
Blockly.Blocks["exp_case"] = {
  init: function () {
    this.appendValueInput("case")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      )
      .setCheck(["exp"])
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("Case")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.appendValueInput("of")
      .setCheck(["match"])
      .setAlign(Blockly.inputs.Align.RIGHT);
    this.setInputsInline(false);
    this.setOutput(true, ["exp"]);
    this.setColour(getColorByType('expression'));
    this.setTooltip("Case analysis");
    this.setHelpUrl("");
  },
};
// ======= End case

// ======== Begin fn a.k.a anonymous function a.k.a lambda
Blockly.Blocks["exp_fn"] = {
  init: function () {
    this.appendValueInput("fn")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      )
      .setCheck(["match"])
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("Lamda");
    this.setInputsInline(false);
    this.setOutput(true, ["exp"]);
    this.setColour(getColorByType('expression'));
    this.setTooltip("Lamda is a anonymous function");
    this.setHelpUrl("");
  },
};
// ======= End fn a.k.a anonymous function a.k.a lambda
