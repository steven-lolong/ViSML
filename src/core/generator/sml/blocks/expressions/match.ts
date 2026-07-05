import * as Blockly from "blockly";
import { SML } from "../../sml";

// match
SML.forBlock["match"] = function (block) {
  let pat = SML.valueToCode(block, "pat", SML.ORDER_NONE),
    exp = SML.valueToCode(block, "exp", SML.ORDER_NONE),
    code = pat + " => " + exp;

  return [code, SML.ORDER_NONE];
};

// match, n > 1
SML.forBlock["matchs"] = function (block) {
  let number_of_exp = block.itemCount_;
  let code = "",
    codeExp = "",
    i = 0;
  if (number_of_exp > 1) {
    for (i = 0; i < number_of_exp; i++) {
      if (i == 0)
        code =
          code +
          SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE) +
          "\n";
      else
        code =
          code +
          " | " +
          SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE) +
          "\n";
    }
  }
  return [code, SML.ORDER_NONE];
};
