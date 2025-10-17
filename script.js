const CHARSET_DEFAULT = "@#%*+=-:. ";
const CHARSET_SYMBOLS = ",./;'[]\\=-`<>?:\"{}|+_)(*&^%$#@!~ ";
const CHARSET_NUMBERS = "0123456789 ";
const CHARSET_LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ";

let CHARSET = CHARSET_DEFAULT;
let appMode = "image";
let textStyle = "standard";
let textColorMode = "default";

const fileInput = document.getElementById("fileInput");
const fileLabel = document.getElementById("fileLabel");
const textInput = document.getElementById("textInput");
const convertBtn = document.getElementById("convertBtn");
const asciiOutput = document.getElementById("asciiOutput");
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
const asciiCanvas = document.getElementById("asciiCanvas");

const mainModeOptions = document.querySelectorAll(".main-mode-option");
const textStyleOptions = document.querySelectorAll(".text-style-option");
const textColorOptions = document.querySelectorAll(".text-color-option");
const imageUploadGroup = document.getElementById("imageUploadGroup");
const textInputGroup = document.getElementById("textInputGroup");
const resolutionGroup = document.getElementById("resolutionGroup");
const textStyleGroup = document.getElementById("textStyleGroup");
const charsetGroup = document.getElementById("charsetGroup");
const imageColorControls = document.getElementById("imageColorControls");
const textColorControls = document.getElementById("textColorControls");
const textCustomColors = document.getElementById("textCustomColors");
const textBgColorPicker = document.getElementById("textBgColorPicker");
const textBgColorHex = document.getElementById("textBgColorHex");
const textTextColorPicker = document.getElementById("textTextColorPicker");
const textTextColorHex = document.getElementById("textTextColorHex");

let lastAsciiText = "";
let lastAsciiMetrics = null;
let currentTextColor = "#848484";
let currentBgColor = "#0d0d0d";
let colorMode = "static";
let charsetMode = "default";
let colorMap = null;

const DEFAULT_FONT_FAMILY = "monospace";
const DEFAULT_FONT_SIZE_PX = 10;
const GLYPH_WIDTH_PX = 8; // fixed glyph width in px for the ASCII outline rendering (canvas cell)
const GLYPH_HEIGHT_PX = 10; // visual line height per output row used on canvas

// Glyph rows increased to 6. All glyphs will be normalized to 6 rows.
const ASCII_FONT = {
  'A': [" ___ ", "|  _|", "|-_||", "|   |", "|   |", "|___|"],
  'B': [" ___ ", "| . |", "| . |", "| . |", "| . |", "|___|"],
  'C': [" ___ ", "|  _|", "|  _|", "|   |", "|   |", "|___|"],
  'D': [" ___ ", "| . |", "| . |", "| . |", "| . |", "|___|"],
  'E': [" ___ ", "| -_|", "| -_|", "|  _|", "|   |", "|___|"],
  'F': [" ___ ", "| -_|", "| -_|", "|  _|", "|   |", "|_|  "],
  'G': [" ___ ", "|  _|", "| . |", "| . |", "|   |", "|___|"],
  'H': ["|   |", "| - |", "|   |", "|   |", "|   |", "|___|"],
  'I': ["___", " | ", " | ", " | ", " | ", "|_|"],
  'J': ["  _ ", "  | ", "  | ", "  | ", " _| ", "|__|"],
  'K': ["|   ", "| < ", "| \\ ", "|  \\ ", "|   \\ ", "|_|\\ "],
  'L': ["|    ", "|    ", "|    ", "|    ", "|    ", "|____|"],
  'M': [" _____ ", "|     |", "| | | |", "| | | |", "|     |", "|_|_|_|"],
  'N': [" _   _ ", "| \\_| |", "|  \\  |", "|   \\ |", "|     |", "|_|___|"],
  'O': [" ___ ", "| . |", "| . |", "| . |", "|   |", "|___|"],
  'P': [" ___ ", "| . |", "|  _|", "|  | ", "|   |", "|_|  "],
  'Q': [" ___ ", "| . |", "| . |", "| . |", "|  \\|", "|_  |"],
  'R': [" ___ ", "| . |", "| <_|", "|  \\ ", "|   \\", "|_|\\ "],
  'S': [" ___ ", "|_ -|", "|_ -|", "|  _|", "|   |", "|___|"],
  'T': ["_____", "  |  ", "  |  ", "  |  ", "  |  ", "  |  "],
  'U': ["|   |", "|   |", "|   |", "|   |", "|   |", "|___|"],
  'V': ["|   |", "|   |", "|   |", " \\ / ", " \\ / ", "  V  "],
  'W': ["|     |", "|  |  |", "|  |  |", "|  |  |", "|  |  |", " \\_|_/ "],
  'X': ["|   |", " \\ / ", "  X  ", "  X  ", " / \\ ", "|   |"],
  'Y': ["|   |", " \\ / ", "  |  ", "  |  ", "  |  ", "  |  "],
  'Z': ["|___|", "   / ", "  /  ", " /   ", "/    ", "|___|"],
  'a': ["     ", " ___ ", "| .'|", "|__,|", "     ", "     "],
  'b': ["|    ", "| . \\", "| . /", "|___/", "|    ", "|    "],
  'c': ["     ", " ___ ", "|  _|", "|___|", "     ", "     "],
  'd': ["    |", " ___|", "| . |", "|___|", "     ", "     "],
  'e': ["     ", " ___ ", "| -_|", "|___|", "     ", "     "],
  'f': [" ___ ", "|  _|", "|  _|", "|_|  ", "     ", "     "],
  'g': ["     ", " ___ ", "| . |", "|_  |", "  _| ", " |__|"],
  'h': ["|    ", "| -_|", "|   |", "|   |", "|   |", "|_|_|"],
  'i': [" _ ", "   ", "| |", "| |", "| |", "|_|"],
  'j': ["  _ ", "    ", "  | ", "  | ", " _| ", "|_  "],
  'k': ["|   ", "| < ", "| \\ ", "|  \\ ", "|   \\ ", "|_|\\ "],
  'l': ["| ", "| ", "| ", "| ", "| ", "|_"],
  'm': ["       ", " _____ ", "|     |", "| | | |", "|     |", "|_|_|_|"],
  'n': ["     ", " ___ ", "|   |", "|   |", "|   |", "|_|_|"],
  'o': ["     ", " ___ ", "| . |", "| . |", "|   |", "|___|"],
  'p': ["     ", " ___ ", "| . |", "|  _|", "| |  ", "|_|  "],
  'q': ["     ", " ___ ", "| . |", "|_  |", "  | |", "  |_|"],
  'r': ["     ", " ___ ", "|  _|", "|_|  ", "     ", "     "],
  's': ["     ", " ___ ", "|_ -|", "|___|", "     ", "     "],
  't': [" ___ ", "|  _|", "|  _|", "|_|  ", "     ", "     "],
  'u': ["     ", "     ", "| | |", "| | |", "| | |", "|___|"],
  'v': ["     ", "     ", "| | |", "| | |", " \\_/ ", "     "],
  'w': ["       ", "       ", "| | | |", "| | | |", "|_____|", "       "],
  'x': ["     ", "     ", "|-._|", "|-._|", "|___|", "     "],
  'y': ["     ", "     ", "| | |", "| | |", "|_  |", "  |_|"],
  'z': ["     ", " ___ ", "|_ /", "/___|", "     ", "     "],
  '0': [" ___ ", "|   |", "|   |", "|   |", "|   |", "|___|"],
  '1': [" _ ", "| |", "| |", "| |", "| |", "|_|"],
  '2': [" ___ ", " __|", "|__ ", "|  \\ ", "|   \\", "|___|"],
  '3': [" ___ ", " __|", " __|", "   |", " __|", "|___|"],
  '4': ["|   ", "| | ", "|_| ", "  | ", "  | ", "  | "],
  '5': [" ___ ", "|__ ", " __|", "   |", " __|", "|___|"],
  '6': [" ___ ", "|__ ", "|  |", "|  |", "|  |", "|___|"],
  '7': ["|___|", "  / ", " /  ", "/   ", "    ", "    "],
  '8': [" ___ ", "| . |", "| . |", "| . |", "| . |", "|___|"],
  '9': [" ___ ", "| . |", "| . |", " __|", "  _|", "|___|"],
  ' ': ["  ", "  ", "  ", "  ", "  ", "  "],
  '!': ["| ", "| ", "  ", "  ", "| ", "|."],
  '?': [" ___ ", "  _|", " |  ", "    ", " o  ", "    "],
  '.': ["  ", "  ", "  ", "  ", "  ", "|."],
  ',': ["  ", "  ", "  ", "  ", "  ", "|,"],
  '-': ["    ", "____", "    ", "    ", "    ", "    "],
  '_': ["    ", "    ", "    ", "    ", "    ", "____"],
  '+': ["    ", " _|_", "|_|_|", " _|_", "|_|_|", "    "],
  '=': ["    ", "____", "____", "____", "    ", "    "],
  '/': ["   /", "  / ", " /  ", "/   ", "    ", "    "],
  '(': [" /", "| ", "| ", "| ", "| ", " \\"],
  ')': ["\\ ", " |", " |", " |", " |", "/ "],
  '[': ["_|", "| ", "| ", "| ", "| ", "|_"],
  ']': ["|_", " |", " |", " |", " |", "_|"],
  ':': [" _ ", "|.|", "   ", "   ", "|.|", "   "],
  ';': [" _ ", "|.|", "   ", "   ", "|,|", "   "],
  '&': [" ___ ", "|_  |", " _| |", "|  _|", "| |  ", "|___|"],
  '@': [" ___ ", "| ._|", "| ._|", "| . |", "|    ", "|___|"],
  '#': [" _ _ ", "|#|#|", "|#|#|", " | | ", " | | ", "     "],
  '*': ["    ", "\\ | /", " \\|/ ", "  *  ", "     ", "     "],
  '%': ["o_/ ", " /  ", "/ _o", "    ", "    ", "    "]
};

// determine max char width across all rows/glyphs
const GLYPH_CHAR_WIDTH = (() => {
  let max = 0;
  for (const k in ASCII_FONT) {
    const arr = ASCII_FONT[k];
    for (const row of arr) {
      if (row.length > max) max = row.length;
    }
  }
  return max;
})();

const GLYPH_ROWS = 6; // new glyph height in rows

function padToWidth(s, w) {
  if (s.length >= w) return s;
  return s + ' '.repeat(w - s.length);
}
// helper: right-trim trailing spaces from a string
function rtrim(s) {
  let end = s.length;
  while (end > 0 && s[end - 1] === ' ') end--;
  return s.slice(0, end);
}

// normalize glyph to exactly GLYPH_ROWS rows but trim trailing spaces on each row
function normalizedGlyph(char) {
  const patt = ASCII_FONT[char];
  const normalized = [];
  if (!patt) {
    for (let r = 0; r < GLYPH_ROWS; r++) normalized.push('');
    return normalized;
  }
  for (let r = 0; r < GLYPH_ROWS; r++) {
    const row = patt[r] !== undefined ? patt[r] : '';
    normalized.push(rtrim(row));
  }
  return normalized;
}

// Convert input text to a single ASCII-outline string with no spacing between glyphs.
// Each glyph contributes its trimmed rows; rows are concatenated directly so glyphs butt up against one another.
// slantSpacesPerRow controls linear slant (0 = none, 1 = small slant, etc).
function textToAsciiOutlineFixed(text, slantSpacesPerRow = 0) {
  const patterns = [];
  for (let ch of text) {
    patterns.push(normalizedGlyph(ch));
  }

  // build base rows (GLYPH_ROWS), concatenating glyph rows with no spacing
  const baseRows = [];
  for (let r = 0; r < GLYPH_ROWS; r++) {
    let line = '';
    for (let i = 0; i < patterns.length; i++) {
      line += patterns[i][r]; // directly append trimmed row (no padding)
    }
    baseRows.push(line);
  }

  // apply linear slant: add leading spaces proportional to row index
  const outputRows = [];
  for (let r = 0; r < baseRows.length; r++) {
    const lead = r * slantSpacesPerRow;
    outputRows.push(' '.repeat(lead) + baseRows[r]);
  }

  const ascii = outputRows.join('\n');
  const cols = Math.max(...outputRows.map(l => l.length));
  const rows = outputRows.length;

  return { ascii, cols, rows };
}

mainModeOptions.forEach(btn => {
  btn.addEventListener("click", () => {
    mainModeOptions.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    appMode = btn.dataset.mainmode;

    if (appMode === "text") {
      imageUploadGroup.classList.add("hidden");
      resolutionGroup.classList.add("hidden");
      charsetGroup.classList.add("hidden");
      imageColorControls.classList.add("hidden");
      textInputGroup.classList.remove("hidden");
      textStyleGroup.style.display = "block";
      textColorControls.classList.remove("hidden");
    } else {
      textInputGroup.classList.add("hidden");
      textStyleGroup.style.display = "none";
      textColorControls.classList.add("hidden");
      imageUploadGroup.classList.remove("hidden");
      resolutionGroup.classList.remove("hidden");
      charsetGroup.classList.remove("hidden");
      imageColorControls.classList.remove("hidden");
    }

    asciiOutput.textContent = "";
    lastAsciiText = "";
    copyBtn.disabled = true;
    downloadPngBtn.disabled = true;
  });
});

textStyleOptions.forEach(btn => {
  btn.addEventListener("click", () => {
    textStyleOptions.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    textStyle = btn.dataset.style;
  });
});

textColorOptions.forEach(btn => {
  btn.addEventListener("click", () => {
    textColorOptions.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    textColorMode = btn.dataset.textcolor;

    if (textColorMode === "custom") {
      textCustomColors.style.display = "grid";
    } else {
      textCustomColors.style.display = "none";
    }

    updateTextModeColors();
  });
});

textBgColorPicker.addEventListener("input", (e) => {
  textBgColorHex.value = e.target.value;
  updateTextModeColors();
});

textBgColorHex.addEventListener("input", (e) => {
  let hex = e.target.value;
  if (!hex.startsWith("#")) hex = "#" + hex;
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    textBgColorPicker.value = hex;
    updateTextModeColors();
  }
});

textTextColorPicker.addEventListener("input", (e) => {
  textTextColorHex.value = e.target.value;
  updateTextModeColors();
});

textTextColorHex.addEventListener("input", (e) => {
  let hex = e.target.value;
  if (!hex.startsWith("#")) hex = "#" + hex;
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    textTextColorPicker.value = hex;
    updateTextModeColors();
  }
});

function updateTextModeColors() {
  if (appMode !== "text" || !lastAsciiText) return;

  const previewEl = document.querySelector(".preview");
  let bgColor, textColor;

  if (textColorMode === "default") {
    bgColor = "#000000";
    textColor = "#ffffff";
  } else if (textColorMode === "white") {
    bgColor = "#ffffff";
    textColor = "#000000";
  } else {
    bgColor = textBgColorHex.value;
    textColor = textTextColorHex.value;
  }

  previewEl.style.background = bgColor;
  asciiOutput.style.color = textColor;
}

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
    totalBrightness += data[i];
  }

  return totalBrightness / (data.length / 4);
}

function processCustomCharset(input) {
  if (!input || input.trim() === "") {
    return CHARSET_DEFAULT;
  }

  let chars = [...new Set(input.split(''))];

  if (!chars.includes(' ')) {
    chars.push(' ');
  }

  const charBrightness = chars.map(char => ({
    char: char,
    brightness: calculateCharBrightness(char)
  }));

  charBrightness.sort((a, b) => b.brightness - a.brightness);

  return charBrightness.map(item => item.char).join('');
}

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

resolutionSlider.addEventListener("input", (e) => {
  const value = parseInt(e.target.value);
  const percentage = Math.round(((value - 50) / (430 - 50)) * 100);
  resolutionValue.textContent = percentage + "%";
});

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

customCharsetInput.addEventListener("input", (e) => {
  if (charsetMode === "custom") {
    CHARSET = processCustomCharset(e.target.value);
  }
});

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
    asciiOutput.style.color = currentTextColor;
    asciiOutput.textContent = lastAsciiText;
  } else if (colorMode === "dynamic" && colorMap) {
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

  asciiOutput.style.color = '';
  asciiOutput.innerHTML = html;
}

function escapeHtml(ch) {
  return ch
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

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

// TEXT conversion pipeline (fixed-width, 6-row glyphs, linear slant)
async function convertTextToAscii() {
  const text = textInput.value || "";
  const trimmed = text.trim();

  if (!trimmed) {
    alert("Please enter some text first.");
    return;
  }

  if (trimmed.length > 15) {
    alert("Text is too long. Maximum 15 characters allowed.");
    return;
  }

  // slant: linear spaces per glyph-row. choose 1 for italic, 0 for standard.
  const slantSpacesPerRow = textStyle === "italic" ? 1 : 0;
  const { ascii, cols, rows } = textToAsciiOutlineFixed(trimmed, slantSpacesPerRow);

  lastAsciiText = ascii;
  colorMap = null;
  copyBtn.disabled = false;
  downloadPngBtn.disabled = false;

  // determine colors
  let bgColor, textColor;
  if (textColorMode === "default") {
    bgColor = "#000000";
    textColor = "#ffffff";
  } else if (textColorMode === "white") {
    bgColor = "#ffffff";
    textColor = "#000000";
  } else {
    bgColor = textBgColorHex.value;
    textColor = textTextColorHex.value;
  }

  // prepare preview styling: center and scale to fit preview
  const previewEl = document.querySelector('.preview');
  const defaultFS = DEFAULT_FONT_SIZE_PX;
  const fontFamily = DEFAULT_FONT_FAMILY;
  const glyphW = measureGlyphWidth(fontFamily, defaultFS);
  const asciiW = cols * glyphW;
  const asciiH = rows * defaultFS;

  const availableWidth = previewEl.clientWidth * 0.9;
  const availableHeight = previewEl.clientHeight * 0.9;
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
    color: ${textColor};
    text-align: left;
  `;

  asciiOutput.textContent = ascii;
  previewEl.style.background = bgColor;

  // Canvas export: use GLYPH_WIDTH_PX and GLYPH_HEIGHT_PX as cell sizes to preserve exact spacing
  const canvasGlyphW = GLYPH_WIDTH_PX;
  const canvasGlyphH = GLYPH_HEIGHT_PX;
  const cssW = cols * canvasGlyphW;
  const cssH = rows * canvasGlyphH;
  const dpr = window.devicePixelRatio || 1;

  asciiCanvas.width = Math.round(cssW * dpr);
  asciiCanvas.height = Math.round(cssH * dpr);
  asciiCanvas.style.removeProperty('width');
  asciiCanvas.style.removeProperty('height');

  const ctx = asciiCanvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, cssW, cssH);

  // map font size to canvas cell height for consistent results
  ctx.font = `${canvasGlyphH}px ${fontFamily}`;
  ctx.textBaseline = "top";
  ctx.fillStyle = textColor;

  const lines = ascii.split('\n');
  for (let y = 0; y < lines.length; y++) {
    const line = lines[y];
    for (let x = 0; x < line.length; x++) {
      const ch = line[x];
      if (ch !== ' ') {
        ctx.fillText(ch, x * canvasGlyphW, y * canvasGlyphH);
      }
    }
  }

  lastAsciiMetrics = { cssWidth: cssW, cssHeight: cssH, dpr };
}

// Keep all image-to-ASCII functions unchanged from original code (left intact)
function hexToRgb(hex) {
  if (!hex) return null;
  const m = hex.replace('#','');
  if (m.length !== 6) return null;
  const r = parseInt(m.substring(0,2),16);
  const g = parseInt(m.substring(2,4),16);
  const b = parseInt(m.substring(4,6),16);
  return { r, g, b };
}

function textToAsciiOutline(text) {
  for (let char of text) {
    if (!ASCII_FONT[char]) {
      throw new Error(`Unsupported character: "${char}". Only letters, numbers, and common symbols are supported.`);
    }
  }

  const patterns = text.split('').map(char => ASCII_FONT[char]);
  const height = 4;

  const lines = [];
  for (let row = 0; row < height; row++) {
    let line = '';
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i][row];
      line += pattern;
    }
    lines.push(line);
  }

  const ascii = lines.join('\n');
  const asciiLines = ascii.split('\n');
  const cols = Math.max(...asciiLines.map(l => l.length));
  const rows = asciiLines.length;

  return { ascii, cols, rows };
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
    applyDynamicColors();
  } else {
    asciiOutput.style.color = currentTextColor;
    asciiOutput.textContent = paddedAscii;
  }

  previewEl.style.background = currentBgColor;

  const canvasLines = paddedAscii.split("\n");
  while (canvasLines.length > 0 && canvasLines[canvasLines.length - 1].trim() === '') {
    canvasLines.pop();
  }

  if (!canvasLines.length) {
    asciiCanvas.width = asciiCanvas.height = 1;
    lastAsciiMetrics = { cssWidth:1, cssHeight:1, dpr:window.devicePixelRatio||1 };
    return;
  }

  const paddedLines = canvasLines;

  const tmpCanvas = document.createElement("canvas");
  const tmpCtx = tmpCanvas.getContext("2d");
  tmpCtx.font = `${defaultFS}px ${fontFamily}`;

  const cssW = cols * glyphW;
  const cssH = paddedLines.length * defaultFS;
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
    ctx.fillStyle = currentTextColor;
    paddedLines.forEach((line, y) => {
      const yOff = y * defaultFS;
      ctx.fillText(line, 0, yOff);
    });
  }

  lastAsciiMetrics = { cssWidth: cssW, cssHeight: cssH, dpr };
}

convertBtn.addEventListener("click", () => {
  if (appMode === "text") {
    convertTextToAscii().catch(e => alert("Conversion error: " + e.message));
  } else {
    convertSelectedFile().catch(e => alert("Conversion error: " + e.message));
  }
});

function downloadPNG() {
  if (!lastAsciiMetrics) return;
  const url = asciiCanvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = "ascii.png";
  a.click();
}

downloadPngBtn.addEventListener("click", downloadPNG);

asciiOutput.textContent = "";
