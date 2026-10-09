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

## Lexical assembly and renderer regressions

The renderer joins nonlexical components with spaces. Character cells are
concatenated only in declared lexical roles, without trimming their payload.
The module-ascription shorthand `:` with optional `>` is assembled as one token
only at the three source-owned sequence sites below, and only when the local
RHS has fixed `:`, optional fixed `>`, and a `sig` child:

| Production | Sequence path |
| --- | --- |
| `strbind.0` | `rhs/1/present` |
| `fctbind.0` | `rhs/6/present` |
| `fctbind.1` | `rhs/4/present` |

The `str.3` production already owns a fixed `:>` token. An expression annotation
such as `1 : >` retains two separate symbolic tokens. The compact importer
accepts symbolic type constructors, including qualified final components,
while keeping reserved symbols and alphabetic structure qualifiers distinct.

Run `npm run test:preservation` for exact complete-state codec inverses,
generated and compact Blockly save/load, and renderer checks. Its dedicated
renderer cases compare fixed expected spellings and the entire derivation state;
source regressions include symbolic type annotations, transparent/opaque module
ascriptions, tuple types, qualified names, literal spacing and invalid names.
`npm run test:importer-repair` exercises the existing importer repairs and
negative probes. These bounded checks do not establish universal conformance.

To re-import and export the paper's 42 original corpus sources with the current
checkout, build the headless bundle with `npm run test:preservation`, then run
the following with the paper artifact directory as the first argument's prefix:

```
node test/run_t2bb_fresh_corpus.js ARTIFACT/results/importer_repair/realistic_sml_states.json.gz /tmp/visml-fresh-corpus.json.gz
python3 ARTIFACT/scripts/audit_token_serialization.py --states /tmp/visml-fresh-corpus.json.gz --output /tmp/visml-fresh-corpus-audit.json
```

The first command executes the current importer and renderer and checks full
canonical/factored derivation inverses. The second uses the independent Python
source-frontier oracle to check the new exports. The corpus runner does not
materialize all large workspaces for live save/load; that behavior is checked
by the bounded preservation and generated-backend suites. The audit script's
boundary text describes its own offline stage. Its use on fresh outputs should
be accompanied by the corpus runner's execution report.

## Optional-state and generated-backend evidence

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
