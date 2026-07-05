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
  let code = block.getFieldValue("inputValue").toString().replace("-", "~");
  return [code, SML.ORDER_NONE];
};
SML.forBlock["con_float"] = function (block) {
  let code = "()";
  return [code, SML.ORDER_NONE];
};
