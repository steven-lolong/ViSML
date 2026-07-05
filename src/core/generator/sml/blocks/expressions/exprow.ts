import * as Blockly from "blockly";
import { SML } from "../../sml";

SML.forBlock["exprow"] = function (block) {
  let code = "",
    lab = SML.valueToCode(block, "lab", SML.ORDER_NONE),
    exp = SML.valueToCode(block, "exp", SML.ORDER_NONE);
  code = lab + " = " + exp;
  return [code, SML.ORDER_NONE];
};
