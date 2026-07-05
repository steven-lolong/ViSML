/**
 * @fileoverview Helper functions for generating SML for blocks.
 * Based on Ellen Spertus's blocky-Lua project.
 * @author steven.lolong@uni-tuebingen.de
 */

import * as Blockly from "blockly";
import { formatSml } from "./format";
/**
 * SML code generator.
 * @type {!Blockly.Generator}
 */
export const SML: any = new Blockly.Generator("SML");

/**
 * Blockly v11 compatibility: `valueToCode` and `statementToCode` now throw a
 * ReferenceError when the requested input does not exist on the block, whereas
 * Blockly v9 returned an empty string. Several SML block generators intentionally
 * probe inputs that may be absent (e.g. the trailing iteration of an `i <= n`
 * loop), so restore the lenient v9 behaviour to keep generated code identical
 * and avoid runtime crashes.
 */
const _origValueToCode = SML.valueToCode.bind(SML);
SML.valueToCode = function (block: any, name: string, order: number): string {
  if (!block || !block.getInput(name)) return "";
  return _origValueToCode(block, name, order);
};
const _origStatementToCode = SML.statementToCode.bind(SML);
SML.statementToCode = function (block: any, name: string): string {
  if (!block || !block.getInput(name)) return "";
  return _origStatementToCode(block, name);
};

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
SML.addReservedWords(
  "if,then,else,val,fun,fn,let,in,end,local,while,case,match,andalso,orelse,raise" +
    "var,type,eqtype,datatype,exception,structure,include"
);

SML.ORDER_ATOMIC = 0;
// literals
// The next level was not explicit in documentation and inferred by Ellen.
SML.ORDER_HIGH = 1; // Function calls, tables[]
SML.ORDER_EXPONENTIATION = 2; // ^
SML.ORDER_UNARY = 3; // not # - ~
SML.ORDER_MULTIPLICATIVE = 4; // * / %
SML.ORDER_ADDITIVE = 5; // + -
SML.ORDER_CONCATENATION = 6; // ..
SML.ORDER_RELATIONAL = 7; // < > <=  >= ~= ==
SML.ORDER_AND = 8; // and
SML.ORDER_OR = 9; // or
SML.ORDER_NONE = 99;

/**
 * Note: SML is not supporting zero-indexing since the language itself is
 * one-indexed, so the generator does not repoct the oneBasedIndex configuration
 * option used for lists and text.
 */

/**
 * Whether the init method has been called.
 * @type {?boolean}
 */
SML.isInitialized = false;

/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
SML.init = function (workspace) {
  // Call Blockly.Generator's init.
  Object.getPrototypeOf(this).init.call(this);

  if (!this.nameDB_) {
    this.nameDB_ = new Blockly.Names(this.RESERVED_WORDS_);
  } else {
    this.nameDB_.reset();
  }
  this.nameDB_.setVariableMap(workspace.getVariableMap());
  this.nameDB_.populateVariables(workspace);
  this.nameDB_.populateProcedures(workspace);

  this.isInitialized = true;
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
SML.finish = function (code) {
  // Convert the definitions dictionary into a list.
  var definitions = Object.values(this.definitions_);
  // Call Blockly.Generator's finish.
  code = Object.getPrototypeOf(this).finish.call(this, code);
  this.isInitialized = false;

  this.nameDB_.reset();
  return formatSml(definitions.join("\n\n") + "\n\n\n" + code);
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything. In SML, an expression is not a legal statement, so we must assign
 * the value to the (conventionally ignored) _.
 * http://SML-users.org/wiki/ExpressionsAsStatements
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
SML.scrubNakedValue = function (line) {
  return "local _ = " + line + "\n";
};

/**
 * Encode a string as a properly escaped SML string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} SML string.
 * @protected
 */
SML.quote_ = function (string) {
  string = string
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\\n")
    .replace(/'/g, "\\'");
  return "'" + string + "'";
};

/**
 * Encode a string as a properly escaped multiline SML string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} SML string.
 * @protected
 */
SML.multiline_quote_ = function (string) {
  var lines = string.split(/\n/g).map(this.quote_);
  // Join with the following, plus a newline:
  // .. '\n' ..
  return lines.join(" .. '\\n' ..\n");
};

/**
 * Common tasks for generating SML from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The SML code created for this block.
 * @param {boolean=} opt_thisOnly True to generate code for only this statement.
 * @return {string} SML code with comments and subsequent blocks added.
 * @protected
 */
SML.scrub_ = function (block, code, opt_thisOnly) {
  var commentCode = "";
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      comment = Blockly.utils.string.wrap(comment, this.COMMENT_WRAP - 3);
      commentCode = "(* " + comment + " *)\n";
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var i = 0; i < block.inputList.length; i++) {
      if (block.inputList[i].type == Blockly.inputs.inputTypes.VALUE) {
        var childBlock = block.inputList[i].connection.targetBlock();
        if (childBlock) {
          comment = this.allNestedComments(childBlock);
          if (comment) {
            commentCode = "(* \n" + comment + "\n *)\n";
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = opt_thisOnly ? "" : this.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};
