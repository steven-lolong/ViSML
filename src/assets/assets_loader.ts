// bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import { Tooltip, Toast, Popover, Modal } from "bootstrap";
import "./css/popper_fixer.css";
import "./css/ide.css";
import "./images/light_yellow_cyan.svg";
import "./images/cyan.svg";
import "./images/light_yellow.svg";
import "./images/visml.png"
import "./images/logo.png";
import "./images/logo_small.png";
import "./images/logo_with_tagline.png";
export { Tooltip, Toast, Popover, Modal };

function showModal(id: string) {
  const element = document.getElementById(id);
  if (element) new Modal(element).show();
}

export function usage() {
  showModal("usageModal");
}

export function about() {
  showModal("aboutModal");
}
