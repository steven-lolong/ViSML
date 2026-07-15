function requestLayoutUpdate() {
  const requestLayout = (window as any).visualSmlRequestLayout;
  if (typeof requestLayout === "function") {
    requestLayout();
    return;
  }
  window.dispatchEvent(new CustomEvent("visual-sml:layout-request"));
}

export function show_hide_block(divName) {
  let dv = document.getElementById(divName);
  if (dv.style.display === "none") dv.style.display = "block";
  else dv.style.display = "none";
}

export function show_hide_source_block(tarsiusDiv, srcDiv) {
  let tarsiusDivBlock = document.getElementById(tarsiusDiv);
  let srcDivBlock = document.getElementById(srcDiv);
  let btnCode = document.getElementById("btnShowCode");

  if (srcDivBlock.style.display === "none") {
    tarsiusDivBlock.classList.replace("col-12", "col-8");
    srcDivBlock.style.display = "block";
    requestLayoutUpdate();
    btnCode.innerText = "hide";
  } else {
    srcDivBlock.style.display = "none";
    tarsiusDivBlock.classList.replace("col-8", "col-12");
    requestLayoutUpdate();
    btnCode.innerText = "show";
  }
}
