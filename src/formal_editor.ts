import * as Blockly from "blockly";
import { createBlocklyBackend } from "./core/preservation/blockly_backend";
import { factoredGrammar, factorDerivation, unfactorDerivation } from "./core/preservation/presentation_factoring";
import { make, renderDerivation } from "./core/preservation/formal_codec";
import { smlToVismlWorkspaceState } from "./core/parser/sml_to_visml";
import { decodeVismlWorkspace } from "./core/preservation/visml_decoder";

const backend = createBlocklyBackend(factoredGrammar, "generated_sml");
const workspace = Blockly.inject("workspace", { toolbox: backend.toolbox as any, trashcan: true });
const source = document.getElementById("source") as HTMLTextAreaElement;
const result = document.getElementById("result") as HTMLTextAreaElement;
const status = document.getElementById("status") as HTMLParagraphElement;
const run = (action: () => void) => { try { action(); status.textContent = "Complete derivation exported."; } catch (e) { result.value = ""; status.textContent = String(e.message || e); } };
Blockly.serialization.workspaces.load(backend.encode(factorDerivation(make("prog.3"))), workspace);
document.getElementById("import").onclick = () => run(() => {
    const d = factorDerivation(decodeVismlWorkspace(smlToVismlWorkspaceState(source.value)));
    workspace.clear();
    Blockly.serialization.workspaces.load(backend.encode(d, (document.getElementById("compact") as HTMLInputElement).checked), workspace);
});
document.getElementById("export").onclick = () => run(() => {
    result.value = renderDerivation(unfactorDerivation(backend.decode(backend.save(workspace))), undefined, true);
});
document.getElementById("certificate").onclick = () => run(() => {
    result.value = JSON.stringify(backend.decode(backend.save(workspace)), null, 2);
});
