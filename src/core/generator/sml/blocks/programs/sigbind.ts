import * as Blockly from "blockly";
import { SML } from "../../sml";

SML.forBlock["sigbind_single"] = function (block) {
  let inputId = SML.valueToCode(
      block,
      "inputId",
      SML.ORDER_NONE
    ),
    inputVar = SML.valueToCode(
      block,
      "inputVar",
      SML.ORDER_NONE
    ),
    code = inputId + " = " + inputVar;
  return [code, SML.ORDER_NONE];
};

SML.forBlock["sigbind_nested"] = function (block) {
  let number_of_id = block.itemCount_,
    code = "",
    i = 0;
  if (number_of_id == 1) {
    code = SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE);
  } else {
    if (number_of_id > 1) {
      for (i = 0; i <= number_of_id; i++) {
        if (i + 1 < number_of_id)
          code =
            code +
            SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE) +
            " and ";
        else
          code =
            code +
            SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE);
      }
    }
  }
  return [code, SML.ORDER_NONE];
};
