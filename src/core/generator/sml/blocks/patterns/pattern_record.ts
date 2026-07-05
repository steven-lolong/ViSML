import * as Blockly from "blockly";
import { SML } from "../../sml";

SML.forBlock["pat_record"] = function (block) {
  let number_of_exp = block.itemCount_;
  let code = "",
    codePat = "",
    i = 0;
  if (number_of_exp > 0) {
    for (i = 0; i < number_of_exp; i++) {
      if (i + 1 < number_of_exp)
        codePat =
          codePat +
          SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE) +
          ",";
      else
        codePat =
          codePat +
          SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE);
    }
  }
  code = "{" + codePat + "}\n";
  return [code, SML.ORDER_NONE];
};
