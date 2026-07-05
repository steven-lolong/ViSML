import * as Blockly from "blockly";

export const Macaca = (Blockly.Theme.defineTheme as any)("nigra", {
  base: Blockly.Themes.Classic,
  blockStyles: {
    program_blocks: { colourPrimary: "#8c84a6", colourSecondary: "#a49abb", colourTertiary: "#c5ced3" },
    constant_blocks: { colourPrimary: "#e7b84a", colourSecondary: "#cf8b3a", colourTertiary: "#f0d27f" },
    identifier_blocks: { colourPrimary: "#4e8ea8", colourSecondary: "#18a6a6", colourTertiary: "#74c7d3" },
    expression_blocks: { colourPrimary: "#18a6a6", colourSecondary: "#2fb7a8", colourTertiary: "#74c7d3" },
    pattern_blocks: { colourPrimary: "#63a36d", colourSecondary: "#2fb7a8", colourTertiary: "#9bc99f" },
    type_blocks: { colourPrimary: "#7d7592", colourSecondary: "#8c84a6", colourTertiary: "#c5ced3" },
    structure_blocks: { colourPrimary: "#4e8ea8", colourSecondary: "#607d8b", colourTertiary: "#9bb6c2" },
    signature_blocks: { colourPrimary: "#607d8b", colourSecondary: "#7d7592", colourTertiary: "#aeb9bf" },
    declaration_blocks: { colourPrimary: "#3c8c5a", colourSecondary: "#63a36d", colourTertiary: "#9bc99f" },
    operator_blocks: { colourPrimary: "#cf8b3a", colourSecondary: "#e7b84a", colourTertiary: "#f0d27f" },
  },
  componentStyles: <any>{
    workspaceBackgroundColour: "#252c31",
    toolboxBackgroundColour: "#263036",
    toolboxForegroundColour: "#eef3f5",
    flyoutBackgroundColour: "#2b3338",
    flyoutForegroundColour: "#eef3f5",
    flyoutOpacity: 1,
    scrollbarColour: "#50606a",
    insertionMarkerColour: "#18a6a6",
    insertionMarkerOpacity: 0.34,
    scrollbarOpacity: 0.72,
    cursorColour: "#18a6a6",
    markerColour: "#2fb7a8",
    blackBackground: "#252c31",
  },
});

export const MacacaBlackWhite = (Blockly.Theme.defineTheme as any)(
  "nigraBlackWhite",
  {
    base: Blockly.Themes.Classic,
    blockStyles: {
      program_blocks: { colourPrimary: "#7d7592", colourSecondary: "#8c84a6", colourTertiary: "#c5ced3" },
      constant_blocks: { colourPrimary: "#e7b84a", colourSecondary: "#cf8b3a", colourTertiary: "#f0d27f" },
      identifier_blocks: { colourPrimary: "#4e8ea8", colourSecondary: "#18a6a6", colourTertiary: "#74c7d3" },
      expression_blocks: { colourPrimary: "#18a6a6", colourSecondary: "#2fb7a8", colourTertiary: "#74c7d3" },
      pattern_blocks: { colourPrimary: "#3c8c5a", colourSecondary: "#63a36d", colourTertiary: "#9bc99f" },
      type_blocks: { colourPrimary: "#8c84a6", colourSecondary: "#7d7592", colourTertiary: "#c5ced3" },
      structure_blocks: { colourPrimary: "#4e8ea8", colourSecondary: "#607d8b", colourTertiary: "#9bb6c2" },
      signature_blocks: { colourPrimary: "#607d8b", colourSecondary: "#7d7592", colourTertiary: "#aeb9bf" },
      declaration_blocks: { colourPrimary: "#3c8c5a", colourSecondary: "#63a36d", colourTertiary: "#9bc99f" },
      operator_blocks: { colourPrimary: "#cf8b3a", colourSecondary: "#e7b84a", colourTertiary: "#f0d27f" },
    },
    componentStyles: <any>{
      workspaceBackgroundColour: "#ffffff",
      toolboxBackgroundColour: "#eceff1",
      toolboxForegroundColour: "#1e252b",
      flyoutBackgroundColour: "#ffffff",
      flyoutForegroundColour: "#1e252b",
      flyoutOpacity: 1,
      scrollbarColour: "#aeb9bf",
      insertionMarkerColour: "#18a6a6",
      insertionMarkerOpacity: 0.3,
      scrollbarOpacity: 0.62,
      cursorColour: "#18a6a6",
      markerColour: "#3c8c5a",
      startHats: true,
      blackBackground: "#ffffff",
    },
  }
);
