import * as Blockly from "blockly";
import { SML } from "../../sml";

SML.forBlock["exp_bound"] = function (block) {
  let op = block.getFieldValue("opt") == "OP" ? "op " : "";
  let id = SML.valueToCode(block, "longid", SML.ORDER_NONE);
  let code = op + id;
  return [code, SML.ORDER_NONE];
};

SML.forBlock["exp_application"] = function (block) {
  let exp1 = SML.valueToCode(block, "exp1", SML.ORDER_NONE);
  let exp2 = SML.valueToCode(block, "exp2", SML.ORDER_NONE);
  let code = exp1 + " " + exp2;
  return [code, SML.ORDER_NONE];
};

SML.forBlock["exp_infix_application"] = function (block) {
  let exp1 = SML.valueToCode(block, "exp1", SML.ORDER_NONE);
  let exp2 = SML.valueToCode(block, "exp2", SML.ORDER_NONE);
  let id = SML.valueToCode(block, "id", SML.ORDER_NONE);
  let code = exp1 + " " + id + " " + exp2;
  return [code, SML.ORDER_NONE];
};

SML.forBlock["exp_parentheses"] = function (block) {
  let exp = SML.valueToCode(block, "exp", SML.ORDER_NONE);
  let code = "(" + exp + ")";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["exp_with_type"] = function (block) {
  let exp = SML.valueToCode(block, "exp", SML.ORDER_NONE);
  let typ = SML.valueToCode(block, "typ", SML.ORDER_NONE);
  let code = exp + " : " + typ;
  return [code, SML.ORDER_NONE];
};

SML.forBlock["exp_raise"] = function (block) {
  let exp = SML.valueToCode(block, "exp", SML.ORDER_NONE);
  let code = "raise " + exp;
  return [code, SML.ORDER_NONE];
};

SML.forBlock["exp_handle"] = function (block) {
  let exp = SML.valueToCode(block, "exp", SML.ORDER_NONE);
  let match = SML.valueToCode(block, "match", SML.ORDER_NONE);
  let code = exp + " \n handle " + match;
  return [code, SML.ORDER_NONE];
};

SML.forBlock["exp_andalso"] = function (block) {
  let exp1 = SML.valueToCode(block, "exp1", SML.ORDER_NONE);
  let exp2 = SML.valueToCode(block, "exp2", SML.ORDER_NONE);
  let code = exp1 + " andalso " + exp2;
  return [code, SML.ORDER_NONE];
};

SML.forBlock["exp_orelse"] = function (block) {
  let exp1 = SML.valueToCode(block, "exp1", SML.ORDER_NONE);
  let exp2 = SML.valueToCode(block, "exp2", SML.ORDER_NONE);
  let code = exp1 + " orelse " + exp2;
  return [code, SML.ORDER_NONE];
};

SML.forBlock["exp_if_else"] = function (block) {
  let expIf = SML.valueToCode(block, "if", SML.ORDER_NONE);
  let expThen = SML.valueToCode(block, "then", SML.ORDER_NONE);
  let expElse = SML.valueToCode(block, "else", SML.ORDER_NONE);
  let code = "if " + expIf + " then \n" + expThen + "\nelse\n" + expElse;
  return [code, SML.ORDER_NONE];
};

SML.forBlock["exp_while_do"] = function (block) {
  let expWhile = SML.valueToCode(
    block,
    "while",
    SML.ORDER_NONE
  );
  let expDo = SML.valueToCode(block, "do", SML.ORDER_NONE);
  let code = "while " + expWhile + "\ndo " + expDo + "\n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["exp_case"] = function (block) {
  let expCase = SML.valueToCode(block, "case", SML.ORDER_NONE);
  let expOf = SML.valueToCode(block, "of", SML.ORDER_NONE);
  let code = "case " + expCase + "\nof " + expOf + "\n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["exp_fn"] = function (block) {
  let matchFn = SML.valueToCode(block, "fn", SML.ORDER_NONE);
  let code = "fn " + matchFn + "\n";
  return [code, SML.ORDER_NONE];
};
