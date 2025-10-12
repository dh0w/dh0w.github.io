const CHARSET_DEFAULT = "@#%*+=-:. ";
const CHARSET_SYMBOLS = ",./;'[]\=-`<>?:\"{}|+_)(*&^%$#@!~ ";
const CHARSET_NUMBERS = "0123456789 ";
const CHARSET_LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ";

let CHARSET = CHARSET_DEFAULT;
const fileInput      = document.getElementById("fileInput");
const fileLabel      = document.getElementById("fileLabel");
const convertBtn     = document.getElementById("convertBtn");
const asciiOutput    = document.getElementById("asciiOutput");
const resolutionSlider = document.getElementById("resolutionSlider");
const resolutionValue = document.getElementById("resolutionValue");
const textColorPicker = document.getElementById("textColorPicker");
const textColorHex = document.getElementById("textColorHex");
const textColorGroup = document.getElementById("textColorGroup");
const bgColorPicker = document.getElementById("bgColorPicker");
const bgColorHex = document.getElementById("bgColorHex");
const modeOptions = document.querySelectorAll(".mode-option");
const charsetOptions = document.querySelectorAll(".charset-option");
const customCharsetInput = document.getElementById("customCharset");
const copyBtn = document.getElementById("copyBtn");
const downloadPngBtn = document.getElementById("downloadPngBtn");
const asciiCanvas    = document.getElementById("asciiCanvas");

let lastAsciiText    = "";
let lastAsciiMetrics = null;
let currentTextColor = "#848484";
let currentBgColor = "#0d0d0d";
let colorMode = "static";
let charsetMode = "default";
let colorMap = null; // Store 2D color array (global)

// Function to calculate brightness of a character
function calculateCharBrightness(char, fontFamily = "monospace", fontSize = 10) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  canvas.width = fontSize * 2;
  canvas.height = fontSize * 2;
  
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = "white";
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textBaseline = "top";
  ctx.fillText(char, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  let totalBrightness = 0;
  for (let i = 0; i < data.length; i += 4) {
    totalBrightness += data[i]; // Red channel (since it's white on black, all channels are same)
  }
  
  return totalBrightness / (data.length / 4); // Average brightness
}

// Function to process and sort custom charset
function processCustomCharset(input) {
  if (!input || input.trim() === "") {
    return CHARSET_DEFAULT;
  }
  
  // Remove duplicates and ensure space is included
  let chars = [...new Set(input.split(''))];
  
  // Always ensure space is in the set
  if (!chars.includes(' ')) {
    chars.push(' ');
  }
  
  // Calculate brightness for each character and sort from dark to light
  const charBrightness = chars.map(char => ({
    char: char,
    brightness: calculateCharBrightness(char)
  }));
  
  // Sort by brightness (darkest first)
  charBrightness.sort((a, b) => b.brightness - a.brightness);
  
  return charBrightness.map(item => item.char).join('');
}

// Copy button functionality
async function copyAsciiText() {
  if (!lastAsciiText) return;
  
  try {
    await navigator.clipboard.writeText(lastAsciiText);
    const originalHTML = copyBtn.innerHTML;
    const checkSVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>`;
    copyBtn.innerHTML = checkSVG;
    
    setTimeout(() => {
      copyBtn.innerHTML = originalHTML;
    }, 1500);
  } catch (err) {
    alert("Failed to copy text: " + err.message);
  }
}

copyBtn.addEventListener("click", copyAsciiText);

// Update slider value display (adjusted for new range)
resolutionSlider.addEventListener("input", (e) => {
  const value = parseInt(e.target.value);
  const percentage = Math.round(((value - 50) / (430 - 50)) * 100);
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

// Charset toggle
charsetOptions.forEach(btn => {
  btn.addEventListener("click", () => {
    charsetOptions.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    charsetMode = btn.dataset.charset;

    if (charsetMode === "custom") {
      customCharsetInput.disabled = false;
      customCharsetInput.classList.remove("disabled");
      CHARSET = processCustomCharset(customCharsetInput.value);
    } else {
      customCharsetInput.disabled = true;
      customCharsetInput.classList.add("disabled");
      
      switch(charsetMode) {
        case "symbols":
          CHARSET = processCustomCharset(CHARSET_SYMBOLS);
          break;
        case "numbers":
          CHARSET = processCustomCharset(CHARSET_NUMBERS);
          break;
        case "letters":
          CHARSET = processCustomCharset(CHARSET_LETTERS);
          break;
        default:
          CHARSET = CHARSET_DEFAULT;
      }
    }
  });
});

// Custom charset input
customCharsetInput.addEventListener("input", (e) => {
  if (charsetMode === "custom") {
    CHARSET = processCustomCharset(e.target.value);
  }
});

// Sync text color picker and hex input
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

// Sync background color picker and hex input
bgColorPicker.addEventListener("input", (e) => {
  currentBgColor = e.target.value;
  bgColorHex.value = currentBgColor;
  updatePreviewColors();
});

bgColorHex.addEventListener("input", (e) => {
  let hex = e.target.value;
  if (!hex.startsWith("#")) hex = "#" + hex;
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    currentBgColor = hex;
    bgColorPicker.value = hex;
    updatePreviewColors();
  }
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
  // trim trailing spaces from each line
  const trimmedAscii = ascii.split("\n").map(l => l.replace(/\s+$/,'')).join("\n");
  lastAsciiText = trimmedAscii;
  colorMap = returnedColorMap; // store globally for dynamic mode
  copyBtn.disabled = false;
  downloadPngBtn.disabled = false;

  const defaultFS = 10;
  const glyphW = measureGlyphWidth(fontFamily, defaultFS);
  const asciiW = cols * glyphW;
  const asciiH = rows * defaultFS;

  // Get the preview element's actual inner space (no padding) to center into
  const previewEl = document.querySelector('.preview');
  // use clientWidth/Height to get available drawing box
  const availableWidth = previewEl.clientWidth;
  const availableHeight = previewEl.clientHeight;

  // compute scale to fit into preview while preserving aspect
  const scale = Math.min(availableWidth / asciiW, availableHeight / asciiH, 1);

  // Apply CSS to asciiOutput to center using absolute centering and scale
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
  // Set content according to mode
  if (colorMode === "dynamic" && colorMap) {
    applyDynamicColors();
  } else {
    asciiOutput.style.color = currentTextColor;
    asciiOutput.textContent = trimmedAscii;
  }

  // Update preview background
  previewEl.style.background = currentBgColor;

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
  // Let CSS handle the display dimensions for proper scaling (canvas is hidden in UI)
  asciiCanvas.style.removeProperty('width');
  asciiCanvas.style.removeProperty('height');

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

function downloadPNG() {
  if (!lastAsciiMetrics) return;
  const url = asciiCanvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = "ascii.png";
  a.click();
}

downloadPngBtn.addEventListener("click", downloadPNG);

// initialize empty output
asciiOutput.textContent = "";