import * as Blockly from "blockly";
import { sourceSeparator } from "../../../../preservation/source_layout";
import { SML } from "../../sml";

SML.forBlock["dec_sequence"] = function (block) {
  let number_of_dec = block.itemCount_,
    code = sourceSeparator(block, 0),
    i = 0;
  if (number_of_dec > 0) {
    for (i = 0; i < number_of_dec; i++) {
      code =
        code +
        SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE) +
        sourceSeparator(block, i + 1) + "\n";
    }
  }
  return [code, SML.ORDER_NONE];
};
