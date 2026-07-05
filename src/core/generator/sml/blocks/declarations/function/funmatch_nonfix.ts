import * as Blockly from "blockly";
import { SML } from "../../../sml";

SML.forBlock["funmatch_nonfix"] = function (block) {
  let op = block.getFieldValue("optr"),
    number_of_pat = block.itemCount_,
    idVal = SML.valueToCode(block, "id", SML.ORDER_NONE),
    exp = SML.valueToCode(block, "exp", SML.ORDER_NONE),
    typeVar =
      block.getFieldValue("chkTyp") == "TRUE"
        ? " : " +
          SML.valueToCode(block, "inVar", SML.ORDER_NONE)
        : "",
    code = "",
    codePat = "",
    i = 0;
  for (i = 0; i < number_of_pat; i++) {
    codePat =
      codePat +
      SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE) +
      " ";
  }
  code = op + " " + idVal + " " + codePat + typeVar + " = " + exp + " \n";
  return [code, SML.ORDER_NONE];
};
