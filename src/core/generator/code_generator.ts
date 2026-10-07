import * as Blockly from "blockly";
import "./sml/sml";
import { preservingWorkspaceToCode } from "../preservation/workspace_export";

function generateCode(target_code) {
  const tarsius_workplace = Blockly.getMainWorkspace();
  let newCode;

  switch (target_code) {
    case "sml": {
      newCode = preservingWorkspaceToCode(tarsius_workplace);
      break;
    }
    default: {
      newCode = "Error - Unknown code";
    }
  }

  return newCode;
}

export { generateCode };
