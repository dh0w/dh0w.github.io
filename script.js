/* script.js
   - Image-to-ASCII pipeline retained (unchanged behavior)
   - Text-to-ASCII uses figlet.js and fetches Ogre.txt and Slant.txt at runtime
   - Text mode: single line, max 12 chars; Ogre = standard, Slant = italic
   - PNG export preserves exact FIGlet spacing
*/

/* ----------------- DOM bindings ----------------- */
const fileInput = document.getElementById("fileInput");
const fileLabel = document.getElementById("fileLabel");
const textInput = document.getElementById("textInput");
const convertBtn = document.getElementById("convertBtn");
const asciiOutput = document.getElementById("asciiOutput");
const resolutionSlider = document.getElementById("resolutionSlider");
const resolutionValue = document.getElementById("resolutionValue");
const bgColorPicker = document.getElementById("bgColorPicker");
const bgColorHex = document.getElementById("bgColorHex");
const textColorPicker = document.getElementById("textColorPicker");
const textColorHex = document.getElementById("textColorHex");

const mainModeOptions = document.querySelectorAll(".main-mode-option");
const textStyleOptions = document.querySelectorAll(".text-style-option");
const textColorOptions = document.querySelectorAll(".text-color-option");
const modeOptions = document.querySelectorAll(".mode-option");

const imageUploadGroup = document.getElementById("imageUploadGroup");
const textInputGroup = document.getElementById("textInputGroup");
const resolutionGroup = document.getElementById("resolutionGroup");
const textStyleGroup = document.getElementById("textStyleGroup");
const imageColorControls = document.getElementById("imageColorControls");
const textColorControls = document.getElementById("textColorControls");
const textCustomColors = document.getElementById("textCustomColors");
const textBgColorPicker = document.getElementById("textBgColorPicker");
const textBgColorHex = document.getElementById("textBgColorHex");
const textTextColorPicker = document.getElementById("textTextColorPicker");
const textTextColorHex = document.getElementById("textTextColorHex");

const copyBtn = document.getElementById("copyBtn");
const downloadPngBtn = document.getElementById("downloadPngBtn");
const asciiCanvas = document.getElementById("asciiCanvas");

/* ----------------- state ----------------- */
let appMode = "image";           // "image" or "text"
let figletFontChoice = "ogre";   // "ogre" or "slant"
let lastFigletAscii = "";
let lastAsciiText = "";
let lastAsciiMetrics = null;
let currentTextColor = "#848484";
let currentBgColor = "#0d0d0d";
let colorMode = "static";
let colorMap = null;

const DEFAULT_FONT_FAMILY = "monospace";
const DEFAULT_FONT_SIZE_PX = 10;

/* ----------------- helper utilities ----------------- */
async function fetchTextFile(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return await res.text();
}

function registerParsedFont(name, parsed) {
  figlet._fonts = figlet._fonts || {};
  figlet._fonts[name] = parsed;
  if (typeof figlet.fonts === "function") {
    const list = figlet.fonts();
    if (!list.includes(name)) list.push(name);
  }
}

async function loadAndRegisterFont(name, url) {
  const flfText = await fetchTextFile(url);
  const parsed = figlet.parseFont(flfText);
  registerParsedFont(name, parsed);
}

function clampTextInputForOneLine(s) {
  const oneline = s.replace(/[\r\n]+/g, " ").trim();
  return oneline.slice(0, 12);
}

function centerPreviewAndShow(asciiStr, fg, bg) {
  const previewEl = document.querySelector(".preview");
  previewEl.style.background = bg;
  asciiOutput.textContent = asciiStr;
  asciiOutput.style.color = fg;
  asciiOutput.style.position = "absolute";
  asciiOutput.style.left = "50%";
  asciiOutput.style.top = "50%";
  asciiOutput.style.transform = "translate(-50%,-50%)";
  asciiOutput.style.whiteSpace = "pre";
}

/* ----------------- FIGlet rendering + export ----------------- */
function renderFigletText(text, fontName) {
  return new Promise((resolve, reject) => {
    figlet.text(text, { font: fontName }, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

async function convertTextMode() {
  const raw = textInput.value || "";
  const one = clampTextInputForOneLine(raw);
  if (!one) {
    alert("Please enter text (up to 12 characters).");
    return;
  }

  const fontChoice = figletFontChoice === "slant" ? "slant" : "ogre";

  let figletOutput;
  try {
    figletOutput = await renderFigletText(one, fontChoice);
  } catch (err) {
    alert("Figlet render error: " + err.message);
    return;
  }

  lastFigletAscii = figletOutput;
  lastAsciiText = figletOutput;
  colorMap = null;

  // colors for text-mode
  let bgColor = "#000000", textColor = "#ffffff";
  const active = document.querySelector(".text-color-option.active");
  if (active) {
    if (active.dataset.textcolor === "white") { bgColor = "#ffffff"; textColor = "#000000"; }
    else if (active.dataset.textcolor === "custom") { bgColor = textBgColorHex.value || "#000000"; textColor = textTextColorHex.value || "#ffffff"; }
  }

  centerPreviewAndShow(figletOutput, textColor, bgColor);

  // Canvas export: preserve FIGlet spacing exactly
  const lines = figletOutput.split("\n");
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
  const rows = lines.length;
  const cols = Math.max(...lines.map(l => l.length), 1);

  // measure a monospace cell for DEFAULT_FONT_SIZE_PX
  const measureCanvas = document.createElement("canvas");
  const mctx = measureCanvas.getContext("2d");
  mctx.font = `${DEFAULT_FONT_SIZE_PX}px ${DEFAULT_FONT_FAMILY}`;
  const metrics = mctx.measureText("W");
  const cellW = Math.ceil(metrics.width);
  const cellH = Math.ceil(DEFAULT_FONT_SIZE_PX * 1.0);

  const cssW = cols * cellW || 1;
  const cssH = rows * cellH || 1;
  const dpr = window.devicePixelRatio || 1;

  asciiCanvas.width = Math.round(cssW * dpr);
  asciiCanvas.height = Math.round(cssH * dpr);
  asciiCanvas.style.removeProperty("width");
  asciiCanvas.style.removeProperty("height");

  const ctx = asciiCanvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, cssW, cssH);

  ctx.font = `${cellH}px ${DEFAULT_FONT_FAMILY}`;
  ctx.textBaseline = "top";
  ctx.fillStyle = textColor;

  for (let r = 0; r < rows; r++) {
    ctx.fillText(lines[r], 0, r * cellH);
  }

  lastAsciiMetrics = { cssWidth: cssW, cssHeight: cssH, dpr };
  copyBtn.disabled = false;
  downloadPngBtn.disabled = false;
}

/* ----------------- Image-to-ASCII (kept intact, unchanged behavior) ----------------- */
function measureGlyphWidth(fontFamily, fontSizePx) {
  const cvs = document.createElement("canvas");
  const ctx = cvs.getContext("2d");
  ctx.font = `${fontSizePx}px ${fontFamily}`;
  return Math.ceil(ctx.measureText("@").width);
}

function hexToRgb(hex) {
  if (!hex) return null;
  const m = hex.replace('#','');
  if (m.length !== 6) return null;
  const r = parseInt(m.substring(0,2),16);
  const g = parseInt(m.substring(2,4),16);
  const b = parseInt(m.substring(4,6),16);
  return { r, g, b };
}

const CHARSET_DEFAULT = "@#%*+=-:. ";
let CHARSET = CHARSET_DEFAULT;

function imageToAsciiFromImageElement(img, cols) {
  const testW = measureGlyphWidth("monospace", 10);
  const aspect = testW / 10;
  const rows = Math.max(
    1,
    Math.round(cols * aspect * (img.naturalHeight / img.naturalWidth) * 0.95)
  );

  const tmp = document.createElement("canvas");
  tmp.width = cols;
  tmp.height = rows;
  const tctx = tmp.getContext("2d");

  tctx.fillStyle = "white";
  tctx.fillRect(0, 0, cols, rows);
  tctx.drawImage(img, 0, 0, cols, rows);

  const data = tctx.getImageData(0, 0, cols, rows).data;
  let ascii = "";
  const localColorMap = [];

  for (let y = 0; y < rows; y++) {
    const rowColors = [];
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      let rr = r, gg = g, bb = b;
      if (a === 0) {
        const bg = hexToRgb(currentBgColor) || {r:0,g:0,b:0};
        rr = bg.r; gg = bg.g; bb = bg.b;
      }
      rowColors.push(`rgb(${rr},${gg},${bb})`);

      const gray = 0.299 * rr + 0.587 * gg + 0.114 * bb;
      const idx = Math.floor((gray / 255) * (CHARSET.length - 1));
      ascii += CHARSET[CHARSET.length - 1 - idx];
    }
    localColorMap.push(rowColors);
    ascii += "\n";
  }

  return { ascii, cols, rows, colorMap: localColorMap };
}

/* ----------------- existing text outline (kept for fallback but not used for FIGlet mode) ----------------- */
const ASCII_FONT = {}; // left empty; FIGlet mode is primary for text now

/* ----------------- conversion handlers ----------------- */
async function convertSelectedFile() {
  const file = fileInput.files[0];
  if (!file) {
    alert("Please select an image first.");
    return;
  }

  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode().catch(() => {});

  const cols = parseInt(resolutionSlider.value, 10);
  const fontFamily = "monospace";

  const { ascii, rows, colorMap: returnedColorMap } = imageToAsciiFromImageElement(img, cols);
  const lines = ascii.split("\n");
  const maxLineLength = Math.max(...lines.map(l => l.length));
  const paddedAscii = lines.map(l => l.padEnd(maxLineLength, ' ')).join("\n").replace(/\n+$/, '');

  lastAsciiText = paddedAscii;
  colorMap = returnedColorMap;
  copyBtn.disabled = false;
  downloadPngBtn.disabled = false;

  const defaultFS = 10;
  const glyphW = measureGlyphWidth(fontFamily, defaultFS);
  const asciiW = cols * glyphW;
  const asciiH = rows * defaultFS;

  const previewEl = document.querySelector('.preview');
  const availableWidth = previewEl.clientWidth;
  const availableHeight = previewEl.clientHeight;

  const scale = Math.min(availableWidth / asciiW, availableHeight / asciiH, 1);

  asciiOutput.style.cssText = `
    position: absolute;
    left: 50%;
    top: 50%;
    transform-origin: center center;
    transform: translate(-50%,-50%) scale(${scale});
    font-family: ${fontFamily}, monospace;
    font-size: ${defaultFS}px;
    line-height: ${defaultFS}px;
    white-space: pre;
    display: block;
    margin: 0;
    padding: 0;
  `;

  if (colorMode === "dynamic" && colorMap) {
    // render colored HTML
    const lines = paddedAscii.split("\n");
    let html = '';
    for (let y = 0; y < lines.length; y++) {
      const line = lines[y];
      for (let x = 0; x < line.length; x++) {
        const ch = line[x] === ' ' ? '&nbsp;' : escapeHtml(line[x]);
        const color = (colorMap[y] && colorMap[y][x]) ? colorMap[y][x] : currentTextColor;
        html += `<span style="color:${color};">` + ch + `</span>`;
      }
      if (y < lines.length - 1) html += '<br>';
    }
    asciiOutput.style.color = '';
    asciiOutput.innerHTML = html;
  } else {
    asciiOutput.style.color = currentTextColor;
    asciiOutput.textContent = paddedAscii;
  }

  previewEl.style.background = currentBgColor;

  const canvasLines = paddedAscii.split("\n");
  while (canvasLines.length > 0 && canvasLines[canvasLines.length - 1].trim() === '') canvasLines.pop();

  if (!canvasLines.length) {
    asciiCanvas.width = asciiCanvas.height = 1;
    lastAsciiMetrics = { cssWidth:1, cssHeight:1, dpr:window.devicePixelRatio||1 };
    return;
  }

  const tmpCanvas = document.createElement("canvas");
  const tmpCtx = tmpCanvas.getContext("2d");
  tmpCtx.font = `${defaultFS}px ${fontFamily}`;

  const cssW = cols * glyphW;
  const cssH = canvasLines.length * defaultFS;
  const dpr = window.devicePixelRatio || 1;

  asciiCanvas.width  = Math.round(cssW * dpr);
  asciiCanvas.height = Math.round(cssH * dpr);
  asciiCanvas.style.removeProperty('width');
  asciiCanvas.style.removeProperty('height');

  const ctx = asciiCanvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = currentBgColor;
  ctx.fillRect(0, 0, cssW, cssH);
  ctx.font = `${defaultFS}px ${fontFamily}`;
  ctx.textBaseline = "top";

  if (colorMode === "dynamic" && colorMap) {
    for (let y = 0; y < canvasLines.length; y++) {
      const line = canvasLines[y];
      for (let x = 0; x < line.length; x++) {
        const ch = line[x];
        const col = (colorMap[y] && colorMap[y][x]) ? colorMap[y][x] : currentTextColor;
        ctx.fillStyle = col;
        ctx.fillText(ch, x * glyphW, y * defaultFS);
      }
    }
  } else {
    ctx.fillStyle = currentTextColor;
    canvasLines.forEach((line, y) => {
      ctx.fillText(line, 0, y * defaultFS);
    });
  }

  lastAsciiMetrics = { cssWidth: cssW, cssHeight: cssH, dpr };
}

/* ----------------- UI wiring ----------------- */
function escapeHtml(ch) {
  return ch.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

mainModeOptions.forEach(btn => {
  btn.addEventListener("click", () => {
    mainModeOptions.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    appMode = btn.dataset.mainmode;
    if (appMode === "text") {
      imageUploadGroup.classList.add("hidden");
      resolutionGroup.classList.add("hidden");
      imageColorControls.classList.add("hidden");
      textInputGroup.classList.remove("hidden");
      textStyleGroup.style.display = "block";
      textColorControls.classList.remove("hidden");
    } else {
      imageUploadGroup.classList.remove("hidden");
      resolutionGroup.classList.remove("hidden");
      imageColorControls.classList.remove("hidden");
      textInputGroup.classList.add("hidden");
      textStyleGroup.style.display = "none";
      textColorControls.classList.add("hidden");
    }
    asciiOutput.textContent = "";
    copyBtn.disabled = true;
    downloadPngBtn.disabled = true;
  });
});

textStyleOptions.forEach(btn => {
  btn.addEventListener("click", () => {
    textStyleOptions.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    figletFontChoice = btn.dataset.style; // "ogre" or "slant"
  });
});

textColorOptions.forEach(btn => {
  btn.addEventListener("click", () => {
    textColorOptions.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    if (btn.dataset.textcolor === "custom") textCustomColors.style.display = "grid";
    else textCustomColors.style.display = "none";
  });
});

bgColorPicker.addEventListener("input", (e) => bgColorHex.value = e.target.value);
bgColorHex.addEventListener("input", (e) => {
  const v = e.target.value.startsWith("#") ? e.target.value : "#" + e.target.value;
  if (/^#[0-9A-Fa-f]{6}$/.test(v)) bgColorPicker.value = v;
});

textColorPicker.addEventListener("input", (e) => textColorHex.value = e.target.value);
textColorHex.addEventListener("input", (e) => {
  const v = e.target.value.startsWith("#") ? e.target.value : "#" + e.target.value;
  if (/^#[0-9A-Fa-f]{6}$/.test(v)) textColorPicker.value = v;
});

textBgColorPicker.addEventListener("input", (e) => textBgColorHex.value = e.target.value);
textBgColorHex.addEventListener("input", (e) => {
  const v = e.target.value.startsWith("#") ? e.target.value : "#" + e.target.value;
  if (/^#[0-9A-Fa-f]{6}$/.test(v)) textBgColorPicker.value = v;
});

textTextColorPicker.addEventListener("input", (e) => textTextColorHex.value = e.target.value);
textTextColorHex.addEventListener("input", (e) => {
  const v = e.target.value.startsWith("#") ? e.target.value : "#" + e.target.value;
  if (/^#[0-9A-Fa-f]{6}$/.test(v)) textTextColorPicker.value = v;
});

fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    fileLabel.textContent = e.target.files[0].name;
    fileLabel.classList.add("has-file");
  } else {
    fileLabel.textContent = "Choose an image file";
    fileLabel.classList.remove("has-file");
  }
});

copyBtn.addEventListener("click", async () => {
  if (!lastAsciiText && !lastFigletAscii) return;
  try {
    const payload = appMode === "text" ? lastFigletAscii : lastAsciiText;
    await navigator.clipboard.writeText(payload);
  } catch (err) {
    alert("Copy failed: " + err.message);
  }
});

downloadPngBtn.addEventListener("click", () => {
  if (!lastAsciiMetrics) return;
  const url = asciiCanvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = "ascii.png";
  a.click();
});

resolutionSlider.addEventListener("input", (e) => {
  const value = parseInt(e.target.value, 10);
  const percentage = Math.round(((value - 50) / (430 - 50)) * 100);
  resolutionValue.textContent = percentage + "%";
});

convertBtn.addEventListener("click", async () => {
  if (appMode === "text") {
    try {
      await convertTextMode();
    } catch (err) {
      alert("Conversion error: " + err.message);
    }
  } else {
    try {
      await convertSelectedFile();
    } catch (err) {
      alert("Image conversion error: " + err.message);
    }
  }
});

/* ----------------- initialization ----------------- */
async function init() {
  if (typeof figlet === "undefined") {
    console.error("figlet.js not detected. Ensure figlet.js script tag is included before script.js");
    return;
  }
  try {
    await loadAndRegisterFont("ogre", "./Ogre.txt");
    await loadAndRegisterFont("slant", "./Slant.txt");
    figletFontChoice = "ogre";
  } catch (err) {
    console.error("Failed to load FIGlet fonts:", err);
    alert("Failed to load FIGlet fonts. Ensure Ogre.txt and Slant.txt are present next to index.html");
  }
  asciiOutput.textContent = "";
  copyBtn.disabled = true;
  downloadPngBtn.disabled = true;
}

window.addEventListener("load", init);
