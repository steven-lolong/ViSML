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
  const raw = block.getFieldValue("inputValue").toString();
  // Older serialized workspaces store only the decimal payload; newer parser
  // states still round-trip through the same field.  Emit the SML word prefix
  // exactly once.
  const code = raw.startsWith("0w") ? raw : `0w${raw}`;
  return [code, SML.ORDER_NONE];
};
SML.forBlock["con_float"] = function (block) {
  // Preserve the fractional spelling instead of collapsing the literal to ().
  // inputValue is text so leading zeroes (3.05) survive the round trip.
  const whole = block.getFieldValue("NAME").toString().replace("-", "~");
  const fraction = block.getFieldValue("inputValue").toString();
  return [`${whole}.${fraction}`, SML.ORDER_NONE];
};
