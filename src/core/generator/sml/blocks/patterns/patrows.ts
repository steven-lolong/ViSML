import * as Blockly from "blockly";
import { SML } from "../../sml";

SML.forBlock["patrow_wildcard"] = function (block) {
  return ["...", SML.ORDER_NONE];
};

SML.forBlock["patrow_lab_pat"] = function (block) {
  let lab = SML.valueToCode(block, "lab", SML.ORDER_NONE),
    pat = SML.valueToCode(block, "pat", SML.ORDER_NONE),
    code = " " + lab + " = " + pat + " ";

  return [code, SML.ORDER_NONE];
};

SML.forBlock["patrow_variable"] = function (block) {
  let idCode = SML.valueToCode(block, "id", SML.ORDER_NONE),
    typeCode =
      block.getFieldValue("chkTyp") == "TRUE"
        ? ": " + SML.valueToCode(block, "inTyp", SML.ORDER_NONE)
        : "",
    patCode =
      block.getFieldValue("chkAs") == "TRUE"
        ? "as " +
          SML.valueToCode(block, "inPat", SML.ORDER_NONE)
        : "",
    code = idCode + " " + typeCode + " " + patCode + " ";

  return [code, SML.ORDER_NONE];
};
