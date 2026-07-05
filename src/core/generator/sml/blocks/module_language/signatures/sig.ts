import * as Blockly from "blockly";
import { SML } from "../../../sml";

SML.forBlock["sig_id"] = function (block) {
  let id = SML.valueToCode(block, "id", SML.ORDER_NONE),
    code = id + " \n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["sig_signature"] = function (block) {
  let spec = SML.valueToCode(block, "spec", SML.ORDER_NONE),
    code = "sig " + spec + "\n end \n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["sig_refinement"] = function (block) {
  let sig = SML.valueToCode(block, "sig", SML.ORDER_NONE),
    typrefin = SML.valueToCode(
      block,
      "typrefin",
      SML.ORDER_NONE
    ),
    code = sig + " where type " + typrefin + "\n";
  return [code, SML.ORDER_NONE];
};
