import * as Blockly from "blockly";
import { SML } from "../../../sml";

SML.forBlock["str_identifier"] = function (block) {
  let code = SML.valueToCode(block, "longId", SML.ORDER_NONE);
  return [code + " \n", SML.ORDER_NONE];
};

SML.forBlock["str_structure"] = function (block) {
  let dec = SML.valueToCode(block, "dec", SML.ORDER_NONE),
    code = "struct \n" + dec + "\n" + "end \n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["str_local_declaration"] = function (block) {
  let dec = SML.valueToCode(block, "dec", SML.ORDER_NONE),
    str = SML.valueToCode(block, "str", SML.ORDER_NONE),
    code = "let \n" + dec + "\n in \n" + str + "\n end \n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["str_transparent_annotation"] = function (block) {
  let str = SML.valueToCode(block, "str", SML.ORDER_NONE),
    sig = SML.valueToCode(block, "sig", SML.ORDER_NONE),
    code = str + " : " + sig + " \n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["str_opaque_annotation"] = function (block) {
  let str = SML.valueToCode(block, "str", SML.ORDER_NONE),
    sig = SML.valueToCode(block, "sig", SML.ORDER_NONE),
    code = str + " :> " + sig + " \n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["str_functor_application_str"] = function (block) {
  let id = SML.valueToCode(block, "id", SML.ORDER_NONE),
    str = SML.valueToCode(block, "str", SML.ORDER_NONE),
    code = id + " ( " + str + " ) \n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["str_functor_application_dec"] = function (block) {
  let id = SML.valueToCode(block, "id", SML.ORDER_NONE),
    dec = SML.valueToCode(block, "dec", SML.ORDER_NONE),
    code = id + " ( " + dec + " ) \n";
  return [code, SML.ORDER_NONE];
};
