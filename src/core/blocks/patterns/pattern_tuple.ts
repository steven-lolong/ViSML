import * as Blockly from "blockly";
import getColorByType from "../../seeds/color_definition";
import { yellow_svg } from "../../../ui/svg_picture";
import { reconnect } from "../../mutator_helper";

// tuple constructor
Blockly.Blocks["pat_tuple"] = {
  /**
   * Block for creating a tuple with any number of elements of any type.
   * @this {Blockly.Block}
   */
  init: function () {
    this.itemCount_ = 2;
    this.updateShape_();
    this.setInputsInline(false);
    // this.appendDummyInput('seq_end').setAlign(Blockly.inputs.Align.RIGHT).appendField(")");
    this.appendDummyInput("secondType")
      .appendField(
        new Blockly.FieldImage(yellow_svg, 5, 20, "*")
      )
      .appendField("Tuple");
    this.setColour(getColorByType('pattern'));
    this.setOutput(true, ["pat"]);
    this.setTooltip("tuple of pattern");
    this.setMutator(new Blockly.icons.MutatorIcon(["pat_tuple_child"], this));
    if (this.getInput("ADD0")) {
      this.moveInputBefore("secondType", "ADD0");
    }
  },
  // change on block
  onchange: function () {
    if (this.itemCount_ == 1) {
      this.itemCount_ = 2;
      this.updateShape_();
    }
  },

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
    var containerBlock = workspace.newBlock("pat_tuple_child_container");
    containerBlock.initSvg();
    var connection = containerBlock.getInput("STACK").connection;
    for (var i = 0; i < this.itemCount_; i++) {
      var itemBlock = workspace.newBlock("pat_tuple_child");
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
      this.appendDummyInput("EMPTY").appendField("Empty");
      this.moveInputBefore("EMPTY", null);
    }
    // Add new inputs.
    for (var i = 0; i < this.itemCount_; i++) {
      if (!this.getInput("ADD" + i)) {
        var input = this.appendValueInput("ADD" + i)
          .setAlign(Blockly.inputs.Align.RIGHT)
          .setCheck(["pat"]);
        input.appendField(
          new Blockly.FieldImage(yellow_svg, 5, 20, "*")
        );
        // this.moveInputBefore("ADD" + i, "seq_end");
      }
    }
    // Remove deleted inputs.
    while (this.getInput("ADD" + i)) {
      this.removeInput("ADD" + i);
      i++;
    }
  },
};

Blockly.Blocks["pat_tuple_child"] = {
  /**
   * Mutator block for adding items.
   * @this {Blockly.Block}
   */
  init: function () {
    this.setColour(getColorByType('pattern_sub'));
    this.appendDummyInput().appendField("pattern");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip("Inhabitant of tuple");
    this.contextMenu = false;
  },
};

Blockly.Blocks["pat_tuple_child_container"] = {
  /**
   * Mutator block for container.
   * @this {Blockly.Block}
   */
  init: function () {
    this.setColour(getColorByType('pattern'));
    this.appendDummyInput().appendField("Tuple");
    this.appendStatementInput("STACK");
    this.setTooltip("Number of tuple");
    this.contextMenu = false;
  },
};
