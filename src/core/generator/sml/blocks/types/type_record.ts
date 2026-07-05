import * as Blockly from "blockly";
import { SML } from "../../sml";

SML.forBlock["typ_record"] = function (block) {
  let number_of_exp = block.itemCount_;
  let code = "",
    codeTyp = "",
    i = 0;
  if (number_of_exp > 0) {
    for (i = 0; i < number_of_exp; i++) {
      if (i + 1 < number_of_exp)
        codeTyp =
          codeTyp +
          SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE) +
          " : " +
          SML.valueToCode(block, "TYP" + i, SML.ORDER_NONE) +
          ",";
      else
        codeTyp =
          codeTyp +
          SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE) +
          " : " +
          SML.valueToCode(block, "TYP" + i, SML.ORDER_NONE);
    }
  }
  code = "{" + codeTyp + "}\n";
  return [code, SML.ORDER_NONE];
};
