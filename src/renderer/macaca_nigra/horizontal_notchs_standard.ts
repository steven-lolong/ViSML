import * as Blockly from "blockly";

const nWidth = 10;
const nHeight = 10;
const cornerRadius = 10;
const tHeight = 10;
const tWidth = 10;

/** halfCircle */
export function makeHalfCircle() {
  function makeMainPath(direction) {}
  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);
  return {
    // type: this.SHAPES.NOTCH,
    width: tWidth,
    height: tHeight,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}
/** horzSevenAngel */
export function makeHorzSevenAngel() {
  const width = nWidth;
  const height = nHeight;
  const notchHeight = 3;
  const notchWidth = width - 3;
  const notchCenter = (notchHeight * 2 + (height - 1)) / 2 + 1.5;

  /**
   * Since input and output connections share the same shape you can
   * define a function to generate the path for both.
   */
  function makeMainPath(up) {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(-(notchWidth - 1), up * (notchHeight + 1)),
      Blockly.utils.svgPaths.point(-notchWidth, 0),
      Blockly.utils.svgPaths.point(-notchWidth, -1 * up * notchCenter),
      Blockly.utils.svgPaths.point(notchWidth, -1 * up * notchCenter),
      Blockly.utils.svgPaths.point(notchWidth, 0),
      Blockly.utils.svgPaths.point(notchWidth - 1, up * (notchHeight + 1)),
    ]);
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);
  return {
    // type: this.SHAPES.NOTCH,
    width: width,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}

/** horzRevTringle */
export function makeHorzRevTringle() {
  const width = nWidth;
  const height = nHeight;
  const notchHeight = 3;
  const notchWidth = width + 3;
  const notchCenter = (notchHeight * 2 + (height - 1)) / 2 + 1;

  /**
   * Since input and output connections share the same shape you can
   * define a function to generate the path for both.
   */
  function makeMainPath(up) {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(-notchWidth, up * (notchHeight + 1)),
      Blockly.utils.svgPaths.point(0, -2 * up * notchCenter),
      Blockly.utils.svgPaths.point(notchWidth, up * (notchHeight + 1)),
    ]);
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);
  return {
    // type: this.SHAPES.NOTCH,
    width: width,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}
/** horzHexagon */
export function makeHorzHexagon() {
  const width = nWidth;
  const height = nHeight;
  const notchHeight = 3;
  const notchWidth = width - 3;

  /**
   * Since input and output connections share the same shape you can
   * define a function to generate the path for both.
   */
  function makeMainPath(up) {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(-notchWidth, up * notchHeight),
      Blockly.utils.svgPaths.point(-(notchWidth + 1), -1 * up * 5),
      Blockly.utils.svgPaths.point(0, -1 * up * 6),
      Blockly.utils.svgPaths.point(notchWidth + 1, -1 * up * 5),
      Blockly.utils.svgPaths.point(notchWidth, up * notchHeight),
    ]);
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);
  return {
    // type: this.SHAPES.NOTCH,
    width: width,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}

/** horzRevPentagon */
export function makeHorzRevPentagon() {
  const width = nWidth;
  const height = nHeight;
  const notchHeight = 3;
  const notchWidth = width - 3;
  const notchCenter = (notchHeight * 2 + (height - 1)) / 2 + 1;

  /**
   * Since input and output connections share the same shape you can
   * define a function to generate the path for both.
   */
  function makeMainPath(up) {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(-(notchWidth - 1), up * (notchHeight + 1)),
      Blockly.utils.svgPaths.point(-notchWidth, 0),
      Blockly.utils.svgPaths.point(0, -2 * up * notchCenter),
      Blockly.utils.svgPaths.point(notchWidth, 0),
      Blockly.utils.svgPaths.point(notchWidth - 1, up * (notchHeight + 1)),
    ]);
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);
  return {
    // type: this.SHAPES.NOTCH,
    width: width,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}
/** horzPentagon */
export function makeHorzPentagon() {
  const width = nWidth;
  const height = nHeight;
  const notchHeight = 3;
  const notchWidth = 7;
  const notchCenter = (notchHeight * 2 + (height - 1)) / 2 + 1;

  /**
   * Since input and output connections share the same shape you can
   * define a function to generate the path for both.
   */
  function makeMainPath(up) {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(-notchWidth, up * notchHeight),
      Blockly.utils.svgPaths.point(-(notchWidth + 1), -1 * up * notchCenter),
      Blockly.utils.svgPaths.point(notchWidth + 1, -1 * up * notchCenter),
      Blockly.utils.svgPaths.point(notchWidth, up * notchHeight),
    ]);
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);
  return {
    // type: this.SHAPES.NOTCH,
    width: width,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}

/** horzTrapeze */
export function makeHorzTrapeze() {
  const width = this.NOTCH_WIDTH;
  const height = this.NOTCH_HEIGHT;

  function makeMainPath(direction) {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(-(nWidth + 2), direction * -3),
      Blockly.utils.svgPaths.point(0, -4 * direction),
      Blockly.utils.svgPaths.point(nWidth + 2, direction * -3),
    ]);
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);

  return {
    width: nWidth,
    height: nHeight,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}

/** horzTriangle */
export function makeHorzTriangle() {
  const width = this.NOTCH_WIDTH;
  const height = this.NOTCH_HEIGHT;

  function makeMainPath(direction) {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(-(nWidth + 2), direction * -(nHeight / 2)),
      Blockly.utils.svgPaths.point(nWidth + 2, direction * -(nHeight / 2)),
    ]);
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);

  return {
    width: nWidth,
    height: nHeight,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}

/** horzHalfSquareBottom */
export function makeHorzHalfSquareBottom() {
  function makeMainPath(direction) {
    if (direction == 1) {
      return Blockly.utils.svgPaths.line([
        // Blockly.utils.svgPaths.point(-width, 0),
        Blockly.utils.svgPaths.point(-nWidth, 0),
        Blockly.utils.svgPaths.point(nWidth, -nHeight * direction),
      ]);
    } else {
      return Blockly.utils.svgPaths.line([
        // Blockly.utils.svgPaths.point(-width, 0),
        Blockly.utils.svgPaths.point(-nWidth, -nHeight * direction),
        Blockly.utils.svgPaths.point(nWidth, 0),
      ]);
    }
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);

  return {
    width: nWidth,
    height: nHeight,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}
/** horzHalfSquareTop */
export function makeHorzHalfSquareTop() {
  function makeMainPath(direction) {
    if (direction == 1) {
      return Blockly.utils.svgPaths.line([
        // Blockly.utils.svgPaths.point(-width, 0),
        Blockly.utils.svgPaths.point(-nWidth, -nHeight * direction),
        Blockly.utils.svgPaths.point(nWidth, 0),
      ]);
    } else {
      return Blockly.utils.svgPaths.line([
        // Blockly.utils.svgPaths.point(-width, 0),
        Blockly.utils.svgPaths.point(-nWidth, 0),
        Blockly.utils.svgPaths.point(nWidth, -nHeight * direction),
      ]);
    }
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);

  return {
    width: nWidth,
    height: nHeight,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}

/** horzSquare */
export function makeHorzSquare() {
  function makeMainPath(direction) {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(-nWidth, 0),
      Blockly.utils.svgPaths.point(0, -nHeight * direction),
      Blockly.utils.svgPaths.point(nWidth, 0),
    ]);
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);

  return {
    width: nWidth,
    height: nHeight,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}
/** horzRectangle */
export function makeHorzRectangle() {
  function makeMainPath(direction) {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(2 * -nWidth, 0),
      Blockly.utils.svgPaths.point(0, -nHeight * direction),
      Blockly.utils.svgPaths.point(2 * nWidth, 0),
    ]);
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);

  return {
    width: 2 * nWidth,
    height: nHeight,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}
/** horzParallelogramTop */
export function makeHorzParallelogramTop() {
  function makeMainPath(direction) {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(2 * -(nWidth - 3), -nHeight / 2),
      Blockly.utils.svgPaths.point(0, -nHeight * direction),
      Blockly.utils.svgPaths.point(2 * (nWidth - 3), nHeight / 2),
    ]);
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);

  return {
    width: nWidth,
    height: nHeight,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}
/** horzParallelogramBottom */
export function makeHorzParallelogramBottom() {
  function makeMainPath(direction) {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(2 * -(nWidth - 3), nHeight / 2),
      Blockly.utils.svgPaths.point(0, -nHeight * direction),
      Blockly.utils.svgPaths.point(2 * (nWidth - 3), -nHeight / 2),
    ]);
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);

  return {
    width: nWidth,
    height: nHeight,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}

/** horzHalfHammerRevTop */
export function makeHorzHalfHammerRevTop() {
  const width = nWidth;
  const height = nHeight;
  const notchWidth = 5;
  const notchHeight = 4;
  /**
   * Since input and output connections share the same shape you can
   * define a function to generate the path for both.
   */
  function makeMainPath(up) {
    if (up < 1) {
      return Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(-notchWidth, 0),
        Blockly.utils.svgPaths.point(0, up * notchHeight),
        Blockly.utils.svgPaths.point(-width, 0),
        Blockly.utils.svgPaths.point(0, -1 * up * (2 * notchHeight + height)),
        // Blockly.utils.svgPaths.point(width, 0),
        Blockly.utils.svgPaths.point(width, up * notchHeight),
        Blockly.utils.svgPaths.point(notchWidth, 0),
      ]);
    } else {
      return Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(-notchWidth, 0),
        Blockly.utils.svgPaths.point(-width, up * notchHeight),
        Blockly.utils.svgPaths.point(0, -1 * up * (2 * notchHeight + height)),
        Blockly.utils.svgPaths.point(width, 0),
        Blockly.utils.svgPaths.point(0, up * notchHeight),
        Blockly.utils.svgPaths.point(notchWidth, 0),
      ]);
    }
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);
  return {
    // type: this.SHAPES.NOTCH,
    width: width,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}
/** horzHalfHammerRevBottom */
export function makeHorzHalfHammerRevBottom() {
  const width = nWidth;
  const height = nHeight;
  const notchWidth = 5;
  const notchHeight = 4;
  /**
   * Since input and output connections share the same shape you can
   * define a function to generate the path for both.
   */
  function makeMainPath(up) {
    if (up < 1) {
      return Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(-notchWidth, 0),
        Blockly.utils.svgPaths.point(-width, up * notchHeight),
        // Blockly.utils.svgPaths.point(-width, 0),
        Blockly.utils.svgPaths.point(0, -1 * up * (2 * notchHeight + height)),
        Blockly.utils.svgPaths.point(width, 0),
        Blockly.utils.svgPaths.point(0, up * notchHeight),
        Blockly.utils.svgPaths.point(notchWidth, 0),
      ]);
    } else {
      return Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(-notchWidth, 0),
        Blockly.utils.svgPaths.point(0, up * notchHeight),
        Blockly.utils.svgPaths.point(-width, 0),
        Blockly.utils.svgPaths.point(0, -1 * up * (2 * notchHeight + height)),
        // Blockly.utils.svgPaths.point(width, 0),
        Blockly.utils.svgPaths.point(width, up * notchHeight),
        Blockly.utils.svgPaths.point(notchWidth, 0),
      ]);
    }
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);
  return {
    // type: this.SHAPES.NOTCH,
    width: width,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}
/** horzHalfHammerBottom */
export function makeHorzHalfHammerBottom() {
  const width = nWidth;
  const height = nHeight;
  const notchWidth = 5;
  const notchHeight = 4;
  /**
   * Since input and output connections share the same shape you can
   * define a function to generate the path for both.
   */
  function makeMainPath(up) {
    if (up < 1) {
      return Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(-notchWidth, 0),
        Blockly.utils.svgPaths.point(0, up * notchHeight),
        Blockly.utils.svgPaths.point(-width, 0),
        Blockly.utils.svgPaths.point(
          width,
          -1 * up * (2 * notchHeight + height)
        ),
        // Blockly.utils.svgPaths.point(width, 0),
        Blockly.utils.svgPaths.point(0, up * notchHeight),
        Blockly.utils.svgPaths.point(notchWidth, 0),
      ]);
    } else {
      return Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(-notchWidth, 0),
        Blockly.utils.svgPaths.point(0, up * notchHeight),
        Blockly.utils.svgPaths.point(
          -width,
          -1 * up * (2 * notchHeight + height)
        ),
        Blockly.utils.svgPaths.point(width, 0),
        Blockly.utils.svgPaths.point(0, up * notchHeight),
        Blockly.utils.svgPaths.point(notchWidth, 0),
      ]);
    }
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);
  return {
    // type: this.SHAPES.NOTCH,
    width: width,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}
/** horzHalfHammerTop */
export function makeHorzHalfHammerTop() {
  const width = nWidth;
  const height = nHeight;
  const notchWidth = 5;
  const notchHeight = 4;
  /**
   * Since input and output connections share the same shape you can
   * define a function to generate the path for both.
   */
  function makeMainPath(up) {
    if (up < 1) {
      return Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(-notchWidth, 0),
        Blockly.utils.svgPaths.point(0, up * notchHeight),
        Blockly.utils.svgPaths.point(
          -width,
          -1 * up * (2 * notchHeight + height)
        ),
        Blockly.utils.svgPaths.point(width, 0),
        Blockly.utils.svgPaths.point(0, up * notchHeight),
        Blockly.utils.svgPaths.point(notchWidth, 0),
      ]);
    } else {
      return Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(-notchWidth, 0),
        Blockly.utils.svgPaths.point(0, up * notchHeight),
        Blockly.utils.svgPaths.point(-width, 0),
        Blockly.utils.svgPaths.point(
          width,
          -1 * up * (2 * notchHeight + height)
        ),
        Blockly.utils.svgPaths.point(0, up * notchHeight),
        Blockly.utils.svgPaths.point(notchWidth, 0),
      ]);
    }
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);
  return {
    // type: this.SHAPES.NOTCH,
    width: width,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}
/** horzHammerWithTriangle */
export function makeHorzHammerWithTriangle() {
  const width = nWidth;
  const height = nHeight;
  const notchWidth = 5;
  const notchHeight = 4;
  /**
   * Since input and output connections share the same shape you can
   * define a function to generate the path for both.
   */
  function makeMainPath(up) {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(-notchWidth, 0),
      Blockly.utils.svgPaths.point(0, up * notchHeight),
      Blockly.utils.svgPaths.point(-width, 0),
      Blockly.utils.svgPaths.point(
        width,
        -1 * up * ((2 * notchHeight + height) / 2)
      ),
      Blockly.utils.svgPaths.point(
        -width,
        -1 * up * ((2 * notchHeight + height) / 2)
      ),
      // Blockly.utils.svgPaths.point(0, -1 * up * (2 * notchHeight + height)),
      Blockly.utils.svgPaths.point(width, 0),
      Blockly.utils.svgPaths.point(0, up * notchHeight),
      Blockly.utils.svgPaths.point(notchWidth, 0),
    ]);
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);
  return {
    // type: this.SHAPES.NOTCH,
    width: width,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}
/** horzHammer */
export function makeHorzHammer() {
  const width = nWidth;
  const height = nHeight;
  const notchWidth = 5;
  const notchHeight = 4;
  /**
   * Since input and output connections share the same shape you can
   * define a function to generate the path for both.
   */
  function makeMainPath(up) {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(-notchWidth, 0),
      Blockly.utils.svgPaths.point(0, up * notchHeight),
      Blockly.utils.svgPaths.point(-width, 0),
      Blockly.utils.svgPaths.point(0, -1 * up * (2 * notchHeight + height)),
      Blockly.utils.svgPaths.point(width, 0),
      Blockly.utils.svgPaths.point(0, up * notchHeight),
      Blockly.utils.svgPaths.point(notchWidth, 0),
    ]);
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);
  return {
    // type: this.SHAPES.NOTCH,
    width: width + notchWidth,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}
/** horzHammer1 */
export function makeHorzHammerMdl1() {
  const width = nWidth;
  const height = nHeight;
  const notchWidth = 5;
  const notchHeight = 4;
  /**
   * Since input and output connections share the same shape you can
   * define a function to generate the path for both.
   */
  function makeMainPath(up) {
    if (up < 1) {
      return Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(-notchWidth, 0),
        Blockly.utils.svgPaths.point(0, up * notchHeight),
        Blockly.utils.svgPaths.point(-width, 0),
        Blockly.utils.svgPaths.point(0, -1 * up * (notchHeight + height)),
        Blockly.utils.svgPaths.point(width, 0),
        // Blockly.utils.svgPaths.point(0, up * notchHeight),
        Blockly.utils.svgPaths.point(notchWidth, 0),
      ]);
    } else {
      return Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(-notchWidth, 0),
        // Blockly.utils.svgPaths.point(0, up * notchHeight),
        Blockly.utils.svgPaths.point(-width, 0),
        Blockly.utils.svgPaths.point(0, -1 * up * (notchHeight + height)),
        Blockly.utils.svgPaths.point(width, 0),
        Blockly.utils.svgPaths.point(0, up * notchHeight),
        Blockly.utils.svgPaths.point(notchWidth, 0),
      ]);
    }
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);
  return {
    // type: this.SHAPES.NOTCH,
    width: width + notchWidth,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}
/** horzHammer2 */
export function makeHorzHammerMdl2() {
  const width = nWidth;
  const height = nHeight;
  const notchWidth = 5;
  const notchHeight = 4;
  /**
   * Since input and output connections share the same shape you can
   * define a function to generate the path for both.
   */
  function makeMainPath(up) {
    if (up < 1) {
      return Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(-notchWidth, 0),
        // Blockly.utils.svgPaths.point(0, up * notchHeight),
        Blockly.utils.svgPaths.point(-width, 0),
        Blockly.utils.svgPaths.point(0, -1 * up * (notchHeight + height)),
        Blockly.utils.svgPaths.point(width, 0),
        Blockly.utils.svgPaths.point(0, up * notchHeight),
        Blockly.utils.svgPaths.point(notchWidth, 0),
      ]);
    } else {
      return Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(-notchWidth, 0),
        Blockly.utils.svgPaths.point(0, up * notchHeight),
        Blockly.utils.svgPaths.point(-width, 0),
        Blockly.utils.svgPaths.point(0, -1 * up * (notchHeight + height)),
        Blockly.utils.svgPaths.point(width, 0),
        // Blockly.utils.svgPaths.point(0, up * notchHeight),
        Blockly.utils.svgPaths.point(notchWidth, 0),
      ]);
    }
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);
  return {
    // type: this.SHAPES.NOTCH,
    width: width + notchWidth,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}
/** horzCross*/
export function makeHorzCross() {
  const notchWidth = 5;
  const notchHeight = 4;
  /**
   * Since input and output connections share the same shape you can
   * define a function to generate the path for both.
   */
  function makeMainPath(up) {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(-notchWidth, 0),
      Blockly.utils.svgPaths.point(0, up * notchHeight),
      Blockly.utils.svgPaths.point(-notchWidth, 0),
      Blockly.utils.svgPaths.point(0, up * -notchHeight),
      Blockly.utils.svgPaths.point(-notchWidth, 0),
      Blockly.utils.svgPaths.point(0, up * -(notchHeight + 2)),
      Blockly.utils.svgPaths.point(notchWidth, 0),
      Blockly.utils.svgPaths.point(0, up * -notchHeight),
      Blockly.utils.svgPaths.point(notchWidth, 0),
      Blockly.utils.svgPaths.point(0, up * notchHeight),
      Blockly.utils.svgPaths.point(notchWidth, 0),
    ]);
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);
  return {
    // type: this.SHAPES.NOTCH,
    width: 3 * notchWidth,
    height: notchHeight + 2,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}

/** horzArrowDiamond*/
export function makeHorzArrowDiamond() {
  const width = nWidth;
  const height = nHeight;
  const notchWidth = 4;
  const notchHeight = 5;
  /**
   * Since input and output connections share the same shape you can
   * define a function to generate the path for both.
   */
  function makeMainPath(up) {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(-notchWidth, 0),
      Blockly.utils.svgPaths.point(-(width - 3), up * notchHeight),
      Blockly.utils.svgPaths.point(
        -width,
        (-1 * up * (2 * notchHeight + height)) / 2
      ),
      Blockly.utils.svgPaths.point(
        width,
        (-1 * up * (2 * notchHeight + height)) / 2
      ),
      Blockly.utils.svgPaths.point(width - 3, up * notchHeight),
      Blockly.utils.svgPaths.point(notchWidth, 0),
    ]);
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);
  return {
    // type: this.SHAPES.NOTCH,
    width: 2 * width + notchWidth,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}

/** horzArrowRevDiamond */
export function makeHorzArrowRevDiamond() {
  const width = nWidth;
  const height = nHeight;
  const notchWidth = 4;
  const notchHeight = 5;
  /**
   * Since input and output connections share the same shape you can
   * define a function to generate the path for both.
   */
  function makeMainPath(up) {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(-notchWidth, 0),
      Blockly.utils.svgPaths.point(-(width - 3), up * notchHeight),
      Blockly.utils.svgPaths.point(notchWidth, -1 * up * height),
      Blockly.utils.svgPaths.point(-notchWidth, -1 * up * height),
      Blockly.utils.svgPaths.point(width - 3, up * notchHeight),
      Blockly.utils.svgPaths.point(notchWidth, 0),
    ]);
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);
  return {
    // type: this.SHAPES.NOTCH,
    width: width,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}

// Start Arrow-like notchs
/** horzRevArrow */
export function makeHorzRevArrow() {
  const width = nWidth;
  const height = nHeight;
  const notchWidth = 5;
  const notchHeight = 5;
  /**
   * Since input and output connections share the same shape you can
   * define a function to generate the path for both.
   */
  function makeMainPath(up) {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(-notchWidth, 0),
      Blockly.utils.svgPaths.point(-(width - 3), up * notchHeight),
      Blockly.utils.svgPaths.point(0, -1 * up * (2 * notchHeight + height)),
      Blockly.utils.svgPaths.point(width - 3, up * notchHeight),
      Blockly.utils.svgPaths.point(notchWidth, 0),
    ]);
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);
  return {
    // type: this.SHAPES.NOTCH,
    width: width,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}

/** horzArrow */
export function makeHorzArrow() {
  const width = nWidth;
  const height = nHeight;
  const notchWidth = 5;
  const notchHeight = 4;
  /**
   * Since input and output connections share the same shape you can
   * define a function to generate the path for both.
   */
  function makeMainPath(up) {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(-notchWidth, 0),
      Blockly.utils.svgPaths.point(0, up * notchHeight),
      Blockly.utils.svgPaths.point(-width, -1 * up * (notchHeight + 5)),
      Blockly.utils.svgPaths.point(width, -1 * up * (notchHeight + 5)),
      Blockly.utils.svgPaths.point(0, up * notchHeight),
      Blockly.utils.svgPaths.point(notchWidth, 0),
    ]);
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);
  return {
    // type: this.SHAPES.NOTCH,
    width: width + notchWidth,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}

/** horzBlockTopTriangle */
export function makeHorzBlockTopTriangle() {
  const width = nWidth;
  const height = nHeight;
  const notchWidth = 3;

  /**
   * Since input and output connections share the same shape you can
   * define a function to generate the path for both.
   */
  function left() {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(-notchWidth, 0),
      Blockly.utils.svgPaths.point(-5, -6),
      Blockly.utils.svgPaths.point(-5, 6),
      Blockly.utils.svgPaths.point(-notchWidth, 0),
      Blockly.utils.svgPaths.point(0, -height),
      Blockly.utils.svgPaths.point(2 * notchWidth + 10, 0),
    ]);
  }
  function right(_dir?: any) {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(-2 * notchWidth - 10, 0),
      Blockly.utils.svgPaths.point(0, height),
      Blockly.utils.svgPaths.point(notchWidth, 0),
      Blockly.utils.svgPaths.point(5, -6),
      Blockly.utils.svgPaths.point(5, 6),
      Blockly.utils.svgPaths.point(notchWidth, 0),
    ]);
  }

  const pathUp = left();
  const pathDown = right(-1);
  return {
    // type: this.SHAPES.NOTCH,
    width: width,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}
/** horzBlockBottomTriangle */
export function makeHorzBlockBottomTriangle() {
  const width = nWidth;
  const height = nHeight;
  const notchWidth = 3;

  /**
   * Since input and output connections share the same shape you can
   * define a function to generate the path for both.
   */
  function left() {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(-2 * notchWidth - 10, 0),
      Blockly.utils.svgPaths.point(0, -height),
      Blockly.utils.svgPaths.point(notchWidth, 0),
      Blockly.utils.svgPaths.point(5, 6),
      Blockly.utils.svgPaths.point(5, -6),
      Blockly.utils.svgPaths.point(notchWidth, 0),
    ]);
  }
  function right(_dir?: any) {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(-notchWidth, 0),
      Blockly.utils.svgPaths.point(-5, 6),
      Blockly.utils.svgPaths.point(-5, -6),
      Blockly.utils.svgPaths.point(-notchWidth, 0),
      Blockly.utils.svgPaths.point(0, height),
      Blockly.utils.svgPaths.point(2 * notchWidth + 10, 0),
    ]);
  }

  const pathUp = left();
  const pathDown = right(-1);
  return {
    // type: this.SHAPES.NOTCH,
    width: width,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}

/** horzBlockLeftTriangle */
export function makeHorzBlockLeftTriangle() {
  const width = nWidth;
  const height = nHeight;

  /**
   * Since input and output connections share the same shape you can
   * define a function to generate the path for both.
   */
  function makeMainPath(up) {
    return Blockly.utils.svgPaths.line([
      Blockly.utils.svgPaths.point(-width, 0),
      Blockly.utils.svgPaths.point(width / 2, -1 * up * (height / 2)),
      Blockly.utils.svgPaths.point(-(width / 2), -1 * up * (height / 2)),
      Blockly.utils.svgPaths.point(width, 0),
    ]);
  }

  const pathUp = makeMainPath(1);
  const pathDown = makeMainPath(-1);
  return {
    // type: this.SHAPES.NOTCH,
    width: width,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp,
  };
}
