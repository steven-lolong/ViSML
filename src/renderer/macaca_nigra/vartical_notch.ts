import * as Blockly from "blockly";

const NOTCH_WIDTH = 15;
const NOTCH_HEIGHT = 15;

export function makeVerticalSquare() {
  const notchHeight = NOTCH_HEIGHT - 4;

  function makeMainPath(direction) {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(0, notchHeight),
      Blockly.utils.svgPaths.point(direction * NOTCH_WIDTH, 0),
      Blockly.utils.svgPaths.point(0, -notchHeight),
    ]);
  }

  const pathLeft = makeMainPath(1);
  const pathRight = makeMainPath(-1);

  return {
    width: NOTCH_WIDTH,
    height: NOTCH_HEIGHT,
    pathLeft: pathLeft,
    pathRight: pathRight,
  };
}
