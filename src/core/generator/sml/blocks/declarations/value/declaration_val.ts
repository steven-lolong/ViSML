import * as Blockly from "blockly";
import { SML } from "../../../sml";

SML.forBlock["dec_val"] = function (block) {
  let number_of_exp = block.itemCount_,
    typeVar =
      block.getFieldValue("chkTyp") == "TRUE"
        ? SML.valueToCode(block, "inVar", SML.ORDER_NONE)
        : "",
    code = "",
    codeValbind = "",
    i = 0;
  if (number_of_exp > 0) {
    for (i = 0; i < number_of_exp; i++) {
      if (i == 0)
        codeValbind =
          codeValbind +
          SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE) +
          "\n";
      else
        codeValbind =
          codeValbind +
          "\n and" +
          SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE) +
          "\n";
    }
  }
  code = "val " + typeVar + " " + codeValbind + "\n";
  return [code, SML.ORDER_NONE];
};
