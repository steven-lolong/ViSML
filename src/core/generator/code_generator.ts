import * as Blockly from "blockly";
import hljs from "highlight.js";
import sml from "highlight.js/lib/languages/sml";
import "./sml/sml";
import { SML } from "./sml/sml";

function generateCode(target_code) {
  const tarsius_workplace = Blockly.getMainWorkspace();
  let newCode;
  let targetCodeArea = document.getElementById("targetCodeArea");

  switch (target_code) {
    case "sml": {
      targetCodeArea.setAttribute("class", "language-sml");
      newCode = SML.workspaceToCode(tarsius_workplace);

      break;
    }
    default: {
      newCode = "Error - Unknown code";
    }
  }

  targetCodeArea.textContent = newCode;
  hljs.registerLanguage("sml", sml);
  targetCodeArea.removeAttribute("data-highlighted");
  hljs.highlightElement(targetCodeArea);
  return newCode;
}

export { generateCode };
