import * as Blockly from "blockly";
import { SML } from "../sml";

SML.forBlock["id_long_var"] = function (block) {
  let number_of_exp = block.itemCount_;
  let code = "",
    i = 0;
  if (number_of_exp > 0) {
    for (i = 0; i < number_of_exp; i++) {
      if (i + 1 < number_of_exp)
        code =
          code +
          SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE) +
          ", ";
      else
        code =
          code +
          SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE);
    }
  }
  code = " " + code + " ";
  return [code, SML.ORDER_NONE];
};
