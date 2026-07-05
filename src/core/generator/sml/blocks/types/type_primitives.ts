import * as Blockly from "blockly";
import { SML } from "../../sml";

SML.forBlock["typ_primtv"] = function (block) {
  let code = " " + block.getFieldValue("type") + " ";
  return [code, SML.ORDER_NONE];
};
