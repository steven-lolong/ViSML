# Visual SML — TypeScript + Blockly 12 Migration

This folder is the TypeScript migration of Visual SML. All source under
`src` was ported to TypeScript, the build was upgraded to the latest Webpack 5
toolchain, and Blockly was upgraded from the legacy `^9.3.2` line to
`^12.5.1`.

## Getting started

```bash
cd vsml
npm install
npm run typecheck   # tsc --noEmit (0 errors)
npm run build       # webpack -> dist/ (0 errors, 0 warnings)
npm run serve-ng    # dev server
```

## What changed
    // "webpack": "^5.97.1",
    // "webpack-cli": "^6.0.1",
    // "webpack-dev-server": "^5.2.0"
### Toolchain
- **Blockly** `^9.3.2` → `^12.5.1`.
- **Webpack** updated to the latest 5.x, with `webpack-cli` 6 and
  `webpack-dev-server` 5. The dev-server script now uses `webpack serve`.
- Added **TypeScript 5.9** + **ts-loader 9**. `webpack.config.js` compiles both
  `.ts` and `.js` through `ts-loader` (TypeScript `allowJs`), so JavaScript and
  TypeScript are both supported. `resolve.extensions` resolves `.ts` before
  `.js`, so extensionless imports keep working.
- `tsconfig.json` uses pragmatic settings (`strict: false`, `allowJs: true`,
  `moduleResolution: "bundler"`, `skipLibCheck: true`).

### Source migration
- Every `.js` file in `src` became a `.ts` file (assets such as `.css`, `.svg`,
  `.png`, `.ico` and `index.html` were left as-is).
- `import Blockly from "blockly"` (default import) → `import * as Blockly from
  "blockly"`. Modern Blockly is pure ESM with **no default export**, so the old
  default import resolved to `undefined` at runtime.

### Blockly v9 → modern Blockly API changes handled
- **Generators** now dispatch through `generator.forBlock[type]`. Every
  `Blockly.SML["block"] = fn` became `SML.forBlock["block"] = fn`, and the
  custom `SML` generator is exported as a singleton from
  `core/generator/sml/sml.ts` and imported where needed (instead of being
  attached to the — now frozen — Blockly namespace).
- **Mutators**: `new Blockly.Mutator([...], this)` →
  `new Blockly.icons.MutatorIcon([...], this)`. The removed
  `Blockly.Mutator.reconnect` was re-implemented in `core/mutator_helper.ts`.
- **Alignment**: `Blockly.ALIGN_LEFT/RIGHT` → `Blockly.inputs.Align.LEFT/RIGHT`.
- **Input types**: `Blockly.inputTypes` → `Blockly.inputs.inputTypes`.
- **FieldImage**: the 4th constructor argument is `alt` (a string); the old
  `{ alt, flipRtl }` options object was collapsed to the alt string.
- **Custom themes**: `Blockly.Themes.Macaca` (assigning onto the frozen Themes
  namespace) → exported `Macaca` / `MacacaBlackWhite` consts in
  `ui/themes_tarsius.ts`.
- **Custom renderers/fields**: the Macaca Nigra renderer and the icon fields
  were typed with index signatures for their dynamically-assigned members.

### Type support files
- `src/types/modules.d.ts` — ambient declarations for asset imports
  (`*.css`, `*.svg`, `*.png`, …) and the webpack-exposed `assets` / `tarsius`
  globals.
- `src/types/blockly-augment.d.ts` — augments the Blockly `Block` and
  `FieldImage` types with the project's dynamically-assigned members
  (`itemCount_`, `valueConnection_`, `plus`, `minus`, …).

## Known follow-ups
- The block-scope **"Type" context-menu bubble** (`ui/context_menu_workspace.ts`)
  used the removed `Blockly.Bubble` API. It is cast to compile; the bubble
  creation still needs porting to the new `Blockly.bubbles` API to work at
  runtime. All other features are functional.
- `assets/js/fileSvLd.ts` embeds the third-party FileSaver.js polyfill and is
  marked `// @ts-nocheck` (vendored code).
- The legacy/experimental `renderer/tarsius/*` renderer is not registered by the
  app (the Macaca Nigra renderer is used); it was ported to compile cleanly.

## Verification performed
- `tsc --noEmit`: 0 errors.
- `webpack` production build: 0 errors, 0 warnings; `dist/tarsius.js` and
  `dist/assets.js` produced.
- Runtime smoke test (jsdom): the `tarsius` bundle loads all modules and
  `Blockly.inject` runs without throwing.
- Generator check: a `con_int` block with value `42` generates `local _ = 42`
  via the modern `forBlock` dispatch.


## JSON-only serialization (no XML)

The project now uses Blockly JSON serialization exclusively; all XML
serialization was removed.

- Every mutator block defines only `saveExtraState` / `loadExtraState`
  (returning `{ itemCount }`). The legacy `mutationToDom` / `domToMutation`
  hooks were deleted from all 42 blocks.
- File save/load (`menuSaveFile` / `menuLoadFile`) now uses
  `Blockly.serialization.workspaces.save` / `.load` and stores `.vsml` files as
  JSON instead of XML.
- The 7 built-in samples in `sample/sample_loader.ts` were converted to JSON
  workspace state and are loaded with `Blockly.serialization.workspaces.load`
  (with block-append used for the "merge" path).
- `plugin/plus-minus/serialization_helper.ts` reads block state via
  `saveExtraState` only.

Verified: all 7 samples load from JSON and generate correct SML; a
save -> load -> regenerate round-trip reproduces identical output; `tsc` and
`webpack` are clean (0 errors / 0 warnings).
