// bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import { Tooltip, Toast, Popover, Modal } from "bootstrap";
import "./css/popper_fixer.css";
import "./css/ide.css";
import { show_hide_block, show_hide_source_block } from "./js/show_hide_div";
import "./images/light_yellow_cyan.svg";
import "./images/cyan.svg";
import "./images/light_yellow.svg";
import "./images/visml.png"
import "./images/logo.png";
import "./images/logo_small.png";
import "./images/logo_with_tagline.png";
export { Tooltip, Toast, Popover, Modal, show_hide_block, show_hide_source_block };

export function usage() {
  const usageModal = new Modal(document.getElementById('usageModal'));
  usageModal.show();
}
