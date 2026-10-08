# Preservation backends

`formal_codec.ts` defines the exact derivation registry, validator and canonical
graph. `blockly_backend.ts` compiles the seven-constructor elaborated grammar
to actual Blockly block definitions. Local extra state holds descriptors,
constructor state and witnesses; child trees exist only as Blockly connections.
Lexical predicates can be supplied through `Grammar.terminal_classes`.

New optional states use `{present: false}` or `{present: true, value: ...}`.
Presence remains distinct when the operand is epsilon, another optional, or an
empty repetition. Codec traversal, active shapes, context-menu edits, fields,
connections and save/load retain that tag. Old `null`/bare-value encodings remain
accepted only when the operand constructor is neither `eps` nor `opt`: their
state representations cannot themselves be null. Nullable nonterminal children
are derivation objects and do not have that collision. Ambiguous old forms and
malformed tags are rejected; accepted old derivations keep their encoding form.

The paper artifact's `make optional-refinement VISML_DIR=/path/to/ViSML` runs
31 generic fixtures, 21 edited states and malformed-state controls with a
separate Python saved-connection decoder. These current records are separate
from the frozen SML and MiniJava corpus evidence.

`alias_compaction.ts` minimizes production-block count among legal non-root,
strict unary alias deletions with one witness per edge. It uses the standard
tree independent-set recurrence. It does not optimize arbitrary visual designs.

The existing compact ViSML decoder selects production IDs through explicit
bindings and context. Its flat program/declaration sequences reconstruct a
right-associated tree; it is not an encoder for every source derivation.

Build with `npm run build`; open `docs/formal_editor.html` through a local web
server for the generated demonstration. Optional, repetition, branch and witness
edits are available on each block's context menu. Export rejects incomplete
or disconnected workspaces. The demonstration uses the compact importer to
select an initial tree, then represents that tree in the generated backend.

The paper artifact supplies expected derivations constructed independently in
Python. After building the headless bundle, run:

```
node test/run_blockly_refinement.js FIXTURES.json SAVED_STATES.json
```

The independent Python saved-state reader and exhaustive alias-subset checker
are in the paper artifact. Passing these bounded checks does not verify the
Blockly library or the SML grammar transcription.
