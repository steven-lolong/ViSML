import * as Blockly from "blockly";
import { SML } from "../../../sml";

SML.forBlock["funmatch_infix"] = function (block) {
  let pat1 = SML.valueToCode(block, "pat1", SML.ORDER_NONE),
    idVal = SML.valueToCode(block, "id", SML.ORDER_NONE),
    pat2 = SML.valueToCode(block, "pat2", SML.ORDER_NONE),
    inexp = SML.valueToCode(block, "inexp", SML.ORDER_NONE),
    typeVar =
      block.getFieldValue("chkTyp") == "TRUE"
        ? " : " +
          SML.valueToCode(block, "inTyp", SML.ORDER_NONE)
        : "",
    code = "";
  code =
    pat1 + " " + idVal + " " + pat2 + " " + typeVar + " = " + inexp + " \n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["funmatch_more_row"] = function (block) {
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
            " | ";
        else
          code =
            code +
            SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE);
      }
    }
  }
  return [code, SML.ORDER_NONE];
};
