import * as Blockly from "blockly";
import { decodeVismlWorkspace } from "./visml_decoder";
import { renderDerivation } from "./formal_codec";
import { factorDerivation } from "./presentation_factoring";
/** Export only complete, structurally decoded workspaces. */
export function preservingWorkspaceToCode(workspace: Blockly.Workspace): string {
    const derivation = decodeVismlWorkspace(Blockly.serialization.workspaces.save(workspace));
    factorDerivation(derivation); // Validate the elaborated seven-constructor grammar too.
    return renderDerivation(derivation, undefined, true);
}
