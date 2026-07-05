import * as Blockly from "blockly";
import { SML } from "../../sml";

SML.forBlock["strbind_single"] = function (block) {
  let typeVar =
      block.getFieldValue("chkSub") == "TRUE"
        ? ": " +
          block.getFieldValue("greatherSign") +
          " " +
          SML.valueToCode(block, "inputSig", SML.ORDER_NONE)
        : "",
    idVal = SML.valueToCode(block, "id", SML.ORDER_NONE),
    inputStr = SML.valueToCode(
      block,
      "inputStr",
      SML.ORDER_NONE
    ),
    code = idVal + " " + typeVar + " = " + inputStr;
  return [code, SML.ORDER_NONE];
};

SML.forBlock["strbind_nested"] = function (block) {
  let number_of_exp = block.itemCount_,
    code = "",
    i = 0;
  if (number_of_exp > 0) {
    for (i = 0; i < number_of_exp; i++) {
      if (i == 0)
        code =
          code +
          SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE) +
          "\n";
      else
        code =
          code +
          " and " +
          SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE) +
          "\n";
    }
  }
  return [code, SML.ORDER_NONE];
};
