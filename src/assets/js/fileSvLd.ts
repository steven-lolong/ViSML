// @ts-nocheck
// NOTE: This file embeds the third-party FileSaver.js polyfill (the `saveAs`
// IIFE). It is vendored as-is and excluded from type checking; the project
// helpers `menuSaveFile` / `menuLoadFile` live at the bottom of the file.
import * as Blockly from "blockly";

const AUTOSAVE_KEY = "visual-sml.autosave.v1";
const AUTOSAVE_INTERVAL_KEY = "visual-sml.autosave.interval";
const DEFAULT_AUTOSAVE_INTERVAL_MINUTES = 2;
const MIN_AUTOSAVE_INTERVAL_MINUTES = 1;
const MAX_AUTOSAVE_INTERVAL_MINUTES = 20;

let autosaveTimer;
let autosaveDirty = false;

function updateStatus(message) {
  const windowAny = window as any;
  if (typeof windowAny.visualSmlUpdateStatus === "function") {
    windowAny.visualSmlUpdateStatus(message);
    return;
  }

  const statusLine = document.getElementById("statusLine");
  if (message && statusLine) statusLine.textContent = message;
}

function requestLayout(message) {
  const windowAny = window as any;
  if (typeof windowAny.visualSmlRequestLayout === "function") {
    windowAny.visualSmlRequestLayout(message);
  } else {
    updateStatus(message);
  }
}

function updateWorkspaceFileLabel(label) {
  const fileLabel = document.getElementById("workspaceFileLabel");
  if (!fileLabel || !label) return;
  fileLabel.textContent = label;
  fileLabel.title = label;
}

function currentWorkspaceFileName() {
  const label = document.getElementById("workspaceFileLabel")?.textContent?.trim();
  if (!label || label.startsWith("Autosave") || label === "untitled.vsml") return "visual-sml-workspace";
  return label.replace(/\.vsml$/i, "");
}

function normalizeVsmlFileName(value) {
  const clean = String(value || "").trim();
  const fallback = clean || "visual-sml-workspace";
  return /\.vsml$/i.test(fallback) ? fallback : `${fallback}.vsml`;
}

function extractWorkspaceState(parsed) {
  return parsed && parsed.state ? parsed.state : parsed;
}

function buildWorkspacePayload(fileName) {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    fileName,
    state: Blockly.serialization.workspaces.save(Blockly.getMainWorkspace()),
  };
}

function refreshAfterWorkspaceLoad(message) {
  const windowAny = window as any;
  if (windowAny.tarsius && typeof windowAny.tarsius.refreshGeneratedCode === "function") {
    windowAny.tarsius.refreshGeneratedCode();
  }
  requestLayout(message);
}

function clampAutosaveInterval(value) {
  const minutes = Number(value);
  if (Number.isNaN(minutes)) return DEFAULT_AUTOSAVE_INTERVAL_MINUTES;
  return Math.min(MAX_AUTOSAVE_INTERVAL_MINUTES, Math.max(MIN_AUTOSAVE_INTERVAL_MINUTES, Math.round(minutes)));
}

export function getAutosaveIntervalMinutes() {
  return clampAutosaveInterval(window.localStorage.getItem(AUTOSAVE_INTERVAL_KEY));
}

export function startAutosaveTimer(minutes = getAutosaveIntervalMinutes()) {
  const intervalMinutes = clampAutosaveInterval(minutes);
  if (autosaveTimer) window.clearInterval(autosaveTimer);
  autosaveTimer = window.setInterval(function () {
    if (autosaveDirty) saveAutosave();
  }, intervalMinutes * 60 * 1000);
  return intervalMinutes;
}

export function setAutosaveIntervalMinutes(value) {
  const minutes = clampAutosaveInterval(value);
  window.localStorage.setItem(AUTOSAVE_INTERVAL_KEY, String(minutes));
  startAutosaveTimer(minutes);
  updateStatus(`Autosave interval set to ${minutes} minute${minutes === 1 ? "" : "s"}.`);
  return minutes;
}

export function saveAutosave() {
  try {
    const payload = buildWorkspacePayload(currentWorkspaceFileName());
    window.localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
    autosaveDirty = false;
    const savedAt = new Date(payload.savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    updateStatus(`Autosaved ${savedAt}.`);
  } catch (e) {
    console.error(e);
    updateStatus("Autosave failed.");
  }
}

export function scheduleAutosave() {
  autosaveDirty = true;
}

export function menuLoadAutosave() {
  const raw = window.localStorage.getItem(AUTOSAVE_KEY);
  if (!raw) {
    updateStatus("No autosave found.");
    return;
  }

  try {
    const payload = JSON.parse(raw);
    const state = extractWorkspaceState(payload);
    const ws = Blockly.getMainWorkspace();
    ws.clear();
    Blockly.serialization.workspaces.load(state, ws);
    const savedAt = payload.savedAt ? new Date(payload.savedAt).toLocaleString() : "";
    updateWorkspaceFileLabel(savedAt ? `Autosave - ${savedAt}` : "Autosave loaded");
    refreshAfterWorkspaceLoad("Autosave loaded.");
  } catch (e) {
    console.error(e);
    updateStatus("Autosave could not be loaded.");
  }
}

var saveAs =
  saveAs ||
  (function (h) {
    var r = h.document,
      l = function () {
        return h.URL || h.webkitURL || h;
      },
      e = h.URL || h.webkitURL || h,
      n = r.createElementNS("http://www.w3.org/1999/xhtml", "a"),
      g = "download" in n,
      j = function (t) {
        var s = r.createEvent("MouseEvents");
        s.initMouseEvent(
          "click",
          true,
          false,
          h,
          0,
          0,
          0,
          0,
          0,
          false,
          false,
          false,
          false,
          0,
          null
        );
        return t.dispatchEvent(s);
      },
      o = h.webkitRequestFileSystem,
      p = h.requestFileSystem || o || h.mozRequestFileSystem,
      m = function (s) {
        (h.setImmediate || h.setTimeout)(function () {
          throw s;
        }, 0);
      },
      c = "application/octet-stream",
      k = 0,
      b = [],
      i = function () {
        var t = b.length;
        while (t--) {
          var s = b[t];
          if (typeof s === "string") {
            e.revokeObjectURL(s);
          } else {
            s.remove();
          }
        }
        b.length = 0;
      },
      q = function (t, s, w) {
        s = [].concat(s);
        var v = s.length;
        while (v--) {
          var x = t["on" + s[v]];
          if (typeof x === "function") {
            try {
              x.call(t, w || t);
            } catch (u) {
              m(u);
            }
          }
        }
      },
      f = function (t, u) {
        var v = this,
          B = t.type,
          E = false,
          x,
          w,
          s = function () {
            var F = l().createObjectURL(t);
            b.push(F);
            return F;
          },
          A = function () {
            q(v, "writestart progress write writeend".split(" "));
          },
          D = function () {
            if (E || !x) {
              x = s(t);
            }
            w.location.href = x;
            v.readyState = v.DONE;
            A();
          },
          z = function (F) {
            return function () {
              if (v.readyState !== v.DONE) {
                return F.apply(this, arguments);
              }
            };
          },
          y = {
            create: true,
            exclusive: false,
          },
          C;
        v.readyState = v.INIT;
        if (!u) {
          u = "download";
        }
        if (g) {
          x = s(t);
          n.href = x;
          n.download = u;
          if (j(n)) {
            v.readyState = v.DONE;
            A();
            return;
          }
        }
        if (h.chrome && B && B !== c) {
          C = t.slice || t.webkitSlice;
          t = C.call(t, 0, t.size, c);
          E = true;
        }
        if (o && u !== "download") {
          u += ".download";
        }
        if (B === c || o) {
          w = h;
        } else {
          w = h.open();
        }
        if (!p) {
          D();
          return;
        }
        k += t.size;
        p(
          h.TEMPORARY,
          k,
          z(function (F) {
            F.root.getDirectory(
              "saved",
              y,
              z(function (G) {
                var H = function () {
                  G.getFile(
                    u,
                    y,
                    z(function (I) {
                      I.createWriter(
                        z(function (J) {
                          J.onwriteend = function (K) {
                            w.location.href = I.toURL();
                            b.push(I);
                            v.readyState = v.DONE;
                            q(v, "writeend", K);
                          };
                          J.onerror = function () {
                            var K = J.error;
                            if (K.code !== K.ABORT_ERR) {
                              D();
                            }
                          };
                          "writestart progress write abort"
                            .split(" ")
                            .forEach(function (K) {
                              J["on" + K] = v["on" + K];
                            });
                          J.write(t);
                          v.abort = function () {
                            J.abort();
                            v.readyState = v.DONE;
                          };
                          v.readyState = v.WRITING;
                        }),
                        D
                      );
                    }),
                    D
                  );
                };
                G.getFile(
                  u,
                  {
                    create: false,
                  },
                  z(function (I) {
                    I.remove();
                    H();
                  }),
                  z(function (I) {
                    if (I.code === I.NOT_FOUND_ERR) {
                      H();
                    } else {
                      D();
                    }
                  })
                );
              }),
              D
            );
          }),
          D
        );
      },
      d = f.prototype,
      a = function (s, t) {
        return new f(s, t);
      };
    d.abort = function () {
      var s = this;
      s.readyState = s.DONE;
      q(s, "abort");
    };
    d.readyState = d.INIT = 0;
    d.WRITING = 1;
    d.DONE = 2;
    d.error =
      d.onwritestart =
      d.onprogress =
      d.onwrite =
      d.onabort =
      d.onerror =
      d.onwriteend =
      null;
    h.addEventListener("pagehide", i, false);
    return a;
  })(self);

// File save, get id of save link
export function menuSaveFile() {
  let fileName = window.prompt(
    "What would you like to name your file?",
    currentWorkspaceFileName()
  );
  if (fileName) {
    fileName = normalizeVsmlFileName(fileName);
    const data = JSON.stringify(buildWorkspacePayload(fileName), null, 2);
    let blob = new Blob([data], {
      type: "application/json",
    });
    saveAs(blob, fileName);
    updateWorkspaceFileLabel(fileName);
    saveAutosave();
    updateStatus(`Saved ${fileName}.`);
  }
}

export function menuLoadFile() {
  let loadFile = document.getElementById("fileElem");
  loadFile.onchange = function (e) {
    let files = e.target.files;
    if (files.length != 1) {
      return;
    }
    //  file reader
    let reader = new FileReader();
    reader.onloadend = function (event) {
      let target = event.target;
      // 2 == FileReader.DONE
      if (target.readyState == 2) {
        let state;
        try {
          state = extractWorkspaceState(JSON.parse(target.result));
        } catch (e) {
          alert("Error parsing file (expected Blockly JSON):\n" + e);
          return;
        }
        const ws = Blockly.getMainWorkspace();
        const count = ws.getAllBlocks().length;
        if (count && confirm("Ok to override, or\nCancel will merge?")) {
          ws.clear();
          Blockly.serialization.workspaces.load(state, ws);
        } else if (!count) {
          Blockly.serialization.workspaces.load(state, ws);
        } else {
          // Merge: append loaded blocks without clearing the workspace.
          const blocks = (state && state.blocks && state.blocks.blocks) || [];
          for (const b of blocks) Blockly.serialization.blocks.append(b, ws);
        }
        updateWorkspaceFileLabel(files[0].name);
        saveAutosave();
        refreshAfterWorkspaceLoad(`Loaded ${files[0].name}.`);
      }
      // Reset value of input after loading because Chrome will not fire
      // a 'change' event if the same file is loaded again.
      loadFile.value = "";
    };
    reader.readAsText(files[0]);
  };
  loadFile.click();
}
