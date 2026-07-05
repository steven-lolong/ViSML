import * as Blockly from "blockly";
import { SML } from "../../../sml";

SML.forBlock["funmatch_infix_n_inhabitant"] = function (block) {
  let number_of_id = block.itemCount_,
    pat1 = SML.valueToCode(block, "pat1", SML.ORDER_NONE),
    idVal = SML.valueToCode(block, "id", SML.ORDER_NONE),
    pat2 = SML.valueToCode(block, "pat2", SML.ORDER_NONE),
    inexp = SML.valueToCode(block, "exp", SML.ORDER_NONE),
    typeVar =
      block.getFieldValue("chkTyp") == "TRUE"
        ? " : " +
          SML.valueToCode(block, "inVar", SML.ORDER_NONE)
        : "",
    code = "",
    i = 0,
    patCode = "";

  if (number_of_id == 1) {
    patCode = SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE);
  } else {
    if (number_of_id > 1) {
      for (i = 0; i <= number_of_id; i++) {
        if (i + 1 < number_of_id)
          patCode =
            patCode +
            SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE) +
            " ";
        else
          patCode =
            patCode +
            SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE);
      }
    }
  }

  code =
    (number_of_id > 0 ? "( " : "") +
    pat1 +
    " " +
    idVal +
    " " +
    pat2 +
    (number_of_id > 0 ? " ) " : " ") +
    patCode +
    " " +
    typeVar +
    " = " +
    inexp +
    " \n";
  return [code, SML.ORDER_NONE];
};
