import * as Blockly from "blockly";
import { SML } from "../../../sml";

SML.forBlock["valbind"] = function (block) {
  let rec = block.getFieldValue("recVal"),
    pat = SML.valueToCode(block, "pat", SML.ORDER_NONE),
    exp = SML.valueToCode(block, "exp", SML.ORDER_NONE),
    code = " " + rec + " " + pat + " = " + exp + "\n";
  return [code, SML.ORDER_NONE];
};
