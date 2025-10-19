// ===== CONSTANTS AND VARIABLES =====
const CHARSET_DEFAULT = "@#%*+=-:. ";
const CHARSET_SYMBOLS = ",./;'[]\=-`<>?:\"{}|+_)(*&^%$#@!~ ";
const CHARSET_NUMBERS = "0123456789 ";
const CHARSET_LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ";

let CHARSET = CHARSET_DEFAULT;
let appMode = "image";
let textStyle = "standard";
let textColorMode = "default";

// DOM Elements
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
let fontsLoaded = false;

// ===== EMBEDDED FIGLET FONTS =====
const OGRE_FONT = `flf2a$ 6 5 20 15 13
Standard by Glenn Chappell & Ian Chai 3/93 -- based on .sig of Frank Sheeran
Figlet release 2.0 -- August 5, 1993
$@
$@
$@
$@
$@
$@@
   _ @
  / \\@
 /  /@
/\\_/ @
\\/   @
     @@
 _ _ @
( | )@
 V V @
     @
     @
     @@
   _  _   @
 _| || |_ @
|_  ..  _|@
|_      _|@
  |_||_|  @
          @@
  _  @
 | | @
/ __)@
\\__ \\@
(   /@
 |_| @@
 _  __@
(_)/ /@
  / / @
 / /_ @
/_/(_)@
      @@
  ___   @
 ( _ )  @
 / _ \\/\\@
| (_>  <@
 \\___\\/@
        @@
 _ @
( )@
|/ @
   @
   @
   @@
  __@
 / /@
| | @
| | @
| | @
 \\_\\@@
__  @
\\ \\ @
 | |@
 | |@
 | |@
/_/ @@
      @
__/\\__@
\\    /@
/_  _\\@
  \\/  @
      @@
       @
   _   @
 _| |_ @
|_   _|@
  |_|  @
       @@
   @
   @
   @
 _ @
( )@
|/ @@
       @
       @
 _____ @
|_____|@
       @
       @@
   @
   @
   @
 _ @
(_)@
   @@
    __@
   / /@
  / / @
 / /  @
/_/   @
      @@
  ___  @
 / _ \\ @
| | | |@
| |_| |@
 \\___/ @
       @@
 _ @
/ |@
| |@
| |@
|_|@
   @@
 ____  @
|___ \\ @
  __) |@
 / __/ @
|_____|@
       @@
 _____ @
|___ / @
  |_ \\ @
 ___) |@
|____/ @
       @@
 _  _   @
| || |  @
| || |_ @
|__   _|@
   |_|  @
        @@
 ____  @
| ___| @
|___ \\ @
 ___) |@
|____/ @
       @@
  __   @
 / /_  @
| '_ \\ @
| (_) |@
 \\___/ @
       @@
 _____ @
|___  |@
   / / @
  / /  @
 /_/   @
       @@
  ___  @
 ( _ ) @
 / _ \\ @
| (_) |@
 \\___/ @
       @@
  ___  @
 / _ \\ @
| (_) |@
 \\__, |@
   /_/ @
       @@
   @
 _ @
(_)@
 _ @
(_)@
   @@
   @
 _ @
(_)@
 _ @
( )@
|/ @@
  __@
 / /@
/ / @
\\ \\ @
 \\_\\@
    @@
       @
 _____ @
|_____|@
|_____|@
       @
       @@
__  @
\\ \\ @
 \\ \\@
 / /@
/_/ @
    @@
 ___ @
/ _ \\@
\\// /@
  \\/ @
  () @
     @@
   ____  @
  / __ \\ @
 / / _\` |@
| | (_| |@
 \\ \\__,_|@
  \\____/ @@
   _   @
  /_\\  @
 //_\\\\ @
/  _  \\@
\\_/ \\_/@
       @@
   ___ @
  / __\\@
 /__\\/@
/ \\/  \\@
\\_____/@
       @@
   ___ @
  / __\\@
 / /   @
/ /___ @
\\____/ @
       @@
    ___ @
   /   \\@
  / /\\ /@
 / /_// @
/___,'  @
        @@
   __ @
  /__\\@
 /_\\  @
//__  @
\\__/  @
      @@
   ___ @
  / __\\@
 / _\\  @
/ /    @
\\/     @
       @@
   ___ @
  / _ \\@
 / /_\\/@
/ /_\\\\ @
\\____/ @
       @@
        @
  /\\  /\\@
 / /_/ /@
/ __  / @
\\/ /_/  @
        @@
  _____ @
  \\_   \\@
   / /\\/@
/\\/ /_  @
\\____/  @
        @@
   __  @
   \\ \\ @
    \\ \\@
 /\\_/ /@
 \\___/ @
       @@
       @
  /\\ /\\@
 / //_/@
/ __ \\ @
\\/  \\/ @
       @@
   __  @
  / /  @
 / /   @
/ /___ @
\\____/ @
       @@
        @
  /\\/\\  @
 /    \\ @
/ /\\/\\ \\@
\\/    \\/@
        @@
     __ @
  /\\ \\ \\@
 /  \\/ /@
/ /\\  / @
\\_\\ \\/  @
        @@
   ___ @
  /___\\@
 //  //@
/ \\_// @
\\___/  @
       @@
   ___ @
  / _ \\@
 / /_)/@
/ ___/ @
\\/     @
       @@
   ____ @
  /___ \\@
 //  / /@
/ \\_/ / @
\\___,_\\ @
        @@
   __  @
  /__\\ @
 / \\// @
/ _  \\ @
\\/ \\_/ @
       @@
 __    @
/ _\\   @
\\ \\    @
_\\ \\   @
\\__/   @
       @@
 _____ @
/__   \\@
  / /\\/@
 / /   @
 \\/    @
       @@
       @
 /\\ /\\ @
/ / \\ \\@
\\ \\_/ /@
 \\___/ @
       @@
         @
 /\\   /\\ @
 \\ \\ / / @
  \\ V /  @
   \\_/   @
         @@
 __    __ @
/ / /\\ \\ \\@
\\ \\/  \\/ /@
 \\  /\\  / @
  \\/  \\/  @
          @@
__  __@
\\ \\/ /@
 \\  / @
 /  \\ @
/_/\\_\\@
      @@
     @
/\\_/\\@
\\_ _/@
 / \\ @
 \\_/ @
     @@
 _____@
/ _  /@
\\// / @
 / //\\@
/____/@
      @@
 __ @
| _|@
| | @
| | @
| | @
|__|@@
__    @
\\ \\   @
 \\ \\  @
  \\ \\ @
   \\_\\@
      @@
 __ @
|_ |@
 | |@
 | |@
 | |@
|__|@@
    @
 /\\ @
|/\\|@
    @
    @
    @@
       @
       @
       @
       @
 _____ @
|_____|@@
 _ @
( )@
 \\|@
   @
   @
   @@
       @
  __ _ @
 / _\` |@
| (_| |@
 \\__,_|@
       @@
 _     @
| |__  @
| '_ \\ @
| |_) |@
|_.__/ @
       @@
      @
  ___ @
 / __|@
| (__ @
 \\___|@
      @@
     _ @
  __| |@
 / _\` |@
| (_| |@
 \\__,_|@
       @@
      @
  ___ @
 / _ \\@
|  __/@
 \\___|@
      @@
  __ @
 / _|@
| |_ @
|  _|@
|_|  @
     @@
       @
  __ _ @
 / _\` |@
| (_| |@
 \\__, |@
 |___/ @@
 _     @
| |__  @
| '_ \\ @
| | | |@
|_| |_|@
       @@
 _ @
(_)@
| |@
| |@
|_|@
   @@
   _ @
  (_)@
  | |@
  | |@
 _/ |@
|__/ @@
 _    @
| | __@
| |/ /@
|   < @
|_|\\_\\@
      @@
 _ @
| |@
| |@
| |@
|_|@
   @@
           @
 _ __ ___  @
| '_ \` _ \\ @
| | | | | |@
|_| |_| |_|@
           @@
       @
 _ __  @
| '_ \\ @
| | | |@
|_| |_|@
       @@
       @
  ___  @
 / _ \\ @
| (_) |@
 \\___/ @
       @@
       @
 _ __  @
| '_ \\ @
| |_) |@
| .__/ @
|_|    @@
       @
  __ _ @
 / _\` |@
| (_| |@
 \\__, |@
    |_|@@
      @
 _ __ @
| '__|@
| |   @
|_|   @
      @@
     @
 ___ @
/ __|@
\\__ \\@
|___/@
     @@
 _   @
| |_ @
| __|@
| |_ @
 \\__|@
     @@
       @
 _   _ @
| | | |@
| |_| |@
 \\__,_|@
       @@
       @
__   __@
\\ \\ / /@
 \\ V / @
  \\_/  @
       @@
          @
__      __@
\\ \\ /\\ / /@
 \\ V  V / @
  \\_/\\_/  @
          @@
      @
__  __@
\\ \\/ /@
 >  < @
/_/\\_\\@
      @@
       @
 _   _ @
| | | |@
| |_| |@
 \\__, |@
 |___/ @@
     @
 ____@
|_  /@
 / / @
/___|@
     @@
   __@
  / /@
 | | @
< <  @
 | | @
  \\_\\@@
 _ @
| |@
| |@
| |@
| |@
|_|@@
__   @
\\ \\  @
 | | @
  > >@
 | | @
/_/  @@
     @
 /\\/|@
|/\\/ @
     @
     @
     @@
 _   _ @
(_)_(_)@
 / _ \\ @
|  _  |@
|_| |_|@
       @@
 _   _ @
(_)_(_)@
 / _ \\ @
| |_| |@
 \\___/ @
       @@
 _   _ @
(_) (_)@
| | | |@
| |_| |@
 \\___/ @
       @@
 _   _ @
(_)_(_)@
 / _\` |@
| (_| |@
 \\__,_|@
       @@
 _   _ @
(_)_(_)@
 / _ \\ @
| (_) |@
 \\___/ @
       @@
 _   _ @
(_) (_)@
| | | |@
| |_| |@
 \\__,_|@
       @@
 ____ @
| __ \\@
| |/ /@
| |\\ \\@
|_||_/@
      @@
`;

const SLANT_FONT = `flf2a$ 6 5 16 15 10 0 18319
Slant by Glenn Chappell 3/93 -- based on Standard
Includes ISO Latin-1
figlet release 2.1 -- 12 Aug 1994
     $$@
    $$ @
   $$  @
  $$   @
 $$    @
$$     @@
    __@
   / /@
  / / @
 /_/  @
(_)   @
      @@
 _ _ @
( | )@
|/|/ @
 $   @
$    @
     @@
     __ __ @
  __/ // /_@
 /_  _  __/@
/_  _  __/ @
 /_//_/    @
           @@
     __@
   _/ /@
  / __/@
 (_  ) @
/  _/  @
/_/    @@
   _   __@
  (_)_/_/@
   _/_/  @
 _/_/_   @
/_/ (_)  @
         @@
   ___   @
  ( _ )  @
 / __ \\/|@
/ /_/  < @
\\____/\\/ @
         @@
  _ @
 ( )@
 |/ @
 $  @
$   @
    @@
     __@
   _/_/@
  / /  @
 / /   @
/ /    @
|_|    @@
     _ @
    | |@
    / /@
   / / @
 _/_/  @
/_/    @@
       @
  __/|_@
 |    /@
/_ __| @
 |/    @
       @@
       @
    __ @
 __/ /_@
/_  __/@
 /_/   @
       @@
   @
   @
   @
 _ @
( )@
|/ @@
       @
       @
 ______@
/_____/@
  $    @
       @@
   @
   @
   @
 _ @
(_)@
   @@
       __@
     _/_/@
   _/_/  @
 _/_/    @
/_/      @
         @@
   ____ @
  / __ \\@
 / / / /@
/ /_/ / @
\\____/  @
        @@
   ___@
  <  /@
  / / @
 / /  @
/_/   @
      @@
   ___ @
  |__ \\@
  __/ /@
 / __/ @
/____/ @
       @@
   _____@
  |__  /@
   /_ < @
 ___/ / @
/____/  @
        @@
   __ __@
  / // /@
 / // /_@
/__  __/@
  /_/   @
        @@
    ______@
   / ____/@
  /___ \\  @
 ____/ /  @
/_____/   @
          @@
   _____@
  / ___/@
 / __ \\ @
/ /_/ / @
\\____/  @
        @@
 _____@
/__  /@
  / / @
 / /  @
/_/   @
      @@
   ____ @
  ( __ )@
 / __  |@
/ /_/ / @
\\____/  @
        @@
   ____ @
  / __ \\@
 / /_/ /@
 \\__, / @
/____/  @
        @@
     @
   _ @
  (_)@
 _   @
(_)  @
     @@
     @
   _ @
  (_)@
 _   @
( )  @
|/   @@
  __@
 / /@
/ / @
\\ \\ @
 \\_\\@
    @@
       @
  _____@
 /____/@
/____/ @
  $    @
       @@
__  @
\\ \\ @
 \\ \\@
 / /@
/_/ @
    @@
  ___ @
 /__ \\@
  / _/@
 /_/  @
(_)   @
      @@
   ______ @
  / ____ \\@
 / / __ \`/@
/ / /_/ / @
\\ \\__,_/  @
 \\____/   @@
    ___ @
   /   |@
  / /| |@
 / ___ |@
/_/  |_|@
        @@
    ____ @
   / __ )@
  / __  |@
 / /_/ / @
/_____/  @
         @@
   ______@
  / ____/@
 / /     @
/ /___   @
\\____/   @
         @@
    ____ @
   / __ \\@
  / / / /@
 / /_/ / @
/_____/  @
         @@
    ______@
   / ____/@
  / __/   @
 / /___   @
/_____/   @
          @@
    ______@
   / ____/@
  / /_    @
 / __/    @
/_/       @
          @@
   ______@
  / ____/@
 / / __  @
/ /_/ /  @
\\____/   @
         @@
    __  __@
   / / / /@
  / /_/ / @
 / __  /  @
/_/ /_/   @
          @@
    ____@
   /  _/@
   / /  @
 _/ /   @
/___/   @
        @@
       __@
      / /@
 __  / / @
/ /_/ /  @
\\____/   @
         @@
    __ __@
   / //_/@
  / ,<   @
 / /| |  @
/_/ |_|  @
         @@
    __ @
   / / @
  / /  @
 / /___@
/_____/@
       @@
    __  ___@
   /  |/  /@
  / /|_/ / @
 / /  / /  @
/_/  /_/   @
           @@
    _   __@
   / | / /@
  /  |/ / @
 / /|  /  @
/_/ |_/   @
          @@
   ____ @
  / __ \\@
 / / / /@
/ /_/ / @
\\____/  @
        @@
    ____ @
   / __ \\@
  / /_/ /@
 / ____/ @
/_/      @
         @@
   ____ @
  / __ \\@
 / / / /@
/ /_/ / @
\\___\\_\\ @
        @@
    ____ @
   / __ \\@
  / /_/ /@
 / _, _/ @
/_/ |_|  @
         @@
   _____@
  / ___/@
  \\__ \\ @
 ___/ / @
/____/  @
        @@
  ______@
 /_  __/@
  / /   @
 / /    @
/_/     @
        @@
   __  __@
  / / / /@
 / / / / @
/ /_/ /  @
\\____/   @
         @@
 _    __@
| |  / /@
| | / / @
| |/ /  @
|___/   @
        @@
 _       __@
| |     / /@
| | /| / / @
| |/ |/ /  @
|__/|__/   @
           @@
   _  __@
  | |/ /@
  |   / @
 /   |  @
/_/|_|  @
        @@
__  __@
\\ \\/ /@
 \\  / @
 / /  @
/_/   @
      @@
 _____@
/__  /@
  / / @
 / /__@
/____/@
      @@
     ___@
    / _/@
   / /  @
  / /   @
 / /    @
/__/    @@
__    @
\\ \\   @
 \\ \\  @
  \\ \\ @
   \\_\\@
      @@
     ___@
    /  /@
    / / @
   / /  @
 _/ /   @
/__/    @@
  //|@
 |/||@
  $  @
 $   @
$    @
     @@
       @
       @
       @
       @
 ______@
/_____/@@
  _ @
 ( )@
  V @
 $  @
$   @
    @@
        @
  ____ _@
 / __ \`/@
/ /_/ / @
\\__,_/  @
        @@
    __  @
   / /_ @
  / __ \\@
 / /_/ /@
/_.___/ @
        @@
       @
  _____@
 / ___/@
/ /__  @
\\___/  @
       @@
       __@
  ____/ /@
 / __  / @
/ /_/ /  @
\\__,_/   @
         @@
      @
  ___ @
 / _ \\@
/  __/@
\\___/ @
      @@
    ____@
   / __/@
  / /_  @
 / __/  @
/_/     @
        @@
         @
   ____ _@
  / __ \`/@
 / /_/ / @
 \\__, /  @
/____/   @@
    __  @
   / /_ @
  / __ \\@
 / / / /@
/_/ /_/ @
        @@
    _ @
   (_)@
  / / @
 / /  @
/_/   @
      @@
       _ @
      (_)@
     / / @
    / /  @
 __/ /   @
/___/    @@
    __  @
   / /__@
  / //_/@
 / ,<   @
/_/|_|  @
        @@
    __@
   / /@
  / / @
 / /  @
/_/   @
      @@
            @
   ____ ___ @
  / __ \`__ \\@
 / / / / / /@
/_/ /_/ /_/ @
            @@
        @
   ____ @
  / __ \\@
 / / / /@
/_/ /_/ @
        @@
       @
  ____ @
 / __ \\@
/ /_/ /@
\\____/ @
       @@
         @
    ____ @
   / __ \\@
  / /_/ /@
 / .___/ @
/_/      @@
        @
  ____ _@
 / __ \`/@
/ /_/ / @
\\__, /  @
  /_/   @@
        @
   _____@
  / ___/@
 / /    @
/_/     @
        @@
        @
   _____@
  / ___/@
 (__  ) @
/____/  @
        @@
   __ @
  / /_@
 / __/@
/ /_  @
\\__/  @
      @@
        @
  __  __@
 / / / /@
/ /_/ / @
\\__,_/  @
        @@
       @
 _   __@
| | / /@
| |/ / @
|___/  @
       @@
          @
 _      __@
| | /| / /@
| |/ |/ / @
|__/|__/  @
          @@
        @
   _  __@
  | |/_/@
 _>  <  @
/_/|_|  @
        @@
         @
   __  __@
  / / / /@
 / /_/ / @
 \\__, /  @
/____/   @@
     @
 ____@
/_  /@
 / /_@
/___/@
     @@
     __@
   _/_/@
 _/_/  @
< <    @
/ /    @
\\_\\    @@
     __@
    / /@
   / / @
  / /  @
 / /   @
/_/    @@
     _ @
    | |@
    / /@
   _>_>@
 _/_/  @
/_/    @@
  /\\\\/@
 //\\/ @
  $   @
 $    @
$     @
      @@
    _  _ @
   (_)(_)@
  / _ |  @
 / __ |  @
/_/ |_|  @
         @@
   _   _ @
  (_)_(_)@
 / __ \\  @
/ /_/ /  @
\\____/   @
         @@
   _   _ @
  (_) (_)@
 / / / / @
/ /_/ /  @
\\____/   @
         @@
   _   _ @
  (_)_(_)@
 / __ \`/ @
/ /_/ /  @
\\__,_/   @
         @@
   _   _ @
  (_)_(_)@
 / __ \\  @
/ /_/ /  @
\\____/   @
         @@
   _   _ @
  (_) (_)@
 / / / / @
/ /_/ /  @
\\__,_/   @
         @@
     ____ @
    / __ \\@
   / / / /@
  / /_| | @
 / //__/  @
/_/       @@
`;

// ===== LOAD FIGLET FONTS =====
function loadFigletFonts() {
  if (fontsLoaded) return;
  
  try {
    figlet.parseFont('Ogre', OGRE_FONT);
    figlet.parseFont('Slant', SLANT_FONT);
    fontsLoaded = true;
    console.log('Figlet fonts loaded successfully');
  } catch (error) {
    console.error('Error parsing figlet fonts:', error);
    alert(`Error loading fonts: ${error.message}`);
  }
}

// ===== MODE SWITCHING =====
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

// ===== TEXT MODE COLOR HANDLERS =====
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

// ===== IMAGE MODE FUNCTIONS =====
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

function hexToRgb(hex) {
  if (!hex) return null;
  const m = hex.replace('#','');
  if (m.length !== 6) return null;
  const r = parseInt(m.substring(0,2),16);
  const g = parseInt(m.substring(2,4),16);
  const b = parseInt(m.substring(4,6),16);
  return { r, g, b };
}

// ===== TEXT TO ASCII CONVERSION =====
function textToAsciiOutline(text) {
  if (!fontsLoaded) {
    throw new Error('Fonts are still loading. Please wait a moment and try again.');
  }
  
  const fontName = textStyle === "italic" ? "Slant" : "Ogre";
  
  try {
    const ascii = figlet.textSync(text, {
      font: fontName,
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 80,
      whitespaceBreak: true
    });
    
    const asciiLines = ascii.split('\n');
    const cols = Math.max(...asciiLines.map(l => l.length));
    const rows = asciiLines.length;
    
    return { ascii, cols, rows };
  } catch (error) {
    console.error('Figlet error:', error);
    throw new Error(`Failed to convert text: ${error.message}`);
  }
}

async function convertTextToAscii() {
  const text = textInput.value.trim();
  
  if (!text) {
    alert("Please enter some text first.");
    return;
  }
  
  if (text.length > 15) {
    alert("Text is too long. Maximum 15 characters allowed.");
    return;
  }
  
  try {
    let { ascii, cols, rows } = textToAsciiOutline(text);
    
    lastAsciiText = ascii;
    colorMap = null;
    copyBtn.disabled = false;
    downloadPngBtn.disabled = false;
    
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
    
    const previewEl = document.querySelector('.preview');
    const defaultFS = 10;
    const fontFamily = "monospace";
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
    `;
    
    asciiOutput.textContent = ascii;
    previewEl.style.background = bgColor;
    
    const dpr = window.devicePixelRatio || 1;
    const cssW = cols * glyphW;
    const cssH = rows * defaultFS;
    
    asciiCanvas.width = Math.round(cssW * dpr);
    asciiCanvas.height = Math.round(cssH * dpr);
    
    const ctx = asciiCanvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cssW, cssH);
    ctx.font = `${defaultFS}px ${fontFamily}`;
    ctx.textBaseline = "top";
    ctx.fillStyle = textColor;
    
    const lines = ascii.split('\n');
    lines.forEach((line, y) => {
      ctx.fillText(line, 0, y * defaultFS);
    });
    
    lastAsciiMetrics = { cssWidth: cssW, cssHeight: cssH, dpr };
    
  } catch (err) {
    alert(err.message);
  }
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

// ===== EVENT LISTENERS =====
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

// ===== INITIALIZATION =====
window.addEventListener('load', () => {
  loadFigletFonts();
});

asciiOutput.textContent = "";