import * as Blockly from "blockly";
import { SML } from "../../../sml";

SML.forBlock["spec_inclusion_sig"] = function (block) {
  let sig = SML.valueToCode(block, "sig", SML.ORDER_NONE),
    code = "include " + sig + " \n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["spec_inclusion"] = function (block) {
  let number_of_id = block.itemCount_;
  let code = "include ";
  for (let i = 0; i < number_of_id; i++) {
    code =
      code +
      " " +
      SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE);
  }
  return [code, SML.ORDER_NONE];
};
