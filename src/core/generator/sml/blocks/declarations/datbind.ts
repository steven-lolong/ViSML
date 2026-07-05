import * as Blockly from "blockly";
import { SML } from "../../sml";

SML.forBlock["datbind"] = function (block) {
  let typeVar =
      block.getFieldValue("chkTyp") == "TRUE"
        ? SML.valueToCode(block, "inVar", SML.ORDER_NONE)
        : "",
    idVal = SML.valueToCode(block, "id", SML.ORDER_NONE),
    typVal = SML.valueToCode(
      block,
      "inConbind",
      SML.ORDER_NONE
    ),
    code = typeVar + " " + idVal + " = " + typVal;
  return [code, SML.ORDER_NONE];
};

SML.forBlock["databind_more_inhabitants"] = function (block) {
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
