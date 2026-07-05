/**
 * Type augmentations for Blockly.
 *
 * Visual SML attaches a few project-specific members to Blockly blocks and
 * fields at runtime (via mutator and plus/minus logic). These declarations make
 * the TypeScript compiler aware of them. They are typed loosely on purpose,
 * matching the pragmatic nature of the migration.
 */
import "blockly";
import "blockly/core";

declare module "blockly/core" {
  interface Block {
    itemCount_?: number;
    valueConnection_?: any;
    updateShape_?: (...args: any[]) => void;
    plus?: (...args: any[]) => void;
    minus?: (...args: any[]) => void;
    initSvg?: () => void;
  }

  interface FieldImage {
    args_?: any;
  }
}

declare module "blockly" {
  interface Block {
    itemCount_?: number;
    valueConnection_?: any;
    updateShape_?: (...args: any[]) => void;
    plus?: (...args: any[]) => void;
    minus?: (...args: any[]) => void;
    initSvg?: () => void;
  }

  interface FieldImage {
    args_?: any;
  }
}
