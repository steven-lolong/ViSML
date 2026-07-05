/**
 * @fileoverview Headless round-trip harness entry.
 *
 * Bundled by webpack.test.config.js for Node. Registers every ViSML block
 * and SML generator (same list as src/tarsius.ts, minus the DOM-only UI
 * modules) and exposes helpers that let test/run_roundtrip.js exercise the
 * full text -> blocks -> text pipeline without a browser.
 */

import * as Blockly from "blockly";

// Blocks (kept in sync with src/tarsius.ts)
import "../src/core/blocks/programs/program";
import "../src/core/blocks/constants";
import "../src/core/blocks/identifiers";
import "../src/core/blocks/expressions/expressions";
import "../src/core/blocks/expressions/expression_let_in_end";
import "../src/core/blocks/expressions/expression_list";
import "../src/core/blocks/expressions/expression_record";
import "../src/core/blocks/expressions/exprow";
import "../src/core/blocks/expressions/expression_tuple";
import "../src/core/blocks/expressions/expression_sequence";
import "../src/core/blocks/expressions/match";
import "../src/core/blocks/patterns/patterns";
import "../src/core/blocks/patterns/pattern_record";
import "../src/core/blocks/patterns/patrows";
import "../src/core/blocks/patterns/pattern_tuple";
import "../src/core/blocks/patterns/pattern_list";
import "../src/core/blocks/types/types";
import "../src/core/blocks/types/type_constructor";
import "../src/core/blocks/types/type_tuple";
import "../src/core/blocks/types/type_record";
import "../src/core/blocks/types/type_primitives";
import "../src/core/blocks/declarations/declarations";
import "../src/core/blocks/declarations/declaration_sequence";
import "../src/core/blocks/declarations/declaration_open";
import "../src/core/blocks/declarations/declaration_nonfix";
import "../src/core/blocks/declarations/declaration_infix";
import "../src/core/blocks/declarations/declaration_infiixr";
import "../src/core/blocks/declarations/value/declaration_val";
import "../src/core/blocks/declarations/value/valbind";
import "../src/core/blocks/identifier_long_var";
import "../src/core/blocks/declarations/function/declaration_fun";
import "../src/core/blocks/declarations/function/funmatch";
import "../src/core/blocks/declarations/function/funmatch_infix_n";
import "../src/core/blocks/declarations/function/funmatch_nonfix";
import "../src/core/blocks/declarations/typbind";
import "../src/core/blocks/declarations/datbind";
import "../src/core/blocks/declarations/conbind";
import "../src/core/blocks/declarations/exnbind";
import "../src/core/blocks/module_language/structures/str";
import "../src/core/blocks/module_language/signatures/sig";
import "../src/core/blocks/module_language/signatures/typrefin";
import "../src/core/blocks/module_language/signatures/spec";
import "../src/core/blocks/module_language/signatures/valdesc";
import "../src/core/blocks/module_language/signatures/typdesc";
import "../src/core/blocks/module_language/signatures/datdesc";
import "../src/core/blocks/module_language/signatures/condesc";
import "../src/core/blocks/module_language/signatures/spec_sequence";
import "../src/core/blocks/module_language/signatures/exndesc";
import "../src/core/blocks/module_language/signatures/strdesc";
import "../src/core/blocks/module_language/signatures/spec_inclusion";
import "../src/core/blocks/module_language/signatures/spec_type_sharing";
import "../src/core/blocks/programs/fctbind";
import "../src/core/blocks/programs/sigbind";
import "../src/core/blocks/expressions/expression_primtv_operators";
import "../src/core/blocks/declarations/strbind";

// Generators (kept in sync with src/tarsius.ts)
import "../src/core/generator/sml/sml";
import "../src/core/generator/sml/blocks/programs/program";
import "../src/core/generator/sml/blocks/constants";
import "../src/core/generator/sml/blocks/identifiers";
import "../src/core/generator/sml/blocks/expressions/expressions";
import "../src/core/generator/sml/blocks/expressions/expression_let_in_end";
import "../src/core/generator/sml/blocks/expressions/expression_list";
import "../src/core/generator/sml/blocks/expressions/expression_record";
import "../src/core/generator/sml/blocks/expressions/exprow";
import "../src/core/generator/sml/blocks/expressions/expression_tuple";
import "../src/core/generator/sml/blocks/expressions/expression_sequence";
import "../src/core/generator/sml/blocks/expressions/match";
import "../src/core/generator/sml/blocks/patterns/patterns";
import "../src/core/generator/sml/blocks/patterns/pattern_record";
import "../src/core/generator/sml/blocks/patterns/patrows";
import "../src/core/generator/sml/blocks/patterns/pattern_tuple";
import "../src/core/generator/sml/blocks/patterns/pattern_list";
import "../src/core/generator/sml/blocks/types/types";
import "../src/core/generator/sml/blocks/types/type_constructor";
import "../src/core/generator/sml/blocks/types/type_tuple";
import "../src/core/generator/sml/blocks/types/type_record";
import "../src/core/generator/sml/blocks/types/type_primitives";
import "../src/core/generator/sml/blocks/declarations/declarations";
import "../src/core/generator/sml/blocks/declarations/declaration_sequence";
import "../src/core/generator/sml/blocks/declarations/declaration_open";
import "../src/core/generator/sml/blocks/declarations/declaration_nonfix";
import "../src/core/generator/sml/blocks/declarations/declaration_infix";
import "../src/core/generator/sml/blocks/declarations/declaration_infixr";
import "../src/core/generator/sml/blocks/declarations/value/declaration_val";
import "../src/core/generator/sml/blocks/declarations/value/valbind";
import "../src/core/generator/sml/blocks/identifier_long_var";
import "../src/core/generator/sml/blocks/declarations/function/declaration_fun";
import "../src/core/generator/sml/blocks/declarations/function/funmatch";
import "../src/core/generator/sml/blocks/declarations/function/funmatch_infix_n";
import "../src/core/generator/sml/blocks/declarations/function/funmatch_nonfix";
import "../src/core/generator/sml/blocks/declarations/typbind";
import "../src/core/generator/sml/blocks/declarations/datbind";
import "../src/core/generator/sml/blocks/declarations/conbind";
import "../src/core/generator/sml/blocks/declarations/exnbind";
import "../src/core/generator/sml/blocks/module_language/structures/str";
import "../src/core/generator/sml/blocks/module_language/signatures/sig";
import "../src/core/generator/sml/blocks/module_language/signatures/typrefin";
import "../src/core/generator/sml/blocks/module_language/signatures/spec";
import "../src/core/generator/sml/blocks/module_language/signatures/valdesc";
import "../src/core/generator/sml/blocks/module_language/signatures/typdesc";
import "../src/core/generator/sml/blocks/module_language/signatures/datdesc";
import "../src/core/generator/sml/blocks/module_language/signatures/condesc";
import "../src/core/generator/sml/blocks/module_language/signatures/spec_sequence";
import "../src/core/generator/sml/blocks/module_language/signatures/exndesc";
import "../src/core/generator/sml/blocks/module_language/signatures/strdesc";
import "../src/core/generator/sml/blocks/module_language/signatures/spec_inclusion";
import "../src/core/generator/sml/blocks/module_language/signatures/spec_type_sharing";
import "../src/core/generator/sml/blocks/programs/fctbind";
import "../src/core/generator/sml/blocks/programs/sigbind";
import "../src/core/generator/sml/blocks/expressions/expression_primtv_operators";
import "../src/core/generator/sml/blocks/declarations/strbind";

import { SML } from "../src/core/generator/sml/sml";
import { smlToVismlWorkspaceState, SmlParseError } from "../src/core/parser/sml_to_visml";
import { sampleWorkspaces } from "../src/sample/sample_loader";

export { Blockly, SML, smlToVismlWorkspaceState, SmlParseError, sampleWorkspaces };

/** Walk a workspace state and collect every referenced block type. */
export function collectBlockTypes(state: any): string[] {
  const types: string[] = [];
  const visit = (blockState: any) => {
    if (!blockState || typeof blockState !== "object") return;
    if (blockState.type) types.push(blockState.type);
    for (const key of Object.keys(blockState.inputs ?? {})) {
      visit(blockState.inputs[key].block);
    }
    if (blockState.next) visit(blockState.next.block);
  };
  for (const top of state?.blocks?.blocks ?? []) visit(top);
  return types;
}

/** Report a type referenced by the state that has no registered block. */
export function findUnregisteredType(state: any): string | undefined {
  return collectBlockTypes(state).find((type) => !(Blockly as any).Blocks[type]);
}

/**
 * Load a parsed workspace state into a headless workspace and generate SML.
 * @returns The generated code and the loaded block types (sorted).
 */
export function stateToCode(state: any): { code: string; blockTypes: string[] } {
  const workspace = new Blockly.Workspace();
  try {
    Blockly.serialization.workspaces.load(state, workspace);
    const code: string = SML.workspaceToCode(workspace);
    const blockTypes = workspace.getAllBlocks(false).map((b: any) => b.type).sort();
    return { code, blockTypes };
  } finally {
    workspace.dispose();
  }
}
