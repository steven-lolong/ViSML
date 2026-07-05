import * as Blockly from "blockly";
import { SML } from "../../sml";

SML.forBlock["exnbind"] = function (block) {
  let typeVar =
      block.getFieldValue("chkTyp") == "TRUE"
        ? "of " +
          SML.valueToCode(block, "inVar", SML.ORDER_NONE)
        : "",
    idVal = SML.valueToCode(block, "id", SML.ORDER_NONE),
    code = idVal + " " + typeVar;
  return [code, SML.ORDER_NONE];
};

SML.forBlock["exnbind_renaming"] = function (block) {
  let idVal = SML.valueToCode(block, "id", SML.ORDER_NONE),
    longIdVal = SML.valueToCode(
      block,
      "longId",
      SML.ORDER_NONE
    ),
    code = idVal + " = " + longIdVal;
  return [code, SML.ORDER_NONE];
};

SML.forBlock["exnbind_more_inhabitants"] = function (block) {
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
