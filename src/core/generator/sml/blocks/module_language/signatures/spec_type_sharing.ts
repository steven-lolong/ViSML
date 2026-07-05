import * as Blockly from "blockly";
import { SML } from "../../../sml";

SML.forBlock["spec_type_sharing"] = function (block) {
  let number_of_id = block.itemCount_,
    longID = "",
    code = "",
    i = 0,
    specBlock = SML.valueToCode(
      block,
      "specBlock",
      SML.ORDER_NONE
    ),
    sharingType = block.getFieldValue("sharingType");
  if (number_of_id == 1) {
    longID = SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE);
  } else {
    if (number_of_id > 1) {
      for (i = 0; i <= number_of_id; i++) {
        if (i + 1 < number_of_id)
          longID =
            longID +
            SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE) +
            " = ";
        else
          longID =
            longID +
            SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE);
      }
    }
  }
  code = specBlock + " sharing " + sharingType + " " + longID + " \n";
  return [code, SML.ORDER_NONE];
};
