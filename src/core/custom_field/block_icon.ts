import * as Blockly from "blockly";

export class BlockIcon {
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
      Blockly.utils.Svg.RECT,
      {
        style:
          "fill:#333;fill-rule:evenodd;stroke:#333;stroke-width:1.5;stroke-dasharray:none;stroke-opacity:1",
        x: "1.75",
        y: "6.75",
        height: "11.5",
        width: "11.5",
      },
      group
    );
  }

  static fromJson(options: any) {
    return options;
  }
}

Blockly.fieldRegistry.register("block_icon", BlockIcon as any);
