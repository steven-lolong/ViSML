/**
 * Color definition
 * 
 * 

Here’s a 9-color palette designed to be colorblind-friendly (works well across common types like deuteranopia & protanopia, and maintains strong contrast):
const COLOR_PROGRAM = "#4D4D4D";
const COLOR_CONSTANT = "#CC79A7";
const COLOR_IDENTIFIER = "#D55E00";
const COLOR_EXPRESSION = "#E69F00";
const COLOR_PATTERN = "#F0E442"; "#FFE066"
const COLOR_TYPE = "#0E9AA7";
const COLOR_STRUCTURE = "#009E73";
const COLOR_SIGNATURE = "#56B4E9";
const COLOR_DECLARATION = "#0072B2";
const COLOR_ANY = "#e6194B";


🌙 Dark Mode Colorblind-Friendly Palette
Bright Blue — #4DA3FF
Light Sky Blue — #8FD3FF
Vivid Green — #2ECC71
Bright Teal — #2AB7CA
Soft Yellow — #FFE066
Warm Orange — #FF9F1C
Soft Red — #FF6B6B
Orchid Purple — #C77DFF
Light Gray — #B0B0B0

🎨 9 Distinct Colors Palette

Pink — #FF66C4
Orange — #F77F00
Purple — #9D4EDD
Yellow — #FFD166
Cyan — #00B4D8
Brown — #8D5524
Green — #2A9D8F
Blue — #1D4ED8
Red — #E63946

const COLOR_PROGRAM = "#4D4D4D";
const COLOR_CONSTANT = "#FF66C4";
const COLOR_IDENTIFIER = "#F77F00";
const COLOR_EXPRESSION = "#9D4EDD";
const COLOR_PATTERN = "#00B4D8";
const COLOR_TYPE = "#FFD166";
const COLOR_STRUCTURE = "#8D5524";
const COLOR_SIGNATURE = "#2A9D8F";
const COLOR_DECLARATION = "#1D4ED8";
const COLOR_ANY = "#E63946";

 */

const COLOR_PROGRAM = "#8839ef";
const COLOR_PROGRAM_SUB = "#b7bdf8";
const COLOR_CONSTANT = "#df8e1d";
const COLOR_IDENTIFIER = "#1e66f5";
const COLOR_IDENTIFIER_SUB = "#8aadf4";
const COLOR_EXPRESSION = "#179299";
const COLOR_EXPRESSION_SUB = "#8bd5ca";
const COLOR_PATTERN = "#40a02b";
const COLOR_PATTERN_SUB = "#a6da95";
const COLOR_TYPE = "#d20f39";
const COLOR_TYPE_SUB = "#f4dbd6";
const COLOR_STRUCTURE = "#04a5e5";
const COLOR_SIGNATURE = "#7287fd";
const COLOR_SIGNATURE_SUB = "#c6a0f6";
const COLOR_DECLARATION = "#8839ef";
const COLOR_DECLARATION_SUB = "#ea76cb";
const COLOR_OPERATOR = "#fe640b";
const COLOR_ANY = "#e64553";

export default function getColorByType(type) {
  switch (type) {
    case "program":
      return COLOR_PROGRAM;
    case "program_sub":
      return COLOR_PROGRAM_SUB;
    case "constant":
      return COLOR_CONSTANT;
    case "identifier":
      return COLOR_IDENTIFIER;
    case "identifier_sub":
      return COLOR_IDENTIFIER_SUB;
    case "expression":
      return COLOR_EXPRESSION;
    case "expression_sub":
      return COLOR_EXPRESSION_SUB;
    case "pattern":
      return COLOR_PATTERN;
    case "pattern_sub":
      return COLOR_PATTERN_SUB;
    case "type":
      return COLOR_TYPE;
    case "type_sub":
      return COLOR_TYPE_SUB;
    case "structure":
      return COLOR_STRUCTURE;
    case "signature":
      return COLOR_SIGNATURE;
    case "signature_sub":
      return COLOR_SIGNATURE_SUB;
    case "declaration":
      return COLOR_DECLARATION;
    case "declaration_sub":
      return COLOR_DECLARATION_SUB;
    case "operator":
      return COLOR_OPERATOR;
    default:
      return COLOR_ANY;
  }
}
