import * as Blockly from "blockly";
import { SML } from "../../../sml";

SML.forBlock["typrefin_single"] = function (block) {
  let inputVar = SML.valueToCode(
      block,
      "inputVar",
      SML.ORDER_NONE
    ),
    inputLongid = SML.valueToCode(
      block,
      "inputLongid",
      SML.ORDER_NONE
    ),
    inputTyp = SML.valueToCode(
      block,
      "inputTyp",
      SML.ORDER_NONE
    ),
    code = inputVar + " " + inputLongid + " = " + inputTyp + " \n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["typrefin_nested"] = function (block) {
  let number_of_id = block.itemCount_;
  let code = "";
  let i = 0;
  if (number_of_id == 1) {
    code = SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE);
  } else {
    if (number_of_id > 1) {
      for (i = 0; i <= number_of_id; i++) {
        if (i + 1 < number_of_id)
          code =
            code +
            SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE) +
            "and ";
        else
          code =
            code +
            SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE);
      }
    }
  }

  return [code, SML.ORDER_NONE];
};
