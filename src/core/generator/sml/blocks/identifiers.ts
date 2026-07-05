/* Copyright 2020 Universität Tübingen
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview SML code generator of input primitive for
 *               Visual Programming Language Yet Another [K/C]Compiler Interface
 * @author steven.lolong@uni-tuebingen.de (Steven Lolong)
 */
import * as Blockly from "blockly";
import { SML } from "../sml";

SML.forBlock["id_id"] = function (block) {
  let code = block.getFieldValue("inputValue");
  return [code, SML.ORDER_NONE];
};

SML.forBlock["id_var"] = function (block) {
  let dropdownConstrtype = block.getFieldValue("constrType");
  let textInputvalue = block.getFieldValue("inputValue");
  let code = dropdownConstrtype + textInputvalue + "\n";
  return [code, SML.ORDER_NONE];
};

SML.forBlock["id_long_id"] = function (block) {
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
            ".";
        else
          code =
            code +
            SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE);
      }
    }
  }
  return [code, SML.ORDER_NONE];
};

SML.forBlock["id_lab"] = function (block) {
  let code;
  switch (block.getFieldValue("MODE")) {
    case "NUM":
      code = block.getFieldValue("inputNum");
      break;
    case "ID":
      code = SML.valueToCode(block, "inputId", SML.ORDER_NONE);
      break;
    default:
      code = "";
  }
  return [code, SML.ORDER_NONE];
};
