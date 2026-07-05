import * as Blockly from "blockly";
import getColorByType from "../../../seeds/color_definition";
import { yellow_svg, cyan_svg } from "../../../../ui/svg_picture";
import { reconnect } from "../../../mutator_helper";

// ======= Start fun
Blockly.Blocks["funmatch_infix_n_inhabitant"] = {
  /**
   * Block for creating a list with any number of elements of any dece.
   * @this {Blockly.Block}
   */
  init: function () {
    this.setInputsInline(true);
    this.appendValueInput("exp")
      .setCheck(["exp"])
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("=")
      .appendField(
        new Blockly.FieldImage(cyan_svg, 5, 20, "*")
      );
    this.appendDummyInput("beginning").appendField(
      new Blockly.FieldLabelSerializable("("),
      "openBracket"
    );
    this.appendValueInput("pat1")
      .setCheck("pat")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      );
    this.appendValueInput("id").setCheck("id");
    this.appendValueInput("pat2")
      .setCheck("pat")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      );
    this.appendDummyInput("ending").appendField(
      new Blockly.FieldLabelSerializable(")"),
      "closeBracket"
    );
    this.appendDummyInput("theDoor").appendField(
      new Blockly.FieldCheckbox("TRUE", this.validateTyp),
      "chkTyp"
    );
    this.itemCount_ = 1;
    this.updateShape_();

    this.setColour(getColorByType('declaration'));
    this.setOutput(true, ["funmatch"]);
    this.setMutator(new Blockly.icons.MutatorIcon(["funmatch_infix_n_child"], this));
    this.setTooltip("funmatch infix (n >= 0");
    this.moveInputBefore("exp", null);
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
      this.appendValueInput("inVar").setCheck("typ").appendField("has type ");
      this.moveInputBefore("inVar", "exp");
    } else if (!this.chkTyp && input) {
      this.removeInput("inVar");
    }
  },
  // change on block
  onchange: function () { },

  /**
   * Serialize this block's mutation state to JSON (Blockly v11 standard).
   * @returns The extra state describing the dynamic input count.
   */
  saveExtraState: function () {
    return { itemCount: this.itemCount_ };
  },
  /**
   * Restore this block's mutation state from JSON (Blockly v11 standard).
   * @param state The extra state previously produced by saveExtraState.
   */
  loadExtraState: function (state: any) {
    this.itemCount_ = state["itemCount"];
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this {Blockly.Block}
   */
  decompose: function (workspace) {
    var containerBlock = workspace.newBlock("funmatch_infix_n_child_container");
    containerBlock.initSvg();
    var connection = containerBlock.getInput("STACK").connection;
    for (var i = 0; i < this.itemCount_; i++) {
      var itemBlock = workspace.newBlock("funmatch_infix_n_child");
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  compose: function (containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock("STACK");
    // Count number of inputs.
    var connections = [];
    while (itemBlock) {
      connections.push(itemBlock.valueConnection_);
      itemBlock =
        itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
    // Disconnect any children that don't belong.
    for (var i = 0; i < this.itemCount_; i++) {
      var connection = this.getInput("ADD" + i).connection.targetConnection;
      if (connection && connections.indexOf(connection) == -1) {
        connection.disconnect();
      }
    }
    this.itemCount_ = connections.length;
    this.updateShape_();
    // Reconnect any child blocks.
    for (var i = 0; i < this.itemCount_; i++) {
      reconnect(connections[i], this, "ADD" + i);
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  saveConnections: function (containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock("STACK");
    var i = 0;
    while (itemBlock) {
      var input = this.getInput("ADD" + i);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      i++;
      itemBlock =
        itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
  },
  /**
   * Modify this block to have the correct number of inputs.
   * @private
   * @this {Blockly.Block}
   */
  updateShape_: function () {
    if (this.itemCount_ && this.getInput("EMPTY")) {
      this.removeInput("EMPTY");
    } else if (!this.itemCount_ && !this.getInput("EMPTY")) {
      this.appendDummyInput("EMPTY").appendField("");
    }
    // Add new inputs.
    for (var i = 0; i < this.itemCount_; i++) {
      if (!this.getInput("ADD" + i)) {
        let input = this.appendValueInput("ADD" + i)
          .appendField(
            new Blockly.FieldImage(yellow_svg, 5, 20, "*")
          )
          .setAlign(Blockly.inputs.Align.RIGHT)
          .setCheck("pat");
        if (i > 0) {
          input.appendField(
            new Blockly.FieldLabelSerializable(" "),
            "desc" + i
          );
        }
      }
    }
    // Remove deleted inputs.
    while (this.getInput("ADD" + i)) {
      this.removeInput("ADD" + i);
      i++;
    }
    this.moveInputBefore("exp", null);
    this.moveInputBefore("theDoor", "exp");
    if (this.getInput("inVar")) {
      this.moveInputBefore("inVar", "exp");
    }
    if (this.itemCount_ < 1) {
      this.setFieldValue("", "openBracket");
      this.setFieldValue("", "closeBracket");
    } else {
      this.setFieldValue("(", "openBracket");
      this.setFieldValue(")", "closeBracket");
    }
  },
};

Blockly.Blocks["funmatch_infix_n_child"] = {
  /**
   * Mutator block for adding items.
   * @this {Blockly.Block}
   */
  init: function () {
    this.setColour(getColorByType('declaration_sub'));
    this.appendDummyInput().appendField("Pattern");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip("Pattern");
    this.contextMenu = false;
  },
};

Blockly.Blocks["funmatch_infix_n_child_container"] = {
  /**
   * Mutator block for container.
   * @this {Blockly.Block}
   */
  init: function () {
    this.setColour(getColorByType('declaration'));
    this.appendDummyInput().appendField("Patterns");
    this.appendStatementInput("STACK");
    this.setTooltip("List of pattern");
    this.contextMenu = false;
  },
};
// ===== End fun
