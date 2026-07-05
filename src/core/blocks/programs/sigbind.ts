import * as Blockly from "blockly";
import getColorByType from "../../seeds/color_definition";
import { reconnect } from "../../mutator_helper";

// Begin sigbind single
Blockly.Blocks["sigbind_single"] = {
  init: function () {
    this.appendValueInput("inputId").setCheck("id");
    this.appendValueInput("inputVar").setCheck("sig").appendField("=");
    this.setOutput(true, "sigbind");
    this.setInputsInline(true);
    this.setColour(getColorByType('program'));
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

// Begin sigbind recursive
Blockly.Blocks["sigbind_nested"] = {
  /**
   * Block for creating a list with any number of elements of any dece.
   * @this {Blockly.Block}
   */
  init: function () {
    this.setInputsInline(false);
    this.setColour(getColorByType('program'));
    this.setOutput(true, "sigbind");
    this.setMutator(new Blockly.icons.MutatorIcon(["sigbind_child"], this));
    this.setTooltip("sigbind ");
    this.itemCount_ = 2;
    this.updateShape_();
  },

  // change on block
  onchange: function () {
    if (this.itemCount_ < 2) {
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
    var containerBlock = workspace.newBlock("sigbind_child_container");
    containerBlock.initSvg();
    var connection = containerBlock.getInput("STACK").connection;
    for (var i = 0; i < this.itemCount_; i++) {
      var itemBlock = workspace.newBlock("sigbind_child");
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
          .setAlign(Blockly.inputs.Align.RIGHT)
          .setCheck("sigbind");
        if (i > 0) {
          input.appendField(
            new Blockly.FieldLabelSerializable("and"),
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
  },
};

Blockly.Blocks["sigbind_child"] = {
  /**
   * Mutator block for adding items.
   * @this {Blockly.Block}
   */
  init: function () {
    this.setColour(getColorByType('program_sub'));
    this.appendDummyInput().appendField("sigbind");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip("Inhabitant of dec");
    this.contextMenu = false;
  },
};

Blockly.Blocks["sigbind_child_container"] = {
  /**
   * Mutator block for container.
   * @this {Blockly.Block}
   */
  init: function () {
    this.setColour(getColorByType('program'));
    this.appendDummyInput().appendField("Number of sigbind");
    this.appendStatementInput("STACK");
    this.setTooltip("Number of sigbind");
    this.contextMenu = false;
  },
};
// ===== End sigbind_nested
