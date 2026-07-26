function svgToPng_(data: any, width: any, height: any, callback: any) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const img = new Image();

  const pixelDensity = 10;
  canvas.width = width * pixelDensity;
  canvas.height = height * pixelDensity;
  img.onload = function () {
    context.drawImage(
      img,
      0,
      0,
      width,
      height,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    try {
      const dataUri = canvas.toDataURL('image/png');
      callback(dataUri);
    } catch (err) {
      console.warn('Error converting the workspace svg to a png');
      callback('');
    }
  };
  img.src = data;
}

/**
 * The real rendered extent of the workspace's top-level blocks, in workspace
 * coordinates. `workspace.getBlocksBoundingBox()` is layout metrics, not
 * rendered geometry: it excludes anything a custom renderer draws outside
 * those metrics, chiefly a start hat (the "ViSML" lettering standing above
 * the main Program block reaches ~18 units above the block's own top edge,
 * while its layout height is a nominal 5) — using it here cropped that
 * decoration out of the exported screenshot. Each top block's own SVG
 * `getBBox()` includes everything actually painted, so union those instead
 * and fall back to the layout metrics only if nothing is renderable.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace.
 * @returns {{x: number, y: number, width: number, height: number}} The box.
 */
function renderedBlocksBoundingBox_(workspace: any) {
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  for (const block of workspace.getTopBlocks(false)) {
    const root = block.getSvgRoot && block.getSvgRoot();
    if (!root) continue;
    let local;
    try {
      local = root.getBBox();
    } catch (e) {
      continue;
    }
    const xy = block.getRelativeToSurfaceXY();
    left = Math.min(left, xy.x + local.x);
    top = Math.min(top, xy.y + local.y);
    right = Math.max(right, xy.x + local.x + local.width);
    bottom = Math.max(bottom, xy.y + local.y + local.height);
  }

  if (!isFinite(left)) {
    const bBox = workspace.getBlocksBoundingBox();
    const x = bBox.x ?? bBox.left;
    const y = bBox.y ?? bBox.top;
    return {
      x,
      y,
      width: bBox.width ?? bBox.right - x,
      height: bBox.height ?? bBox.bottom - y,
    };
  }
  // A few units of breathing room so the outermost ink (e.g. the hat's
  // pointed tips) doesn't sit flush against the image edge.
  const margin = 4;
  return {
    x: left - margin,
    y: top - margin,
    width: right - left + margin * 2,
    height: bottom - top + margin * 2,
  };
}

/**
 * Create an SVG of the blocks on the workspace.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace.
 * @param {!Function} callback Callback.
 * @param {string=} customCss Custom CSS to append to the SVG.
 */
function workspaceToSvg_(workspace: any, callback: any, customCss?: any) {
  // Go through all text areas and set their value.
  const textAreas = document.getElementsByTagName('textarea');
  for (let i = 0; i < textAreas.length; i++) {
    textAreas[i].innerHTML = textAreas[i].value;

  }

  const bBox = renderedBlocksBoundingBox_(workspace);
  const x = bBox.x;
  const y = bBox.y;
  const width = bBox.width;
  const height = bBox.height;

  const blockCanvas = workspace.getCanvas();
  const clone = blockCanvas.cloneNode(true);
  clone.removeAttribute('transform');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.appendChild(clone);
  svg.setAttribute('viewBox', x + ' ' + y + ' ' + width + ' ' + height);

  svg.setAttribute(
    'class',
    'blocklySvg ' +
    (workspace.options.renderer || 'geras') +
    '-renderer ' +
    (workspace.getTheme ? workspace.getTheme().name + '-theme' : ''),
  );
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.style.backgroundColor = 'transparent';

  const css = [].slice
    .call(document.head.querySelectorAll('style'))
    .filter(
      (el) => /\.blocklySvg/.test(el.innerText) || el.id.startsWith('blockly-'),
    )
    .map((el) => el.innerText)
    .join('\n');
  const style = document.createElement('style');
  style.innerHTML = css + '\n' + customCss;
  svg.insertBefore(style, svg.firstChild);

  let svgAsXML = new XMLSerializer().serializeToString(svg);
  svgAsXML = svgAsXML.replace(/&nbsp/g, '&#160');
  const data = 'data:image/svg+xml,' + encodeURIComponent(svgAsXML);

  svgToPng_(data, width, height, callback);
}

/**
 * Download a screenshot of the blocks on a Blockly workspace.
 * @param {!Blockly.WorkspaceSvg} workspace The Blockly workspace.
 */
export default function downloadScreenshot(workspace: any) {
  workspaceToSvg_(workspace, function (datauri) {
    const a = document.createElement('a');
    a.download = 'mnl_screenshot.png';
    a.target = '_self';
    a.href = datauri;
    document.body.appendChild(a);
    a.click();
    a.parentNode.removeChild(a);
  });
}