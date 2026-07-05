import * as Blockly from "blockly";
import { SML } from "../../sml";

SML.forBlock["typ_constructor"] = function (block) {
  let number_of_type = block.itemCount_;
  let code = "",
    idType = "",
    idCode = SML.valueToCode(block, "longid", SML.ORDER_NONE),
    i = 0;
  if (number_of_type > 0) {
    for (i = 0; i < number_of_type; i++) {
      if (i + 1 < number_of_type)
        idType =
          idType +
          SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE) +
          ",";
      else
        idType =
          idType +
          SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE);
    }
  }

  code =
    (number_of_type > 1 ? "(" : "") +
    idType +
    (number_of_type > 1 ? ") " : " ") +
    idCode;
  return [code, SML.ORDER_NONE];
};
