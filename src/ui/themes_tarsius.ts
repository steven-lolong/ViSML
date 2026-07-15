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
    workspaceBackgroundColour: "#171a20",
    toolboxBackgroundColour: "#1a1d24",
    toolboxForegroundColour: "#f1f3f5",
    flyoutBackgroundColour: "#1d2027",
    flyoutForegroundColour: "#f1f3f5",
    flyoutOpacity: 1,
    scrollbarColour: "#414955",
    insertionMarkerColour: "#5b8def",
    insertionMarkerOpacity: 0.34,
    scrollbarOpacity: 0.72,
    cursorColour: "#5b8def",
    markerColour: "#58a6ff",
    blackBackground: "#171a20",
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
      workspaceBackgroundColour: "#f7f8fa",
      toolboxBackgroundColour: "#f7f8fa",
      toolboxForegroundColour: "#1e252b",
      flyoutBackgroundColour: "#ffffff",
      flyoutForegroundColour: "#1e252b",
      flyoutOpacity: 1,
      scrollbarColour: "#b9c0ca",
      insertionMarkerColour: "#356fd2",
      insertionMarkerOpacity: 0.3,
      scrollbarOpacity: 0.62,
      cursorColour: "#356fd2",
      markerColour: "#3c8c5a",
      startHats: true,
      blackBackground: "#f7f8fa",
    },
  }
);
