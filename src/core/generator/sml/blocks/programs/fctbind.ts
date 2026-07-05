import * as Blockly from "blockly";
import { SML } from "../../sml";

SML.forBlock["fctbind_plain"] = function (block) {
  let inputId1 = SML.valueToCode(
      block,
      "inputId1",
      SML.ORDER_NONE
    ),
    inputId2 = SML.valueToCode(
      block,
      "inputId2",
      SML.ORDER_NONE
    ),
    inputSig = SML.valueToCode(
      block,
      "inputSig",
      SML.ORDER_NONE
    ),
    inputVar = SML.valueToCode(
      block,
      "inputVar",
      SML.ORDER_NONE
    ),
    inputStr = SML.valueToCode(
      block,
      "inputStr",
      SML.ORDER_NONE
    ),
    isTrans = block.getFieldValue("isTrans")
      ? block.getFieldValue("isTrans")
      : "",
    chkSub = block.getFieldValue("chkSub"),
    colon = chkSub == "TRUE" ? ":" : "",
    code =
      inputId1 +
      " ( " +
      inputId2 +
      " : " +
      inputSig +
      " ) " +
      colon +
      isTrans +
      " " +
      inputVar +
      " = " +
      inputStr +
      " \n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["fctbind_opened"] = function (block) {
  let inputId = SML.valueToCode(
      block,
      "inputId",
      SML.ORDER_NONE
    ),
    inputSpec = SML.valueToCode(
      block,
      "inputSpec",
      SML.ORDER_NONE
    ),
    inputVar = SML.valueToCode(
      block,
      "inputVar",
      SML.ORDER_NONE
    ),
    inputStr = SML.valueToCode(
      block,
      "inputStr",
      SML.ORDER_NONE
    ),
    isTrans = block.getFieldValue("isTrans")
      ? block.getFieldValue("isTrans")
      : "",
    chkSub = block.getFieldValue("chkSub"),
    colon = chkSub == "TRUE" ? ":" : "",
    code =
      inputId +
      " ( " +
      inputSpec +
      " ) " +
      colon +
      isTrans +
      " " +
      inputVar +
      " = " +
      inputStr +
      " \n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["fctbind_nested"] = function (block) {
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
