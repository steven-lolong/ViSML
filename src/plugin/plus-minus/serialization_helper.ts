/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Returns the extra state of the given block as a stringified JSON object,
 * using the Blockly v11 `saveExtraState` hook.
 * @param block The block to get the extra state of.
 * @returns A stringified version of the block's extra state ("" if none).
 */
export function getExtraBlockState(block: any): string {
  if (block.saveExtraState) {
    const state = block.saveExtraState();
    return state ? JSON.stringify(state) : "";
  }
  return "";
}
