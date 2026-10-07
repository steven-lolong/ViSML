/* Copyright 2020 Universität Tübingen
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview SML code generator of input primitive for
 *               Visual Programming Language Yet Another [K/C]Compiler Interface
 * @author steven.lolong@uni-tuebingen.de (Steven Lolong)
 */
import * as Blockly from "blockly";
import { SML } from "../sml";

SML.forBlock["con_int"] = function (block) {
  // SML spells negative literals with ~ rather than -.
  let code = block.getFieldValue("inputValue").toString().replace("-", "~");
  return [code, SML.ORDER_NONE];
};

SML.forBlock["con_string"] = function (block) {
  let code = '"' + block.getFieldValue("inputValue") + '"';
  return [code, SML.ORDER_NONE];
};
SML.forBlock["con_char"] = function (block) {
  let code = '#"' + block.getFieldValue("inputValue") + '"';
  return [code, SML.ORDER_NONE];
};
SML.forBlock["con_word"] = function (block) {
  // Word literals are spelled with the `0w` radix prefix; without it the
  // literal reconstructs as an int and the original terminal is lost.
  const spelling = block.getFieldValue("inputValue").toString();
  let code = spelling.startsWith("0w") ? spelling : "0w" + spelling;
  return [code, SML.ORDER_NONE];
};
SML.forBlock["con_float"] = function (block) {
  // The field holds the literal as written (see blocks/constants.ts).
  let code = block.getFieldValue("inputValue").toString().replace("-", "~");
  return [code, SML.ORDER_NONE];
};
