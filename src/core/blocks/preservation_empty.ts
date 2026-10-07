import * as Blockly from "blockly";
/** Explicit epsilon owners retain separators in otherwise empty source bodies. */
for (const [type, role, label] of [
    ["dec_empty", "dec", "Empty declaration"],
    ["spec_empty", "spec", "Empty specification"],
]) {
    Blockly.Blocks[type] = {
        init: function () {
            this.appendDummyInput().appendField(label);
            this.setOutput(true, role);
            this.setColour(180);
            this.setTooltip(`${role} ::= epsilon`);
        },
    };
}
