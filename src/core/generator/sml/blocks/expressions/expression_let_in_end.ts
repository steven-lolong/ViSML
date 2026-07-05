import * as Blockly from "blockly";
import { SML } from "../../sml";

SML.forBlock["exp_let_in_end"] = function (block) {
  let number_of_exp = block.itemCount_;
  let decLet = SML.valueToCode(block, "let", SML.ORDER_NONE);
  let code = "",
    codeExp = "",
    i = 0;
  if (number_of_exp <= 1) {
    codeExp =
      codeExp +
      SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE) +
      "\n";
  } else {
    for (i = 0; i < number_of_exp; i++) {
      if (i + 1 < number_of_exp)
        codeExp =
          codeExp +
          SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE) +
          ";\n";
      else
        codeExp =
          codeExp +
          SML.valueToCode(block, "ADD" + i, SML.ORDER_NONE) +
          "\n";
    }
  }
  code =
    "let \n" +
    decLet +
    (number_of_exp > 1 ? " in {\n" : " in ") +
    codeExp +
    (number_of_exp > 1 ? " }\n" : "") +
    " end\n";
  return [code, SML.ORDER_NONE];
};
