import * as Blockly from "blockly";
import { SML } from "../../sml";

SML.forBlock["pat_wildcard"] = function (block) {
  return [" _ ", SML.ORDER_NONE];
};

SML.forBlock["pat_id"] = function (block) {
  let OpValue = block.getFieldValue("OP"),
    codeId = SML.valueToCode(block, "id", SML.ORDER_NONE),
    code = (OpValue == "nothing" ? " " : " op ") + codeId + " ";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["pat_long_id"] = function (block) {
  let OpValue = block.getFieldValue("OP"),
    codeId = SML.valueToCode(block, "longId", SML.ORDER_NONE),
    patBlock =
      block.getFieldValue("patOpt") == "pattern"
        ? SML.valueToCode(block, "PATTERN", SML.ORDER_NONE)
        : "",
    code = (OpValue == "nothing" ? " " : " op ") + codeId + " " + patBlock;

  return [code, SML.ORDER_NONE];
};

SML.forBlock["pat_infix"] = function (block) {
  let patLhs = SML.valueToCode(
    block,
    "pat_lhs",
    SML.ORDER_NONE
  ),
    patRhs = SML.valueToCode(block, "pat_rhs", SML.ORDER_NONE),
    id = SML.valueToCode(block, "id", SML.ORDER_NONE),
    code = " " + patLhs + " " + id + " " + patRhs + " ";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["pat_parentheses"] = function (block) {
  let pat = SML.valueToCode(block, "pat", SML.ORDER_NONE),
    code = "( " + pat + " ) ";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["pat_type_annotation"] = function (block) {
  let patCode = SML.valueToCode(block, "pat", SML.ORDER_NONE),
    typeCode = SML.valueToCode(block, "typ", SML.ORDER_NONE),
    code = patCode + " : " + typeCode + " ";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["pat_layered"] = function (block) {
  let opCode = block.getFieldValue("Op") == "operator" ? " op " : "",
    idCode =
      opCode + SML.valueToCode(block, "id", SML.ORDER_NONE),
    typeCode =
      block.getFieldValue("chkTyp") == "TRUE"
        ? ": " + SML.valueToCode(block, "inTyp", SML.ORDER_NONE)
        : "",
    patCode =
      "as " + SML.valueToCode(block, "inPat", SML.ORDER_NONE),
    code = idCode + " " + typeCode + " " + patCode + " ";

  return [code, SML.ORDER_NONE];
};
