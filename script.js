const CHARSET        = "@#%*+=-:. ";
const fileInput      = document.getElementById("fileInput");
const fileLabel      = document.getElementById("fileLabel");
const convertBtn     = document.getElementById("convertBtn");
const asciiOutput    = document.getElementById("asciiOutput");
const resolutionSlider = document.getElementById("resolutionSlider");
const resolutionValue = document.getElementById("resolutionValue");
const textColorPicker = document.getElementById("textColorPicker");
const textColorHex = document.getElementById("textColorHex");
const textColorGroup = document.getElementById("textColorGroup");
const modeOptions = document.querySelectorAll(".mode-option");
const bgOptions = document.querySelectorAll(".bg-option");
const downloadTxtBtn = document.getElementById("downloadTxtBtn");
const downloadPngBtn = document.getElementById("downloadPngBtn");
const asciiCanvas    = document.getElementById("asciiCanvas");
const copyButton     = document.getElementById("copyButton");

let lastAsciiText    = "";
let lastAsciiMetrics = null;
let currentTextColor = "#ffffff";
let currentBgColor = "#000000";
let colorMode = "static";
let colorMap = null; // Store 2D color array (global)

// Copy button placeholder
copyButton.addEventListener("click", () => {
  alert("Coming soon!");
});

// Update slider value display
resolutionSlider.addEventListener("input", (e) => {
  const value = parseInt(e.target.value);
  const percentage = Math.round(((value - 50) / (1000 - 50)) * 100);
  resolutionValue.textContent = percentage + "%";
});

// Mode toggle
modeOptions.forEach(btn => {
  btn.addEventListener("click", () => {
    modeOptions.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    colorMode = btn.dataset.mode;

    if (colorMode === "dynamic") {
      textColorGroup.classList.add("hidden");
    } else {
      textColorGroup.classList.remove("hidden");
    }

    updatePreviewColors();
  });
});

// Sync color picker and hex input
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

// Background color toggle
bgOptions.forEach(btn => {
  btn.addEventListener("click", () => {
    bgOptions.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentBgColor = btn.dataset.color;
    updatePreviewColors();
  });
});

function updatePreviewColors() {
  const previewEl = document.querySelector(".preview");
  previewEl.style.background = currentBgColor;

  if (!lastAsciiText) return;

  if (colorMode === "static" || !colorMap) {
    // show plain text with static color
    asciiOutput.style.color = currentTextColor;
    asciiOutput.textContent = lastAsciiText;
  } else if (colorMode === "dynamic" && colorMap) {
    // apply dynamic colors using spans and <br> for new lines
    applyDynamicColors();
  }
}

function applyDynamicColors() {
  if (!colorMap || !lastAsciiText) return;

  const lines = lastAsciiText.split('\n');
  let html = '';

  for (let y = 0; y < lines.length; y++) {
    const line = lines[y];
    for (let x = 0; x < line.length; x++) {
      const char = line[x] === ' ' ? '&nbsp;' : escapeHtml(line[x]);
      const color = (colorMap[y] && colorMap[y][x]) ? colorMap[y][x] : currentTextColor;
      html += `<span style="color:${color};">` + char + `</span>`;
    }
    if (y < lines.length - 1) {
      html += '<br>';
    }
  }

  // Use innerHTML so spans render; keep text color fallback
  asciiOutput.style.color = '';
  asciiOutput.innerHTML = html;
}

// Helper to escape HTML for characters that might conflict
function escapeHtml(ch) {
  return ch
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Update file input label
fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    fileLabel.textContent = e.target.files[0].name;
    fileLabel.classList.add("has-file");
  } else {
    fileLabel.textContent = "Choose an image file";
    fileLabel.classList.remove("has-file");
  }
});

function measureGlyphWidth(fontFamily, fontSizePx) {
  const cvs = document.createElement("canvas");
  const ctx = cvs.getContext("2d");
  ctx.font = `${fontSizePx}px ${fontFamily}`;
  return Math.ceil(ctx.measureText("@").width);
}

function imageToAsciiFromImageElement(img, cols) {
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

  // Draw image into small canvas
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
      // If Transparent pixel, composite over preview background color (approx)
      let rr = r, gg = g, bb = b;
      if (a === 0) {
        // parse hex background color
        const bg = hexToRgb(currentBgColor) || {r:0,g:0,b:0};
        rr = bg.r; gg = bg.g; bb = bg.b;
      }
      // store RGB color for this position
      rowColors.push(`rgb(${rr},${gg},${bb})`);

      // convert to perceived brightness
      const gray = 0.299 * rr + 0.587 * gg + 0.114 * bb;
      const idx  = Math.floor((gray / 255) * (CHARSET.length - 1));
      ascii += CHARSET[CHARSET.length - 1 - idx];
    }
    localColorMap.push(rowColors);
    ascii += "\n";
  }

  return { ascii, cols, rows, colorMap: localColorMap };
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
  const trimmedAscii = ascii.replace(/ +$/gm, "");
  lastAsciiText = trimmedAscii;
  colorMap = returnedColorMap; // store globally for dynamic mode
  downloadTxtBtn.disabled = false;
  downloadPngBtn.disabled = false;

  const defaultFS = 10;
  const glyphW = measureGlyphWidth(fontFamily, defaultFS);
  const asciiW = cols * glyphW;
  const asciiH = rows * defaultFS;

  // Get the preview container's actual dimensions (accounting for padding)
  const previewContainer = document.querySelector('.preview');
  const containerRect = previewContainer.getBoundingClientRect();
  const availableWidth = containerRect.width - 64; // subtract padding
  const availableHeight = containerRect.height - 64;

  const scale = Math.min(availableWidth / asciiW, availableHeight / asciiH, 1);

  asciiOutput.style.cssText = `
    font-family: ${fontFamily}, monospace;
    font-size: ${defaultFS}px;
    line-height: ${defaultFS}px;
    white-space: pre;
    transform-origin: center center;
    transform: scale(${scale});
    display: inline-block;
  `;
  // Set content according to mode
  if (colorMode === "dynamic" && colorMap) {
    applyDynamicColors();
  } else {
    asciiOutput.style.color = currentTextColor;
    asciiOutput.textContent = trimmedAscii;
  }

  // Update preview background
  document.querySelector(".preview").style.background = currentBgColor;

  const lines = trimmedAscii.split("\n").filter(l => l !== "");
  if (!lines.length) {
    asciiCanvas.width = asciiCanvas.height = 1;
    lastAsciiMetrics = { cssWidth:1, cssHeight:1, dpr:window.devicePixelRatio||1 };
    return;
  }

  const maxLen = Math.max(...lines.map(l => l.length));
  const paddedLines = lines.map(line => line.padEnd(maxLen, ' '));

  // Prepare canvas for PNG export
  const tmpCanvas = document.createElement("canvas");
  const tmpCtx = tmpCanvas.getContext("2d");
  tmpCtx.font = `${defaultFS}px ${fontFamily}`;
  const cssW = Math.ceil(tmpCtx.measureText(paddedLines[0]).width);
  const cssH = paddedLines.length * defaultFS;
  const dpr = window.devicePixelRatio || 1;

  asciiCanvas.width  = Math.round(cssW * dpr);
  asciiCanvas.height = Math.round(cssH * dpr);
  asciiCanvas.style.width  = `${cssW}px`;
  asciiCanvas.style.height = `${cssH}px`;

  const ctx = asciiCanvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = currentBgColor;
  ctx.fillRect(0, 0, cssW, cssH);
  ctx.font = `${defaultFS}px ${fontFamily}`;
  ctx.textBaseline = "top";

  if (colorMode === "dynamic" && colorMap) {
    // Draw each glyph individually with its color
    for (let y = 0; y < paddedLines.length; y++) {
      const line = paddedLines[y];
      for (let x = 0; x < line.length; x++) {
        const ch = line[x];
        const col = (colorMap[y] && colorMap[y][x]) ? colorMap[y][x] : currentTextColor;
        ctx.fillStyle = col;
        ctx.fillText(ch, x * glyphW, y * defaultFS);
      }
    }
  } else {
    // static drawing
    ctx.fillStyle = currentTextColor;
    paddedLines.forEach((line, y) => {
      const yOff = y * defaultFS;
      ctx.fillText(line, 0, yOff);
    });
  }

  lastAsciiMetrics = { cssWidth: cssW, cssHeight: cssH, dpr };
}

convertBtn.addEventListener("click", () =>
  convertSelectedFile().catch(e => alert("Conversion error: " + e.message))
);

downloadTxtBtn.addEventListener("click", () => {
  if (!lastAsciiText) return;
  const blob = new Blob([lastAsciiText], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "ascii.txt";
  a.click();
});

downloadPngBtn.addEventListener("click", () => {
  if (!lastAsciiMetrics) return;
  const url = asciiCanvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = "ascii.png";
  a.click();
});

// initialize empty output
asciiOutput.textContent = "";
