// ===== STATE MANAGEMENT =====
const AppState = {
  canvasSize: 0,
  bgCnvs: null,
  cnvs: null,
  canvas: null,
  randomized: false,
  timeoutId: null,
  satValue: 70,
  briValue: 75,
  randOffset: 10,
  colorToggle: "white",
  colorNum: 1,
  addNoise: false
};

// ===== COLOR UTILITIES MODULE =====
const ColorUtils = {
  /**
   * Generates an array of random HSB colors based on provided parameters
   * @param {number} count - Number of colors to generate
   * @param {number} satValue - Base saturation value
   * @param {number} briValue - Base brightness value
   * @param {number} randOffset - Random offset for variation
   * @returns {Array} Array of p5.Color objects
   */
  generateRandomColors(count, satValue, briValue, randOffset) {
    const satMin = Math.max(0, satValue - randOffset);
    const satMax = satValue;
    const briMin = Math.max(0, briValue - randOffset);
    const briMax = briValue;

    return Array.from({ length: count }, () => {
      const h = MathUtils.cusrand(0, 360);
      const s = MathUtils.cusrand(satMin, satMax);
      const b = MathUtils.cusrand(briMin, briMax);
      return color(`hsb(${h}, ${s}%, ${b}%)`);
    });
  },

  /**
   * Adjusts color saturation and brightness
   * @param {p5.Color} inputColor - Input color to adjust
   * @param {number} sat - Saturation adjustment (negative to decrease)
   * @param {number} bri - Brightness adjustment (positive to increase)
   * @returns {p5.Color} Adjusted color
   */
  adjustColor(inputColor, sat, bri) {
    let h = hue(inputColor);
    let s = saturation(inputColor);
    let l = lightness(inputColor);

    let newSat = constrain(s - sat, 0, 100);
    let newBri = constrain(l + bri, 0, 100);

    colorMode(HSL);
    let newColor = color(h, newSat, newBri);
    return newColor;
  },

  /**
   * Converts HSL values to hexadecimal color string
   * @param {number} h - Hue (0-360)
   * @param {number} s - Saturation (0-100)
   * @param {number} l - Lightness (0-100)
   * @returns {string} Hex color string
   */
  HSLToHex(h, s, l) {
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
      m = l - c / 2,
      r = 0,
      g = 0,
      b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);

    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;

    return "#" + r + g + b;
  },

  /**
   * Converts HSL to RGB color values
   * @param {number} h - Hue (0-360)
   * @param {number} s - Saturation (0-100)
   * @param {number} l - Lightness (0-100)
   * @returns {Array} RGB values [r, g, b]
   */
  HSLToRGB(h, s, l) {
    s /= 100;
    l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [255 * f(0), 255 * f(8), 255 * f(4)];
  },

  /**
   * Converts RGB array to hexadecimal string
   * @param {Array} clr - RGB color array [r, g, b]
   * @returns {string} Hex color string
   */
  rgbToHex(clr) {
    const componentToHex = (c) => {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    };
    
    return "#" + componentToHex(clr[0]) + componentToHex(clr[1]) + componentToHex(clr[2]);
  }
};

// ===== MATH UTILITIES MODULE =====
const MathUtils = {
  /**
   * Returns a random element from an array
   * @param {Array} arr - Input array
   * @returns {*} Random element from array
   */
  randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  /**
   * Returns -1 or 1 randomly
   * @returns {number} -1 or 1
   */
  flip() {
    return Math.random() <= 0.5 ? -1 : 1;
  },

  /**
   * Returns one of two values randomly, or true/false if no arguments
   * @param {*} one - First option
   * @param {*} two - Second option
   * @returns {*} One of the options or boolean
   */
  half(one, two) {
    if (one == undefined || two == undefined) {
      return Math.random() >= 0.5;
    } else {
      return Math.random() <= 0.5 ? one : two;
    }
  },

  /**
   * Generates random integer between min and max, excluding values in arr
   * @param {number} min - Minimum value (inclusive)
   * @param {number} max - Maximum value (inclusive)
   * @param {Array} arr - Optional array of values to exclude
   * @returns {number} Random integer
   */
  cusrand(min, max, arr) {
    let result = Math.floor(Math.random() * (max - min + 1) + min);
    if (arr != undefined) {
      while (arr.includes(result)) {
        result = Math.floor(Math.random() * (max - min + 1) + min);
      }
    }
    return result;
  },

  /**
   * Generates random float between min and max
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random float
   */
  floatrand(min, max) {
    return Math.random() * (max - min) + min;
  }
};

// ===== CANVAS OPERATIONS MODULE =====
const CanvasOps = {
  /**
   * Updates canvas size based on container dimensions
   */
  updateCanvasSize() {
    let parentWidth = document.getElementById("canvas-container").offsetWidth;
    let parentHeight = document.getElementById("canvas-container").offsetHeight;

    let canvasWidth, canvasHeight;
    const aspectRatio = 600 / 400;

    if (window.innerWidth <= 768) {
      canvasWidth = min(parentWidth * 0.9, 600);
      canvasHeight = canvasWidth / aspectRatio;
    } else {
      if (parentWidth / parentHeight > aspectRatio) {
        canvasHeight = parentHeight * 0.8;
        canvasWidth = canvasHeight * aspectRatio;
      } else {
        canvasWidth = parentWidth * 0.8;
        canvasHeight = canvasWidth / aspectRatio;
      }
    }

    resizeCanvas(canvasWidth, canvasHeight);
  },

  /**
   * Draws the background on the canvas
   */
  drawBackground() {
    if (!AppState.cnvs) return;
    AppState.bgCnvs = createGraphics(AppState.cnvs.width, AppState.cnvs.height);
    AppState.bgCnvs.colorMode(HSL, 360, 100, 100);
    AppState.bgCnvs.noStroke();
    AppState.bgCnvs.fill(42, 75, 92);
    AppState.bgCnvs.rect(0, 0, AppState.bgCnvs.width, AppState.bgCnvs.height);
    AppState.cnvs.image(AppState.bgCnvs, 0, 0);
  },

  /**
   * Draws a rotated image while maintaining its center position
   * @param {p5.Image} img - The image to rotate and display
   * @param {number} x - X coordinate of the image center
   * @param {number} y - Y coordinate of the image center
   * @param {number} degrees - Rotation angle in degrees
   */
  drawRotatedImage(img, x, y, degrees) {
    if (!AppState.cnvs) return;
    AppState.cnvs.push();
    AppState.cnvs.translate(x + img.width / 2, y + img.height / 2);
    AppState.cnvs.rotate(radians(degrees));
    AppState.cnvs.imageMode(CENTER);
    AppState.cnvs.image(img, 0, 0);
    AppState.cnvs.pop();
  },

  /**
   * Applies noise overlay to the canvas
   * @param {p5.Graphics} canvasParam - Canvas to apply noise to
   */
  applyNoise(canvasParam) {
    let noiseCnvs = createGraphics(canvasParam.width, canvasParam.height);

    for (let x = canvasParam.width / 30; x < noiseCnvs.width; x++) {
      for (let y = canvasParam.height / 30; y < noiseCnvs.height; y++) {
        let gray = MathUtils.cusrand(0, 50);
        noiseCnvs.set(x, y, color(gray));
      }
    }

    noiseCnvs.updatePixels();
    canvasParam.blendMode(OVERLAY);
    canvasParam.image(noiseCnvs, -AppState.canvasSize / 40, -AppState.canvasSize / 40);
  },

  /**
   * Draws a frame around the canvas
   * @param {p5.Graphics} canvasParam - Canvas to frame
   */
  drawFrame(canvasParam) {
    canvasParam.strokeWeight(80);
    canvasParam.blendMode(NORMAL);
    canvasParam.colorMode(HSL, 360, 100, 100);
    canvasParam.stroke(42, 75, 92);
    canvasParam.noFill();
    canvasParam.rect(0, 0, canvasParam.width, canvasParam.height);
    canvasParam.colorMode(RGB);
  },

  /**
   * Fits a p5.Graphics object into the canvas while maintaining its aspect ratio
   * @param {p5.Graphics} graphics - The graphics object to display
   * @param {number} padding - Optional padding around the graphics (default: 0)
   */
  fitGraphicsToCanvas(graphics, padding = 0) {
    if (!graphics) return;

    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2;

    const graphicsRatio = graphics.width / graphics.height;
    const canvasRatio = availableWidth / availableHeight;

    let drawWidth, drawHeight;

    if (graphicsRatio > canvasRatio) {
      drawWidth = availableWidth;
      drawHeight = drawWidth / graphicsRatio;
    } else {
      drawHeight = availableHeight;
      drawWidth = drawHeight * graphicsRatio;
    }

    imageMode(CENTER);
    image(graphics, width / 2, height / 2, drawWidth, drawHeight);
  },

  /**
   * Saves the canvas to a file
   */
  saveCanvasToFile() {
    const togglePictureElement = document.getElementById("toggle-save");
    const originalSrc = togglePictureElement.src;
    const temporarySrc = "/img/diskette2.png";
    togglePictureElement.src = temporarySrc;

    const date = new Date();
    const timestamp = date.toISOString().replace(/[:.]/g, "-");
    const filename = `tissues-${timestamp}.jpg`;

    saveCanvas(AppState.cnvs, filename, "jpg");

    UIControls.showSaveFeedback();

    setTimeout(() => {
      togglePictureElement.src = originalSrc;
    }, 2000);
  }
};

// ===== UI CONTROLS MODULE =====
const UIControls = {

/**
 * Initializes custom number input controls with increment/decrement buttons
 */
initializeNumberInput() {
  const input = document.getElementById('colorNumber');
  const decrementBtn = document.getElementById('colorNumberDown');
  const incrementBtn = document.getElementById('colorNumberUp');
  
  input.value = 1;

  /**
   * Updates the input value within min/max constraints
   * @param {number} delta - Amount to change the value by
   */
  function updateValue(delta) {
    const currentValue = parseInt(input.value) || 1;
    const newValue = currentValue + delta;
    const min = parseInt(input.min) || 1;
    const max = parseInt(input.max) || 100;
    
    if (newValue >= min && newValue <= max) {
      input.value = newValue;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    updateButtonStates();
  }
  
  /**
   * Updates button disabled states based on current value
   */
  function updateButtonStates() {
    const value = parseInt(input.value) || 1;
    const min = parseInt(input.min) || 1;
    const max = parseInt(input.max) || 100;
    
    decrementBtn.disabled = value <= min;
    incrementBtn.disabled = value >= max;

    AppState.colorNum = value;
    drawCanvas();
  }
  
  // Button click handlers
  decrementBtn.addEventListener('click', () => updateValue(-1));
  incrementBtn.addEventListener('click', () => updateValue(1));
  
  // Update button states when input changes directly
  input.addEventListener('input', updateButtonStates);
  
  // Initialize button states
  updateButtonStates();
},


  /**
   * Initializes the color toggle control
   */
  initializeColorToggle() {
    const toggleBWSwitch = document.getElementById("colorToggleSwitch");
    const sliderBW = toggleBWSwitch.querySelector(".toggle-slider");

    toggleBWSwitch.addEventListener("click", () => {
      if (AppState.colorToggle === "white") {
        this.setColorValue("black", toggleBWSwitch, sliderBW);
      } else {
        this.setColorValue("white", toggleBWSwitch, sliderBW);
      }
      drawCanvas();
    });
  },

  /**
   * Sets the color toggle value
   * @param {string} value - "black" or "white"
   * @param {HTMLElement} toggleSwitch - Toggle switch element
   * @param {HTMLElement} slider - Slider element
   */
  setColorValue(value, toggleSwitch, slider) {
    AppState.colorToggle = value;

    if (value === "black") {
      toggleSwitch.classList.add("active");
      slider.textContent = "B";
    } else {
      toggleSwitch.classList.remove("active");
      slider.textContent = "W";
    }
  },

  /**
   * Sets up the color number selector
   */
  setupColorNumberSelector() {
    const colorNumberInput = document.getElementById("colorNumber");

    colorNumberInput.addEventListener("input", function () {
      UIControls.validateAndSetColorNumber(this.value);
    });

    colorNumberInput.addEventListener("blur", function () {
      UIControls.validateAndSetColorNumber(this.value);
    });
  },

  /**
   * Validates the color number input and updates the colorNum variable
   * @param {string} value - The input value to validate
   */
  validateAndSetColorNumber(value) {
    const colorNumberInput = document.getElementById("colorNumber");
    const numValue = parseInt(value);

    if (isNaN(numValue) || numValue < 1 || numValue > 100) {
      colorNumberInput.value = 1;
      AppState.colorNum = 1;
    } else {
      AppState.colorNum = numValue;
    }

    drawCanvas();
  },

  /**
   * Updates the randomized toggle state and related UI elements
   */
  updateRandomizedToggleState() {
    const toggleSwitch = document.getElementById("randomizedToggleSwitch");
    const slider = toggleSwitch.querySelector(".toolbar-toggle-slider");
    const saturationSlider = document.getElementById("slider1");
    const brightnessSlider = document.getElementById("slider2");
    const randomnessSlider = document.getElementById("slider3");
    const controlsContent = document.getElementById("controls-content");
    if (AppState.randomized) {
      toggleSwitch.classList.add("active");
      slider.textContent = "R";

      saturationSlider.disabled = false;
      brightnessSlider.disabled = false;
      randomnessSlider.disabled = false;

      saturationSlider.classList.remove("disabled-slider");
      brightnessSlider.classList.remove("disabled-slider");
      randomnessSlider.classList.remove("disabled-slider");

      saturationSlider.title = "Saturation";
      brightnessSlider.title = "Brightness";
    } else {
      controlsContent.style.display = "none";
      toggleSwitch.classList.remove("active");
      slider.textContent = "O";

      saturationSlider.disabled = true;
      brightnessSlider.disabled = true;
      randomnessSlider.disabled = true;

      saturationSlider.classList.add("disabled-slider");
      brightnessSlider.classList.add("disabled-slider");
      randomnessSlider.classList.add("disabled-slider");

      saturationSlider.title = "Available in random mode";
      brightnessSlider.title = "Available in random mode";

      
    }
  },

  /**
   * Shows save feedback message
   */
  showSaveFeedback() {
    const feedbackElement = document.createElement("div");
    feedbackElement.textContent = "Image saved!";
    feedbackElement.style.position = "fixed";
    feedbackElement.style.bottom = "20px";
    feedbackElement.style.right = "20px";
    feedbackElement.style.background = "rgba(0, 0, 0, 0.7)";
    feedbackElement.style.color = "white";
    feedbackElement.style.padding = "10px 20px";
    feedbackElement.style.borderRadius = "4px";
    feedbackElement.style.zIndex = "1000";

    document.body.appendChild(feedbackElement);

    setTimeout(() => {
      document.body.removeChild(feedbackElement);
    }, 2000);
  },

  /**
   * Resets all controls to original values
   */
  resetToOriginal() {
    AppState.addNoise = false;
    AppState.colorNum = 1;
    AppState.satValue = 70;
    AppState.briValue = 85;
    AppState.randOffset = 10;

    const checkbox = document.getElementById('textureOverlay');
    const colorNumber = document.getElementById('colorNumber');
    
    colorNumber.value = 1;
    checkbox.checked = false;

    const toggleBWSwitch = document.getElementById("colorToggleSwitch");
    const sliderBW = toggleBWSwitch.querySelector(".toggle-slider");
    this.setColorValue("white", toggleBWSwitch, sliderBW);
  },


toggleControlsMenu () {
      const controlsContent = document.getElementById("controls-content");
      if (controlsContent.style.display === "none" || controlsContent.style.display === "") {
        controlsContent.style.display = "block";
      } else {
        controlsContent.style.display = "none";
      }
    }

};

// ===== EVENT HANDLERS MODULE =====
const EventHandlers = {
  /**
   * Sets up all event handlers
   */
  setupEventHandlers() {
    this.setupControlsToggle();
    this.setupTextureCheckbox();
    this.setupRandomizedToggle();
    this.setupSliders();
    this.setupImageViewers();
    this.setupSaveButton();
    this.setupRefreshButton();
  },

  setupControlsToggle() {
    document.getElementById("toggle-controls").addEventListener("click", UIControls.toggleControlsMenu);
  },

  setupTextureCheckbox() {
    const checkbox = document.getElementById('textureOverlay');
    checkbox.checked = false;
    checkbox.addEventListener('change', function() {
      AppState.addNoise = checkbox.checked;
      drawCanvas();
    });
  },

  setupRandomizedToggle() {
    const toggleSwitch = document.getElementById("randomizedToggleSwitch");
    
    toggleSwitch.addEventListener("click", function () {

      AppState.randomized = !AppState.randomized;

      if (!AppState.randomized) {
        UIControls.resetToOriginal();
      }

      UIControls.updateRandomizedToggleState();
      drawCanvas();
    });
  },

  setupSliders() {
    const saturationSlider = document.getElementById("slider1");
    const brightnessSlider = document.getElementById("slider2");
    const randomnessSlider = document.getElementById("slider3");

    saturationSlider.value = AppState.satValue;
    brightnessSlider.value = AppState.briValue;
    randomnessSlider.value = AppState.randOffset;

    saturationSlider.addEventListener("input", function () {
      AppState.satValue = parseInt(this.value);
      drawCanvas();
    });

    brightnessSlider.addEventListener("change", function () {
      AppState.briValue = parseInt(this.value);
      drawCanvas();
    });

    randomnessSlider.addEventListener("input", function () {
      AppState.randOffset = parseInt(this.value);
      drawCanvas();
    });
  },

  setupImageViewers() {
    const toggleGlass = document.getElementById("toggle-glass");
    const togglePicture = document.getElementById("toggle-picture");
    const originalImageContainer = document.getElementById("original-image-container");

    const glassClicked = () => {
      if (originalImageContainer.style.display === "flex") {
        originalImageContainer.style.display = "none";
      } else {
        originalImageContainer.style.display = "flex";
      }
    };

    toggleGlass.addEventListener("click", glassClicked);
    togglePicture.addEventListener("click", glassClicked);

    originalImageContainer.addEventListener("click", function () {
      originalImageContainer.style.display = "none";
    });
  },

  setupSaveButton() {
    document.getElementById("toggle-save").addEventListener("click", CanvasOps.saveCanvasToFile);
  },

  setupRefreshButton() {
    document.getElementById("toggle-refresh").addEventListener("click", function () {
      this.classList.toggle("clicked");

      if (AppState.timeoutId) {
        clearTimeout(AppState.timeoutId);
      }

      AppState.timeoutId = setTimeout(() => {
        this.classList.remove("clicked");
        AppState.timeoutId = null;
      }, 500);

      drawCanvas();
    });
  }
};

// ===== MAIN DRAWING FUNCTION =====
function drawCanvas() {

  AppState.canvasSize = Math.min(window.innerWidth, window.innerHeight);
  
  AppState.canvasSize = AppState.canvasSize - AppState.canvasSize / 5;

  AppState.canvasSize = Math.floor(AppState.canvasSize / 251) * 251 * 1.5;

  if (AppState.cnvs == null) AppState.cnvs = createGraphics(1255, 1255);
  else {
    AppState.cnvs.clear();
  }

  if ( AppState.canvas == null) {
    AppState.canvas = createCanvas(AppState.canvasSize, AppState.canvasSize);
    AppState.canvas.parent("canvas-container");
  } else {
    AppState.canvas.clear();
  }

  CanvasOps.drawBackground();

  let rndClrs = ColorUtils.generateRandomColors(AppState.colorNum, AppState.satValue, AppState.briValue, AppState.randOffset);

  let canvases = [];
  let ofs = 30;
  let len = 230,
    hei = 550;

  let yOffset = -250,
    xOffset = -255,
    xDiff = 280,
    yDiff = 100;

  if (!AppState.randomized) {
    rndClrs[0] = color("#cf6d44");
  }

  for (let c = 0; c < AppState.colorNum; c++) {
    let colorCanvas = createGraphics(len, hei);
    colorCanvas.noStroke();

    for (let i = 0; i < 8; i++) {
      if (i > 0) {
        rndClrs[c] = ColorUtils.adjustColor(rndClrs[c], 0, 5.5);
      }

      if (i % 2 == 0) {
        colorCanvas.fill(rndClrs[c]);
      } else {
        colorCanvas.fill(AppState.colorToggle);
      }

      colorCanvas.rect(
        (i * ofs) / 2,
        (i * ofs) / 2,
        len - i * ofs,
        hei - i * ofs,
        200,
        200,
        0,
        0
      );
    }

    canvases.push(colorCanvas);
  }

  for (let h = 0; h < 10; h++) {
    for (let j = 0; j < 10; j++) {
      AppState.cnvs.image(
        random(canvases),
        xOffset + (j * len) / 1.65 + (j % 2 == 0 ? xDiff : 0),
        yOffset + (h * hei) / 2 + (j % 2 == 0 ? 0 : yDiff)
      );
    }
  }
  if (AppState.addNoise) {
    CanvasOps.applyNoise(AppState.cnvs);
  }

  CanvasOps.drawFrame(AppState.cnvs);

  CanvasOps.fitGraphicsToCanvas(AppState.cnvs);
}

// ===== INITIALIZATION =====
/**
 * p5.js setup function
 */
function setup() {
  drawCanvas();
}

/**
 * p5.js window resize handler
 */
function windowResized() {
  if (!params) {
    AppState.canvasSize = Math.min(window.innerWidth, window.innerHeight);
    resizeCanvas(AppState.canvasSize, AppState.canvasSize);
  }
}

/**
 * DOM content loaded handler
 */
document.addEventListener("DOMContentLoaded", function () {
  UIControls.initializeColorToggle();
  UIControls.setupColorNumberSelector();
  EventHandlers.setupEventHandlers();
  UIControls.updateRandomizedToggleState();
  UIControls.initializeNumberInput();
});

// ===== ARRAY PROTOTYPE EXTENSION =====
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};

// ===== GLOBAL ALIASES FOR BACKWARDS COMPATIBILITY =====
const generateRandomColors = ColorUtils.generateRandomColors;
const adjustColor = ColorUtils.adjustColor;
const drawBackground = CanvasOps.drawBackground;
const drawRotatedImage = CanvasOps.drawRotatedImage;
const applyNoise = CanvasOps.applyNoise;
const drawFrame = CanvasOps.drawFrame;
const fitGraphicsToCanvas = CanvasOps.fitGraphicsToCanvas;
const saveCanvasToFile = CanvasOps.saveCanvasToFile;
const resetToOriginal = UIControls.resetToOriginal;
const flip = MathUtils.flip;
const half = MathUtils.half;
const cusrand = MathUtils.cusrand;
const floatrand = MathUtils.floatrand;
const HSLToHex = ColorUtils.HSLToHex;
const HSLToRGB = ColorUtils.HSLToRGB;
const rgbToHex = ColorUtils.rgbToHex;