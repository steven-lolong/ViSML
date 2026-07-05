import * as Blockly from "blockly";


// Start Blocks
import "./core/blocks/programs/program";
import "./core/blocks/constants";
import "./core/blocks/identifiers";
import "./core/blocks/expressions/expressions";
import "./core/blocks/expressions/expression_let_in_end";
import "./core/blocks/expressions/expression_list";
import "./core/blocks/expressions/expression_record";
import "./core/blocks/expressions/exprow";
import "./core/blocks/expressions/expression_tuple";
import "./core/blocks/expressions/expression_sequence";
import "./core/blocks/expressions/match";
import "./core/blocks/patterns/patterns";
import "./core/blocks/patterns/pattern_record";
import "./core/blocks/patterns/patrows";
import "./core/blocks/patterns/pattern_tuple";
import "./core/blocks/patterns/pattern_list";
import "./core/blocks/types/types";
import "./core/blocks/types/type_constructor";
import "./core/blocks/types/type_tuple";
import "./core/blocks/types/type_record";
import "./core/blocks/types/type_primitives";
import "./core/blocks/declarations/declarations";
import "./core/blocks/declarations/declaration_sequence";
import "./core/blocks/declarations/declaration_open";
import "./core/blocks/declarations/declaration_nonfix";
import "./core/blocks/declarations/declaration_infix";
import "./core/blocks/declarations/declaration_infiixr";
import "./core/blocks/declarations/value/declaration_val";
import "./core/blocks/declarations/value/valbind";
import "./core/blocks/identifier_long_var";
import "./core/blocks/declarations/function/declaration_fun";
import "./core/blocks/declarations/function/funmatch";
import "./core/blocks/declarations/function/funmatch_infix_n";
import "./core/blocks/declarations/function/funmatch_nonfix";
import "./core/blocks/declarations/typbind";
import "./core/blocks/declarations/datbind";
import "./core/blocks/declarations/conbind";
import "./core/blocks/declarations/exnbind";
import "./core/blocks/module_language/structures/str";
import "./core/blocks/module_language/signatures/sig";
import "./core/blocks/module_language/signatures/typrefin";
import "./core/blocks/module_language/signatures/spec";
import "./core/blocks/module_language/signatures/valdesc";
import "./core/blocks/module_language/signatures/typdesc";
import "./core/blocks/module_language/signatures/datdesc";
import "./core/blocks/module_language/signatures/condesc";
import "./core/blocks/module_language/signatures/spec_sequence";
import "./core/blocks/module_language/signatures/exndesc";
import "./core/blocks/module_language/signatures/strdesc";
import "./core/blocks/module_language/signatures/spec_inclusion";
import "./core/blocks/module_language/signatures/spec_type_sharing";
import "./core/blocks/programs/fctbind";
import "./core/blocks/programs/sigbind";
import "./core/blocks/expressions/expression_primtv_operators";
import "./core/blocks/declarations/strbind";

// Start Generators
import "./core/generator/sml/sml";
import "./core/generator/sml/blocks/programs/program";
import "./core/generator/sml/blocks/constants";
import "./core/generator/sml/blocks/identifiers";
import "./core/generator/sml/blocks/expressions/expressions";
import "./core/generator/sml/blocks/expressions/expression_let_in_end";
import "./core/generator/sml/blocks/expressions/expression_list";
import "./core/generator/sml/blocks/expressions/expression_record";
import "./core/generator/sml/blocks/expressions/exprow";
import "./core/generator/sml/blocks/expressions/expression_tuple";
import "./core/generator/sml/blocks/expressions/expression_sequence";
import "./core/generator/sml/blocks/expressions/match";
import "./core/generator/sml/blocks/patterns/patterns";
import "./core/generator/sml/blocks/patterns/pattern_record";
import "./core/generator/sml/blocks/patterns/patrows";
import "./core/generator/sml/blocks/patterns/pattern_tuple";
import "./core/generator/sml/blocks/patterns/pattern_list";
import "./core/generator/sml/blocks/types/types";
import "./core/generator/sml/blocks/types/type_constructor";
import "./core/generator/sml/blocks/types/type_tuple";
import "./core/generator/sml/blocks/types/type_record";
import "./core/generator/sml/blocks/types/type_primitives";
import "./core/generator/sml/blocks/declarations/declarations";
import "./core/generator/sml/blocks/declarations/declaration_sequence";
import "./core/generator/sml/blocks/declarations/declaration_open";
import "./core/generator/sml/blocks/declarations/declaration_nonfix";
import "./core/generator/sml/blocks/declarations/declaration_infix";
import "./core/generator/sml/blocks/declarations/declaration_infixr";
import "./core/generator/sml/blocks/declarations/value/declaration_val";
import "./core/generator/sml/blocks/declarations/value/valbind";
import "./core/generator/sml/blocks/identifier_long_var";
import "./core/generator/sml/blocks/declarations/function/declaration_fun";
import "./core/generator/sml/blocks/declarations/function/funmatch";
import "./core/generator/sml/blocks/declarations/function/funmatch_infix_n";
import "./core/generator/sml/blocks/declarations/function/funmatch_nonfix";
import "./core/generator/sml/blocks/declarations/typbind";
import "./core/generator/sml/blocks/declarations/datbind";
import "./core/generator/sml/blocks/declarations/conbind";
import "./core/generator/sml/blocks/declarations/exnbind";
import "./core/generator/sml/blocks/module_language/structures/str";
import "./core/generator/sml/blocks/module_language/signatures/sig";
import "./core/generator/sml/blocks/module_language/signatures/typrefin";
import "./core/generator/sml/blocks/module_language/signatures/spec";
import "./core/generator/sml/blocks/module_language/signatures/valdesc";
import "./core/generator/sml/blocks/module_language/signatures/typdesc";
import "./core/generator/sml/blocks/module_language/signatures/datdesc";
import "./core/generator/sml/blocks/module_language/signatures/condesc";
import "./core/generator/sml/blocks/module_language/signatures/spec_sequence";
import "./core/generator/sml/blocks/module_language/signatures/exndesc";
import "./core/generator/sml/blocks/module_language/signatures/strdesc";
import "./core/generator/sml/blocks/module_language/signatures/spec_inclusion";
import "./core/generator/sml/blocks/module_language/signatures/spec_type_sharing";
import "./core/generator/sml/blocks/programs/fctbind";
import "./core/generator/sml/blocks/programs/sigbind";
import "./core/generator/sml/blocks/expressions/expression_primtv_operators";
import "./core/generator/sml/blocks/declarations/strbind";
import { applyGrammarTooltips } from "./core/blocks/grammar_tooltips";

// Start UI
import "./renderer/macaca_nigra/macacanigra_renderer";

import { generateCode } from "./core/generator/code_generator";
import { smlToVismlWorkspaceState } from "./core/parser/sml_to_visml";
import {
  applySmlEditorText,
  forceSyncSmlEditorFromCode,
  initSmlCodeEditor,
  syncSmlEditorFromCode,
} from "./ui/sml_code_editor";

import {
  registerFirstContextMenuOptions,
  unregisteredUnnecessaryMenu,
} from "./ui/context_menu_workspace";

import { toolbox } from "./ui/toolbox";
import { MacacaBlackWhite } from "./ui/themes_tarsius";
import { setThemestarsius, setThemesBnW } from "./assets/js/theme_changer";
import {
  getAutosaveIntervalMinutes,
  menuLoadAutosave,
  menuLoadFile,
  menuSaveFile,
  saveAutosave,
  scheduleAutosave,
  setAutosaveIntervalMinutes,
  startAutosaveTimer,
} from "./assets/js/fileSvLd";
import { sampleLoader } from "./sample/sample_loader";
import { buildHtmlToolbox } from "./ui/html_toolbox";

// hljs.initHighlightingOnLoad();
var blockArea = document.getElementById("tarsiusWorkspaceDiv");

// Updating context menu
unregisteredUnnecessaryMenu();
registerFirstContextMenuOptions();
applyGrammarTooltips();

const tarsiusWorkspace = Blockly.inject(blockArea, {
  // plugins:
  // theme: Blockly.Themes.Macaca,
  theme: MacacaBlackWhite,
  renderer: "MNRenderer",
  // renderer: "TarsiusRenderer",
  collapse: true,
  scrollbars: true,
  // css: false, //default is true
  sounds: false,
  grid: {
    spacing: 20,
    length: 3,
    colour: "#fff",
    snap: true,
  },
  move: {
    scrollbars: {
      horizontal: true,
      vertical: true,
    },
    drag: true,
    wheel: false,
  },
  zoom: {
    controls: true,
    wheel: true,
    startScale: 1.0,
    maxScale: 3,
    minScale: 0.3,
    scaleSpeed: 1.2,
    pinch: true,
  },
  trashcan: true,
});

var main_file_block = {
  "blocks": {
    "languageVersion": 0,
    "blocks": [
      {
        "type": "program",
        "id": "wka+5-ZSnLLMV2hW(||?",
        "x": 50,
        "y": 110,
        "deletable": false,
        "movable": true,
        "editable": true
      }
    ]
  }
};

function loadMainFileBlock() {
  Blockly.serialization.workspaces.load(main_file_block, tarsiusWorkspace);
  const mainBlock = tarsiusWorkspace.getBlockById("wka+5-ZSnLLMV2hW(||?") as any;
  if (!mainBlock) return;
  mainBlock.setDeletable(false);
  mainBlock.setMovable(true);
  mainBlock.setEditable(true);
}

loadMainFileBlock();
// tarsiusWorkspace.addChangeListener(Blockly.Events.disableOrphans);

function updateVisualSmlStatus(message?: string) {
  const statusLine = document.getElementById("statusLine");
  const blockCount = document.getElementById("blockCount");
  const zoomLabel = document.getElementById("zoomLabel");

  if (message && statusLine) statusLine.textContent = message;
  if (blockCount) {
    blockCount.textContent = String(tarsiusWorkspace.getAllBlocks(false).length);
  }
  if (zoomLabel) {
    const zoomPercent = Math.round((tarsiusWorkspace.scale || 1) * 100);
    zoomLabel.textContent = `${zoomPercent}%`;
    zoomLabel.title = `Blockly zoom level: ${zoomPercent}%`;
  }

  const windowAny = window as any;
  if (typeof windowAny.visualSmlUpdateStatus === "function") {
    windowAny.visualSmlUpdateStatus(message);
  }
}

let lastGeneratedCode = "";

function refreshGeneratedCode() {
  lastGeneratedCode = generateCode("sml") ?? "";
  syncSmlEditorFromCode(lastGeneratedCode);
  updateVisualSmlStatus("Generated SML refreshed.");
  return lastGeneratedCode;
}

function convertSmlToVisml(source: string) {
  const state = smlToVismlWorkspaceState(source);
  const previousState = Blockly.serialization.workspaces.save(tarsiusWorkspace);
  try {
    tarsiusWorkspace.clear();
    Blockly.serialization.workspaces.load(state, tarsiusWorkspace);
  } catch (error) {
    // Loading failed halfway: restore the workspace as it was.
    tarsiusWorkspace.clear();
    Blockly.serialization.workspaces.load(previousState, tarsiusWorkspace);
    throw error;
  }
  const mainBlock = tarsiusWorkspace.getBlockById("wka+5-ZSnLLMV2hW(||?") as any;
  if (mainBlock) {
    mainBlock.setDeletable(false);
    mainBlock.setMovable(true);
    mainBlock.setEditable(true);
  }
  Blockly.svgResize(tarsiusWorkspace);
  refreshGeneratedCode();
  scheduleAutosave();
  updateVisualSmlStatus("SML converted to ViSML blocks.");
}

/** Convert the Code tab text into blocks right now (used by the Convert button). */
function applySmlEditorNow(): boolean {
  const converted = applySmlEditorText({ reportEmpty: true });
  if (converted) {
    // Normalize the editor to the canonical generated layout on explicit convert.
    forceSyncSmlEditorFromCode(lastGeneratedCode, { preserveStatus: true });
  }
  return converted;
}

function eventListenerFortarsius(event: Blockly.Events.Abstract) {
  Blockly.Events.disableOrphans(event);
  lastGeneratedCode = generateCode("sml") ?? "";
  syncSmlEditorFromCode(lastGeneratedCode);
  scheduleAutosave();
  updateVisualSmlStatus("Generated SML updated.");
}

initSmlCodeEditor({ convertSmlToBlocks: convertSmlToVisml });

tarsiusWorkspace.addChangeListener(eventListenerFortarsius);
startAutosaveTimer();

// Render the custom HTML toolbox (left column) from the toolbox definition.
buildHtmlToolbox(tarsiusWorkspace);

let resizeFrame = 0;

function updatetarsiusWorkspaceSize() {
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  document.documentElement.style.setProperty("--viewport-height", `${viewportHeight}px`);

  if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
  resizeFrame = window.requestAnimationFrame(() => {
    Blockly.svgResize(tarsiusWorkspace);
    updateVisualSmlStatus();
    resizeFrame = 0;
  });
}
// update tarsiusWorkspace when the window size is change
window.addEventListener("resize", updatetarsiusWorkspaceSize, false);
window.addEventListener("orientationchange", updatetarsiusWorkspaceSize, false);
window.visualViewport?.addEventListener("resize", updatetarsiusWorkspaceSize, false);
window.addEventListener("load", updatetarsiusWorkspaceSize, false);
window.setTimeout(() => {
  refreshGeneratedCode();
  updatetarsiusWorkspaceSize();
}, 0);

export {
  tarsiusWorkspace,
  setThemestarsius,
  setThemesBnW,
  menuLoadFile,
  menuLoadAutosave,
  menuSaveFile,
  saveAutosave,
  getAutosaveIntervalMinutes,
  setAutosaveIntervalMinutes,
  startAutosaveTimer,
  sampleLoader,
  refreshGeneratedCode,
  convertSmlToVisml,
  applySmlEditorNow,
};
