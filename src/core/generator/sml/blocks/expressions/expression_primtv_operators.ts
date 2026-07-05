import * as Blockly from "blockly";
import { SML } from "../../sml";

SML.forBlock["exp_primtv_optr_arith"] = function (block) {
  let exp1 = SML.valueToCode(block, "exp_1", SML.ORDER_NONE);
  let exp2 = SML.valueToCode(block, "exp_2", SML.ORDER_NONE);
  let op = block.getFieldValue("opt");
  let code = "( " + exp1 + " " + op + " " + exp2 + " ) ";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["exp_primtv_optr_logic"] = function (block) {
  let exp1 = SML.valueToCode(block, "exp_1", SML.ORDER_NONE);
  let exp2 = SML.valueToCode(block, "exp_2", SML.ORDER_NONE);
  let op = block.getFieldValue("opt");
  let code = "( " + exp1 + " " + op + " " + exp2 + " ) ";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["exp_primtv_optr_record"] = function (block) {
  let lab1 = SML.valueToCode(block, "lab_1", SML.ORDER_NONE);
  let exp1 = SML.valueToCode(block, "exp_1", SML.ORDER_NONE);
  let code = "#" + lab1 + " " + exp1 + " ";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["exp_primtv_optr_list_hd"] = function (block) {
  let code = "";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["exp_primtv_optr_list_tail"] = function (block) {
  let code = "";
  return [code, SML.ORDER_NONE];
};
