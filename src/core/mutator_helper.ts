/**
 * @fileoverview Mutator reconnection helper.
 *
 * Blockly v11 removed the static `Blockly.Mutator.reconnect` utility that the
 * SML mutator blocks rely on when rebuilding their child connections. This file
 * re-implements it with the original v9 semantics so the block `compose`
 * methods keep working unchanged.
 */
import * as Blockly from "blockly/core";

/**
 * Reconnect a saved child connection to a named input of a parent block.
 *
 * Mirrors the behaviour of the removed `Blockly.Mutator.reconnect`: it only
 * connects when the child still exists, the target input is free (or only holds
 * an insertion marker) and the child is not a shadow block.
 *
 * @param connectionChild The child connection to reconnect (may be null).
 * @param block The parent block that owns the input.
 * @param inputName The name of the parent input to connect to.
 * @returns True if a connection was made, otherwise false.
 */
export function reconnect(
  connectionChild: any,
  block: any,
  inputName: string
): boolean {
  if (!connectionChild || !connectionChild.getSourceBlock().workspace) {
    // No connection, or the source block has already been deleted.
    return false;
  }
  const connectionParent = block.getInput(inputName)?.connection;
  if (!connectionParent) {
    return false;
  }
  const currentParentTarget = connectionParent.targetBlock();
  if (currentParentTarget && !currentParentTarget.isInsertionMarker()) {
    // Something real is already connected here; leave it alone.
    return false;
  }
  if (connectionChild.getSourceBlock().isShadow()) {
    // Don't reconnect shadow blocks.
    return false;
  }
  connectionParent.connect(connectionChild);
  return true;
}

export default reconnect;
