import * as Blockly from "blockly";
import { sourceSeparator } from "../../../../../preservation/source_layout";
import { SML } from "../../../sml";

SML.forBlock["spec_sequence"] = function (block) {
  let code = sourceSeparator(block, 0);
  for (let i = 0; i < block.itemCount_; i++) {
    code += SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE);
    code += block.t2bbSource_?.separators ? sourceSeparator(block, i + 1)
      : i + 1 < block.itemCount_ ? ";" : "";
    code += "\n";
  }
  return [code, SML.ORDER_NONE];
};
