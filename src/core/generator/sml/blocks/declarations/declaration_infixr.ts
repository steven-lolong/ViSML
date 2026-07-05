import * as Blockly from "blockly";
import { SML } from "../../sml";

SML.forBlock["dec_infixr"] = function (block) {
  let number_of_dec = block.itemCount_,
    code = "",
    digit = block.getFieldValue("digit"),
    i = 0;
  if (number_of_dec > 0) {
    for (i = 0; i < number_of_dec; i++) {
      code =
        code +
        " " +
        SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE);
    }
  }

  code = "infixr " + digit + " " + code;
  return [code, SML.ORDER_NONE];
};
