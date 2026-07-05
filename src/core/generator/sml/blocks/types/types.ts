import * as Blockly from "blockly";
import { SML } from "../../sml";

SML.forBlock["typ_var"] = function (block) {
  let code = SML.valueToCode(block, "typ_var", SML.ORDER_NONE);
  return [code, SML.ORDER_NONE];
};

SML.forBlock["typ_parentheses"] = function (block) {
  let code =
    "( " +
    SML.valueToCode(block, "typ", SML.ORDER_NONE) +
    " )\n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["typ_function"] = function (block) {
  let from = SML.valueToCode(block, "from", SML.ORDER_NONE),
    to = SML.valueToCode(block, "to", SML.ORDER_NONE),
    code = " " + from + " -> " + to + " ";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["typ_list"] = function (block) {
  let typCode = SML.valueToCode(block, "typ", SML.ORDER_NONE),
    code = " " + typCode + " list ";
  return [code, SML.ORDER_NONE];
};
