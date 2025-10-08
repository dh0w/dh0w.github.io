const CHARSET        = "@#%*+=-:. ";
const fileInput      = document.getElementById("fileInput");
const fileLabel      = document.getElementById("fileLabel");
const convertBtn     = document.getElementById("convertBtn");
const convertTextBtn = document.getElementById("convertTextBtn");
const asciiOutput    = document.getElementById("asciiOutput");
const resolutionSlider = document.getElementById("resolutionSlider");
const resolutionValue = document.getElementById("resolutionValue");
const textColorPicker = document.getElementById("textColorPicker");
const textColorHex = document.getElementById("textColorHex");
const textColorPickerText = document.getElementById("textColorPickerText");
const textColorHexText = document.getElementById("textColorHexText");
const textInput = document.getElementById("textInput");
const resolutionSliderText = document.getElementById("resolutionSliderText");
const resolutionValueText = document.getElementById("resolutionValueText");
const textModeBgBtns = document.querySelectorAll(".bg-option-text");
const modeOptions = document.querySelectorAll(".mode-option");
const bgOptions = document.querySelectorAll(".bg-option");
const downloadPngBtn = document.getElementById("downloadPngBtn");
const downloadTextPngBtn = document.getElementById("downloadTextPngBtn");
const asciiCanvas    = document.getElementById("asciiCanvas");
const copyButton     = document.getElementById("copyButton");

const modeSwitchBtns = document.querySelectorAll(".mode-switch-option");
const imageInputsPanel = document.getElementById("imageInputs");
const textInputsPanel = document.getElementById("textInputs");
const textStyleBtns = document.querySelectorAll(".text-style-option");

let lastAsciiText    = "";
let lastAsciiMetrics = null;
let currentTextColor = "#ffffff";
let currentBgColor = "#000000";
let colorMode = "static";
let colorMap = null; // 2D color array
let currentUiMode = "image"; // or "text"

// --- UI wiring ---

// Copy button: copy current ASCII to clipboard preserving spacing
copyButton.addEventListener("click", async () => {
  if (!lastAsciiText) return;
  try {
    await navigator.clipboard.writeText(lastAsciiText);
    copyButton.classList.add("copied");
    setTimeout(() => copyButton.classList.remove("copied"), 900);
  } catch (e) {
    alert("Clipboard copy failed.");
  }
});

// Mode switch (image / text)
modeSwitchBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    modeSwitchBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentUiMode = btn.dataset.uiMode;
    if (currentUiMode === "image") {
      imageInputsPanel.classList.add("active-panel");
      textInputsPanel.classList.remove("active-panel");
    } else {
      imageInputsPanel.classList.remove("active-panel");
      textInputsPanel.classList.add("active-panel");
    }
  });
});

// Image mode: file input label
fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    fileLabel.textContent = e.target.files[0].name;
    fileLabel.classList.add("has-file");
  } else {
    fileLabel.textContent = "Choose an image file";
    fileLabel.classList.remove("has-file");
  }
});

// resolution sliders
resolutionSlider.addEventListener("input", (e) => {
  const value = parseInt(e.target.value);
  const percentage = Math.round(((value - 50) / (1000 - 50)) * 100);
  resolutionValue.textContent = percentage + "%";
});
resolutionSliderText.addEventListener("input", (e) => {
  const value = parseInt(e.target.value);
  const percentage = Math.round(((value - 50) / (1000 - 50)) * 100);
  resolutionValueText.textContent = percentage + "%";
});

// color mode toggle (image)
modeOptions.forEach(btn => {
  btn.addEventListener("click", () => {
    modeOptions.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    colorMode = btn.dataset.mode;
    const textColorGroup = document.getElementById("textColorGroup");
    if (colorMode === "dynamic") {
      textColorGroup.classList.add("hidden");
    } else {
      textColorGroup.classList.remove("hidden");
    }
    updatePreviewColors();
  });
});

// static text color (image)
textColorPicker.addEventListener("input", (e) => {
  currentTextColor = e.target.value;
  textColorHex.value = currentTextColor;
  updatePreviewColors();
});
textColorHex.addEventListener("input", (e) => {
  let hex = e.target.value;
  if (!hex.startsWith("#")) hex = "#" + hex;
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    currentTextColor = hex;
    textColorPicker.value = hex;
    updatePreviewColors();
  }
});

// background options (image)
bgOptions.forEach(btn => {
  btn.addEventListener("click", () => {
    bgOptions.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentBgColor = btn.dataset.color;
    updatePreviewColors();
  });
});

// text mode color sync
textColorPickerText.addEventListener("input", (e) => {
  textColorHexText.value = e.target.value;
});
textColorHexText.addEventListener("input", (e) => {
  let hex = e.target.value;
  if (!hex.startsWith("#")) hex = "#" + hex;
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    textColorPickerText.value = hex;
  }
});

// text mode background
textModeBgBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    textModeBgBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// text style buttons
textStyleBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    textStyleBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// --- Helper functions ---

function escapeHtml(ch) {
  return ch
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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

function measureGlyphWidth(fontFamily, fontSizePx) {
  const cvs = document.createElement("canvas");
  const ctx = cvs.getContext("2d");
  ctx.font = `${fontSizePx}px ${fontFamily}`;
  return Math.ceil(ctx.measureText("@").width);
}

// Convert image element to ascii + color map
function imageToAsciiFromImageElement(img, cols, baseBgColor = "#000000") {
  const testW  = measureGlyphWidth("monospace", 10);
  const aspect = testW / 10;
  const rows   = Math.max(
    1,
    Math.round(cols * aspect * (img.naturalHeight / img.naturalWidth) * 0.95)
  );

  const tmp = document.createElement("canvas");
  tmp.width  = cols;
  tmp.height = rows;
  const tctx = tmp.getContext("2d");

  // Fill with background then draw image
  tctx.fillStyle = baseBgColor;
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
        const bg = hexToRgb(baseBgColor) || {r:0,g:0,b:0};
        rr = bg.r; gg = bg.g; bb = bg.b;
      }
      rowColors.push(`rgb(${rr},${gg},${bb})`);
      const gray = 0.299 * rr + 0.587 * gg + 0.114 * bb;
      const idx  = Math.floor((gray / 255) * (CHARSET.length - 1));
      ascii += CHARSET[CHARSET.length - 1 - idx];
    }
    localColorMap.push(rowColors);
    ascii += "\n";
  }

  return { ascii, cols, rows, colorMap: localColorMap };
}

// Render preview HTML from ascii and colorMap
function applyDynamicColors(localColorMap, asciiText) {
  if (!localColorMap || !asciiText) return;
  const lines = asciiText.split('\n');
  let html = '';
  for (let y = 0; y < lines.length; y++) {
    const line = lines[y];
    for (let x = 0; x < line.length; x++) {
      const ch = line[x] === ' ' ? '&nbsp;' : escapeHtml(line[x]);
      const color = (localColorMap[y] && localColorMap[y][x]) ? localColorMap[y][x] : currentTextColor;
      html += `<span style="color:${color};">${ch}</span>`;
    }
    if (y < lines.length - 1) html += '<br>';
  }
  asciiOutput.style.color = '';
  asciiOutput.innerHTML = html;
}

// Update preview based on current state
function updatePreviewColors() {
  document.querySelector(".preview").style.background = currentBgColor;
  if (!lastAsciiText) return;
  if (colorMode === "static" || !colorMap) {
    asciiOutput.style.color = currentTextColor;
    asciiOutput.textContent = lastAsciiText;
  } else {
    applyDynamicColors(colorMap, lastAsciiText);
  }
}

// --- Conversion flows ---

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
  const baseBg = currentBgColor;
  const { ascii, rows, colorMap: returnedColorMap } = imageToAsciiFromImageElement(img, cols, baseBg);
  const trimmedAscii = ascii.replace(/ +$/gm, "");
  lastAsciiText = trimmedAscii;
  colorMap = returnedColorMap;
  downloadPngBtn.disabled = false;
  downloadTextPngBtn.disabled = false;

  const defaultFS = 10;
  const glyphW = measureGlyphWidth("monospace", defaultFS);
  const asciiW = cols * glyphW;
  const asciiH = rows * defaultFS;

  // Scale for preview fitting
  const previewContainer = document.querySelector('.preview');
  const containerRect = previewContainer.getBoundingClientRect();
  const availableWidth = containerRect.width - 64;
  const availableHeight = containerRect.height - 64;
  const scale = Math.min(availableWidth / asciiW, availableHeight / asciiH, 1);

  asciiOutput.style.cssText = `
    font-family: monospace;
    font-size: ${defaultFS}px;
    line-height: ${defaultFS}px;
    white-space: pre;
    transform-origin: center center;
    transform: scale(${scale});
    display: inline-block;
  `;

  if (colorMode === "dynamic" && colorMap) {
    applyDynamicColors(colorMap, trimmedAscii);
  } else {
    asciiOutput.style.color = currentTextColor;
    asciiOutput.textContent = trimmedAscii;
  }

  // Render to hidden canvas for PNG
  await renderAsciiToCanvas(trimmedAscii, returnedColorMap, cols, rows, defaultFS, currentTextColor, currentBgColor);
}

async function convertTextToAscii() {
  const text = (textInput.value || "").trim();
  if (!text) {
    alert("Please enter text to convert.");
    return;
  }

  // Build a temporary canvas to render the text (large), then convert that image to ascii
  const fontSize = 220;
  const padding = 40;
  const fontStyle = document.querySelector(".text-style-option.active")?.dataset.style === "italic" ? "italic" : "normal";
  const font = `${fontStyle} ${fontSize}px sans-serif`;

  // measure text
  const measureCanvas = document.createElement("canvas");
  const mctx = measureCanvas.getContext("2d");
  mctx.font = font;
  const metrics = mctx.measureText(text);
  const textW = Math.ceil(metrics.width) + padding * 2;
  const textH = Math.ceil(fontSize * 1.2) + padding * 2;

  const tmp = document.createElement("canvas");
  tmp.width = textW;
  tmp.height = textH;
  const tctx = tmp.getContext("2d");

  const bg = document.querySelector(".bg-option-text.active")?.dataset.color || "#000000";
  tctx.fillStyle = bg;
  tctx.fillRect(0, 0, textW, textH);

  tctx.font = font;
  tctx.fillStyle = textColorPickerText.value || "#ffffff";
  tctx.textBaseline = "middle";
  tctx.fillText(text, padding, textH / 2);

  const img = new Image();
  img.src = tmp.toDataURL();
  await img.decode().catch(() => {});

  const cols = parseInt(resolutionSliderText.value, 10);
  const { ascii, rows, colorMap: returnedColorMap } = imageToAsciiFromImageElement(img, cols, bg);
  const trimmedAscii = ascii.replace(/ +$/gm, "");
  lastAsciiText = trimmedAscii;
  colorMap = returnedColorMap;
  currentTextColor = textColorPickerText.value || "#ffffff";
  currentBgColor = bg;
  colorMode = "dynamic"; // text rendering should preserve color by default

  downloadPngBtn.disabled = false;
  downloadTextPngBtn.disabled = false;

  const defaultFS = 10;
  const glyphW = measureGlyphWidth("monospace", defaultFS);

  // preview scaling
  const previewContainer = document.querySelector('.preview');
  const containerRect = previewContainer.getBoundingClientRect();
  const availableWidth = containerRect.width - 64;
  const availableHeight = containerRect.height - 64;
  const scale = Math.min(availableWidth / (cols * glyphW), availableHeight / (rows * defaultFS), 1);

  asciiOutput.style.cssText = `
    font-family: monospace;
    font-size: ${defaultFS}px;
    line-height: ${defaultFS}px;
    white-space: pre;
    transform-origin: center center;
    transform: scale(${scale});
    display: inline-block;
  `;

  applyDynamicColors(colorMap, trimmedAscii);

  await renderAsciiToCanvas(trimmedAscii, returnedColorMap, cols, rows, defaultFS, currentTextColor, currentBgColor);
}

// Render ASCII to canvas, preserving per-glyph color if provided
async function renderAsciiToCanvas(asciiText, localColorMap, cols, rows, glyphSize, staticColor, bgColor) {
  const lines = asciiText.split("\n").filter(l => l !== "");
  if (!lines.length) {
    asciiCanvas.width = asciiCanvas.height = 1;
    lastAsciiMetrics = { cssWidth:1, cssHeight:1, dpr: window.devicePixelRatio || 1 };
    return;
  }

  const maxLen = Math.max(...lines.map(l => l.length));
  const paddedLines = lines.map(line => line.padEnd(maxLen, ' '));

  // measure css width using an in-memory canvas
  const measure = document.createElement("canvas");
  const mctx = measure.getContext("2d");
  mctx.font = `${glyphSize}px monospace`;
  const cssW = Math.ceil(mctx.measureText(paddedLines[0]).width);
  const cssH = paddedLines.length * glyphSize;
  const dpr = window.devicePixelRatio || 1;

  asciiCanvas.width  = Math.round(cssW * dpr);
  asciiCanvas.height = Math.round(cssH * dpr);
  asciiCanvas.style.width  = `${cssW}px`;
  asciiCanvas.style.height = `${cssH}px`;

  const ctx = asciiCanvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, cssW, cssH);
  ctx.font = `${glyphSize}px monospace`;
  ctx.textBaseline = "top";

  const glyphW = measureGlyphWidth("monospace", glyphSize);

  if (localColorMap && localColorMap.length) {
    for (let y = 0; y < paddedLines.length; y++) {
      const line = paddedLines[y];
      for (let x = 0; x < line.length; x++) {
        const ch = line[x];
        const col = (localColorMap[y] && localColorMap[y][x]) ? localColorMap[y][x] : staticColor;
        ctx.fillStyle = col;
        ctx.fillText(ch, x * glyphW, y * glyphSize);
      }
    }
  } else {
    ctx.fillStyle = staticColor;
    paddedLines.forEach((line, y) => {
      ctx.fillText(line, 0, y * glyphSize);
    });
  }

  lastAsciiMetrics = { cssWidth: cssW, cssHeight: cssH, dpr };
}

// --- Buttons wiring ---

convertBtn.addEventListener("click", () =>
  convertSelectedFile().catch(e => alert("Conversion error: " + e.message))
);

convertTextBtn.addEventListener("click", () =>
  convertTextToAscii().catch(e => alert("Conversion error: " + e.message))
);

// Download PNG for image mode
downloadPngBtn.addEventListener("click", () => {
  if (!lastAsciiMetrics) return;
  const url = asciiCanvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = "ascii.png";
  a.click();
});

// Download PNG for text mode (same canvas)
downloadTextPngBtn.addEventListener("click", () => {
  if (!lastAsciiMetrics) return;
  const url = asciiCanvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = "ascii-text.png";
  a.click();
});

// Initialize state
asciiOutput.textContent = "";
downloadPngBtn.disabled = true;
downloadTextPngBtn.disabled = true;
