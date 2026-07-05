import * as Blockly from "blockly";
import { SML } from "../../sml";

SML.forBlock["exp_list"] = function (block) {
  let number_of_exp = block.itemCount_;
  let code = "",
    codeExp = "",
    i = 0;
  if (number_of_exp > 0) {
    for (i = 0; i < number_of_exp; i++) {
      if (i + 1 < number_of_exp)
        codeExp =
          codeExp +
          SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE) +
          ",";
      else
        codeExp =
          codeExp +
          SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE);
    }
  }
  code = "[" + codeExp + "]\n";
  return [code, SML.ORDER_NONE];
};
