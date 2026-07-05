import * as Blockly from "blockly";
import getColorByType from "../seeds/color_definition";
import { reconnect } from "../mutator_helper";

// ======= Start id
Blockly.Blocks["id_id"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("ID", "desc")
      .appendField(new Blockly.FieldTextInput(""), "inputValue");
    this.setOutput(true, ["id"]);
    this.setColour(getColorByType('identifier'));
    this.setTooltip("identifier");
    this.setHelpUrl("");
  },
  onchange: function () {
    if (this.getParent()) this.setFieldValue("", "desc");
    else this.setFieldValue("ID", "desc");
  },
};
// ======== End id

// ======== Start var
Blockly.Blocks["id_var"] = {
  init: function () {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldDropdown([
          ["'", "'"],
          ["''", "''"],
        ]),
        "constrType"
      )

      .appendField(new Blockly.FieldTextInput(""), "inputValue");
    this.setColour(getColorByType('identifier'));
    this.setOutput(true, ["var"]);
    this.setTooltip("var");
    this.setHelpUrl("");
  },
};
// ======= End var

// ======= Start longid
Blockly.Blocks["id_long_id"] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this {Blockly.Block}
   */
  init: function () {
    this.appendDummyInput().appendField("Long ID", "desc");
    this.itemCount_ = 1;
    this.updateShape_();
    this.setInputsInline(true);
    this.setColour(getColorByType('identifier'));
    this.setOutput(true, ["longid"]);
    this.setMutator(new Blockly.icons.MutatorIcon(["longid_child"], this));
    this.setTooltip("long identifier");
  },
  // change on block
  onchange: function () {
    if (this.itemCount_ == 0) {
      this.itemCount_ = 1;
      this.updateShape_();
    }
    if (this.getParent()) this.setFieldValue("", "desc");
    else this.setFieldValue("Long ID", "desc");
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
    var containerBlock = workspace.newBlock("longid_child_container");
    containerBlock.initSvg();
    var connection = containerBlock.getInput("STACK").connection;
    for (var i = 0; i < this.itemCount_; i++) {
      var itemBlock = workspace.newBlock("longid_child");
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
      this.appendDummyInput("EMPTY");
    }
    // Add new inputs.
    for (var i = 0; i < this.itemCount_; i++) {
      if (!this.getInput("ADD" + i)) {
        var input = this.appendValueInput("ADD" + i)
          .setAlign(Blockly.inputs.Align.RIGHT)
          .setCheck("id");
        if (i > 0) {
          input.appendField(
            new Blockly.FieldLabelSerializable("\u2022"),
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

Blockly.Blocks["longid_child"] = {
  /**
   * Mutator block for adding items.
   * @this {Blockly.Block}
   */
  init: function () {
    this.setColour(getColorByType('identifier_sub'));
    this.appendDummyInput().appendField("ID");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip("Identifier");
    this.contextMenu = false;
  },
};

Blockly.Blocks["longid_child_container"] = {
  /**
   * Mutator block for container.
   * @this {Blockly.Block}
   */
  init: function () {
    this.setColour(getColorByType('identifier'));
    this.appendDummyInput().appendField("Number of ID");
    this.appendStatementInput("STACK");
    this.setTooltip("Number of identifier");
    this.contextMenu = false;
  },
};
// ===== End longid

// ====== Start lab
// this is for record constructor
Blockly.Blocks["id_lab"] = {
  init: function () {
    var options = [
      ["Number", "NUM"],
      ["ID", "ID"],
    ];
    this.appendDummyInput("dummyNum")
      .appendField(new Blockly.FieldDropdown(options as any, this.validate), "MODE")
      .appendField(new Blockly.FieldNumber(1, 1), "inputNum");
    this.setOutput(true, ["lab"]);
    this.setInputsInline(false);
    this.setColour(getColorByType('identifier'));
    this.setTooltip("lab");
  },
  validate: function (newValue) {
    this.getSourceBlock().updateConnections(newValue);
    return newValue;
  },
  updateConnections: function (newValue) {
    this.removeInput("inputId", /* no error */ true);
    this.removeInput("dummyNum", /* no error */ true);
    if (newValue == "ID") {
      let options = [
        ["ID", "ID"],
        ["Number", "NUM"],
      ];
      this.appendValueInput("inputId")
        .appendField(new Blockly.FieldDropdown(options as any, this.validate), "MODE")
        .setCheck(["id"]);
      this.setInputsInline(true);
    } else if (newValue == "NUM") {
      let options = [
        ["Number", "NUM"],
        ["ID", "ID"],
      ];
      this.appendDummyInput("dummyNum")
        .appendField(new Blockly.FieldDropdown(options as any, this.validate), "MODE")
        .appendField(new Blockly.FieldNumber(1, 1), "inputNum");
      this.setInputsInline(false);
    }
  },
};
