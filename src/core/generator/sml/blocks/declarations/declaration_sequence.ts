import * as Blockly from "blockly";
import { SML } from "../../sml";

SML.forBlock["dec_sequence"] = function (block) {
  let number_of_dec = block.itemCount_,
    code = "",
    i = 0;
  if (number_of_dec > 0) {
    for (i = 0; i < number_of_dec; i++) {
      code =
        code +
        SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE) +
        "\n";
    }
  }
  return [code, SML.ORDER_NONE];
};
