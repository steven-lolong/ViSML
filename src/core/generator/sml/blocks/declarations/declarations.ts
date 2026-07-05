import * as Blockly from "blockly";
import { SML } from "../../sml";

SML.forBlock["dec_type"] = function (block) {
  let typbind = SML.valueToCode(
      block,
      "typbind",
      SML.ORDER_NONE
    ),
    code = " type " + typbind + " ;\n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["dec_datatype_replication"] = function (block) {
  let id = SML.valueToCode(block, "id", SML.ORDER_NONE),
    longid = SML.valueToCode(block, "longid", SML.ORDER_NONE),
    code = " datatype " + id + " = " + " datatype " + longid + ";\n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["dec_datatype_bind"] = function (block) {
  let datbind = SML.valueToCode(
      block,
      "datbind",
      SML.ORDER_NONE
    ),
    inVar =
      block.getFieldValue("chkTyp") == "TRUE"
        ? "withtype " +
          SML.valueToCode(block, "inVar", SML.ORDER_NONE)
        : "",
    code = " datatype " + datbind + " " + inVar + ";\n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["dec_abstype"] = function (block) {
  let datbind = SML.valueToCode(
      block,
      "datbind",
      SML.ORDER_NONE
    ),
    inVar =
      block.getFieldValue("chkTyp") == "TRUE"
        ? " withtype " +
          SML.valueToCode(block, "inVar", SML.ORDER_NONE)
        : "",
    withDec = SML.valueToCode(block, "withDec", SML.ORDER_NONE),
    code =
      " abstype " + datbind + " " + inVar + " with " + withDec + " end ;\n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["dec_exception"] = function (block) {
  let code =
    "exception " +
    SML.valueToCode(block, "exnbind", SML.ORDER_NONE) +
    " ";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["dec_structure"] = function (block) {
  let code =
    "structure " +
    SML.valueToCode(block, "strbind", SML.ORDER_NONE) +
    " ";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["dec_local"] = function (block) {
  let code =
    "local " +
    SML.valueToCode(block, "local", SML.ORDER_NONE) +
    "\nin \n" +
    SML.valueToCode(block, "in", SML.ORDER_NONE) +
    "\nend \n";
  return [code, SML.ORDER_NONE];
};
