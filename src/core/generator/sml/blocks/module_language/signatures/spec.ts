import * as Blockly from "blockly";
import { SML } from "../../../sml";

SML.forBlock["spec_value"] = function (block) {
  let valdesc = SML.valueToCode(
      block,
      "valdesc",
      SML.ORDER_NONE
    ),
    code = "val " + valdesc + " \n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["spec_type"] = function (block) {
  let typdesc = SML.valueToCode(
      block,
      "typdesc",
      SML.ORDER_NONE
    ),
    code = "type " + typdesc + " \n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["spec_equality_type"] = function (block) {
  let typdesc = SML.valueToCode(
      block,
      "typdesc",
      SML.ORDER_NONE
    ),
    code = "eqtype " + typdesc + " \n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["spec_type_abbreviation"] = function (block) {
  let typbind = SML.valueToCode(
      block,
      "typbind",
      SML.ORDER_NONE
    ),
    code = "type " + typbind + " \n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["spec_datatype"] = function (block) {
  let datdesc = SML.valueToCode(
      block,
      "datdesc",
      SML.ORDER_NONE
    ),
    code = "datatype " + datdesc + " \n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["spec_datatype_replication"] = function (block) {
  let datId = SML.valueToCode(block, "datId", SML.ORDER_NONE),
    datLongId = SML.valueToCode(
      block,
      "datLongId",
      SML.ORDER_NONE
    ),
    code = "datatype " + datId + " = datatype " + datLongId + " \n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["spec_exception"] = function (block) {
  let exndesc = SML.valueToCode(
      block,
      "exndesc",
      SML.ORDER_NONE
    ),
    code = "exception " + exndesc + " \n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["spec_structure"] = function (block) {
  let strdesc = SML.valueToCode(
      block,
      "strdesc",
      SML.ORDER_NONE
    ),
    code = "structure " + strdesc + " \n";
  return [code, SML.ORDER_NONE];
};
