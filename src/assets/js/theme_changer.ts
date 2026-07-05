import * as Blockly from "blockly";
import { tarsiusWorkspace } from "../../tarsius";
import { Macaca, MacacaBlackWhite } from "../../ui/themes_tarsius";

export function setThemestarsius() {
  tarsiusWorkspace.setTheme(Macaca);
}

export function setThemesBnW() {
  tarsiusWorkspace.setTheme(MacacaBlackWhite);
}
