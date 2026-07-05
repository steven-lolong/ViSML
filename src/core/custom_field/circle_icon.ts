import * as Blockly from "blockly";

export class CircleIcon {
  // Dynamically-assigned members (loosely typed for the pragmatic migration).
  block_: any;
  iconGroup_: any;

  constructor(block: any) {
    this.block_ = block;
    this.iconGroup_ = null;
    this.createIcon();
  }
  createIcon() {
    if (this.iconGroup_) {
      // Icon already exists.
      return;
    }
    /* Here's the markup that will be generated:
    <g class="blocklyIconGroup">
      ...
    </g>
    */
    this.iconGroup_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G,
      {},
      null
    );
    // if (this.block_.isInFlyout) {
    //   Blockly.utils.dom.addClass(
    //     /** @type {!Element} */ (this.iconGroup_),
    //     "blocklyIconGroupReadonly"
    //   );
    // }
    this.drawIcon_(this.iconGroup_);

    this.block_.getSvgRoot().appendChild(this.iconGroup_);
  }

  drawIcon_(group: any) {
    Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.CIRCLE,
      {
        style:
          "fill:#ff6600;fill-rule:evenodd;stroke:#111;stroke-width:1.5;stroke-dasharray:none;stroke-opacity:1",
        cx: "7.5",
        cy: "12.5",
        r: "4",
      },
      group
    );
  }

  static fromJson(options: any) {
    return options;
  }
}

Blockly.fieldRegistry.register("circle_icon", CircleIcon as any);
