
let canvasSize;

let bgCnvs;

let cnvs; 

let canvas;

let randomized = "nonrandom";

let timeoutId;

let satValue = 65;
let briValue = 90;

let randOffset = 10;

document.getElementById('toggle-controls').addEventListener('click', function() {
  const controlsContent = document.getElementById('controls-content');
  if (controlsContent.style.display === 'none' || controlsContent.style.display === '') {
    controlsContent.style.display = 'block';
  } else {
    controlsContent.style.display = 'none';
  }
});


document.addEventListener('DOMContentLoaded', function() {

  const originalRadio = document.getElementById('option1');
  const randomizedRadio = document.getElementById('option2');

  originalRadio.checked = true;
  randomizedRadio.checked = false;
  const saturationSlider = document.getElementById('slider1');
  const brightnessSlider = document.getElementById('slider2');
  const randomnessSlider = document.getElementById('slider3');

  const radioButtons = document.querySelectorAll('input[name="options"]');
  
  
  radioButtons.forEach(radio => {
    
  radio.addEventListener('change', function(event) {
    randomized = event.target.value;
    drawCanvas();

  });
  });

  const toggleGlass = document.getElementById('toggle-glass');
  const togglePicture = document.getElementById('toggle-picture');
  const originalImageContainer = document.getElementById('original-image-container');




  toggleGlass.addEventListener('click', glassClicked);
  togglePicture.addEventListener('click', glassClicked);
  
  function glassClicked() {
    
if (originalImageContainer.style.display === 'flex') {
      originalImageContainer.style.display = 'none';
    } else {
      originalImageContainer.style.display = 'flex';
    }
   
  }

  originalImageContainer.addEventListener('click', function() {
    originalImageContainer.style.display = 'none';
  });

  function updateSliderStates() {
    if (originalRadio.checked) {
      // Disable sliders when "Original colors" is selected
      saturationSlider.disabled = true;
      brightnessSlider.disabled = true;
      randomnessSlider.disabled = true;

      saturationSlider.title = "Available in random mode";
      brightnessSlider.title = "Available in random mode";

      // Optional: Add a visual class for additional styling
      saturationSlider.classList.add('disabled-slider');
      brightnessSlider.classList.add('disabled-slider');
      randomnessSlider.classList.add('disabled-slider');
    } else {
      // Enable sliders when "Randomized colors" is selected


      saturationSlider.title = "Saturation";
      brightnessSlider.title = "Brightness";


      saturationSlider.disabled = false;
      brightnessSlider.disabled = false;
      randomnessSlider.disabled = false;
      
      // Optional: Remove the visual class
      saturationSlider.classList.remove('disabled-slider');
      brightnessSlider.classList.remove('disabled-slider');
      randomnessSlider.classList.remove('disabled-slider');
    }
  }

  saturationSlider.value = satValue;
  brightnessSlider.value = briValue;
  randomnessSlider.value = randOffset;

  saturationSlider.addEventListener('input', function() {
    satValue = parseInt(this.value);

    drawCanvas();
    
  });

originalRadio.addEventListener('change', updateSliderStates);
  randomizedRadio.addEventListener('change', updateSliderStates);

  updateSliderStates();

  
  randomnessSlider.addEventListener('input', function() {
    randOffset = parseInt(this.value);
    console.log(randOffset);
    drawCanvas();
    
  });

  
  brightnessSlider.addEventListener('change', function() {
    briValue = parseInt(this.value);

    drawCanvas();

  });





  });

  document.getElementById('toggle-save').addEventListener('click', saveCanvasToFile);



  function saveCanvasToFile() {


    const togglePictureElement = document.getElementById("toggle-save");
    const originalSrc = togglePictureElement.src; 
    const temporarySrc = "/img/diskette2.png";
    togglePictureElement.src = temporarySrc;
  
  
    const date = new Date();
    const timestamp = date.toISOString().replace(/[:.]/g, '-');
    
    const filename = `tissues-${timestamp}.jpg`;
    
    saveCanvas(cnvs, filename, 'jpg');
    
    const feedbackElement = document.createElement('div');
    feedbackElement.textContent = 'Image saved!';
    feedbackElement.style.position = 'fixed';
    feedbackElement.style.bottom = '20px';
    feedbackElement.style.right = '20px';
    feedbackElement.style.background = 'rgba(0, 0, 0, 0.7)';
    feedbackElement.style.color = 'white';
    feedbackElement.style.padding = '10px 20px';
    feedbackElement.style.borderRadius = '4px';
    feedbackElement.style.zIndex = '1000';
    
    document.body.appendChild(feedbackElement);
    
    setTimeout(() => {
      document.body.removeChild(feedbackElement);
      togglePictureElement.src = originalSrc;
    }, 2000);

         }
  

  document.getElementById('toggle-refresh').addEventListener('click', function() {
    this.classList.toggle('clicked');

    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      this.classList.remove('clicked');
      timeoutId = null;
    }, 500);

    drawCanvas();
  });


  const generateRandomColors = (count, satValue, briValue, randOffset) => {
    // Calculate saturation and brightness ranges once
    const satMin = Math.max(0, satValue - randOffset);
    const satMax = satValue;
    const briMin = Math.max(0, briValue - randOffset);
    const briMax = briValue;
    

    // Use Array.from with a mapping function instead of push in a loop
    return Array.from({ length: count }, () => {
      const h = cusrand(0, 360);
      const s = cusrand(satMin, satMax);
      const b = cusrand(briMin, briMax);
      
      return color(`hsb(${h}, ${s}%, ${b}%)`);
    });
  };
  




function updateCanvasSize() {
  let parentWidth = document.getElementById('canvas-container').offsetWidth;
  let parentHeight = document.getElementById('canvas-container').offsetHeight;
  
  // Calculate appropriate canvas size while maintaining aspect ratio
  let canvasWidth, canvasHeight;
  const aspectRatio = 600 / 400; // Original aspect ratio
  
  if (window.innerWidth <= 768) {
    // Mobile view
    canvasWidth = min(parentWidth * 0.9, 600);
    canvasHeight = canvasWidth / aspectRatio;
  } else {
    // Desktop view
    if (parentWidth / parentHeight > aspectRatio) {
      // Container is wider than canvas aspect ratio
      canvasHeight = parentHeight * 0.8;
      canvasWidth = canvasHeight * aspectRatio;
    } else {
      // Container is taller than canvas aspect ratio
      canvasWidth = parentWidth * 0.8;
      canvasHeight = canvasWidth / aspectRatio;
    }
  }
  
  // Resize the canvas
  resizeCanvas(canvasWidth, canvasHeight);
}


function drawCanvas() {
  params = getURLParams();
  if (params.cnvsSize) {
    canvasSize = int(params.cnvsSize);  
  } else {
    canvasSize = Math.min(window.innerWidth, window.innerHeight);
  }

  canvasSize = canvasSize - canvasSize / 5;


  canvasSize = (Math.floor(canvasSize / 251) * 251) * 1.5;

if (typeof cnvs === "undefined")
  cnvs = createGraphics(1255, 1255);
else {
  cnvs.clear();
}
  

if (typeof canvas === "undefined"){
  canvas = createCanvas(canvasSize, canvasSize);
  canvas.parent("canvas-container")
}else {
  canvas.clear();
}
  
 
  
  drawBackground();


let rndClrs = generateRandomColors(4, satValue, briValue, randOffset);


  


  fitGraphicsToCanvas(cnvs)



}



function setup() {
 drawCanvas();
}




/**
 * Fits a p5.Graphics object into the canvas while maintaining its aspect ratio
 * @param {p5.Graphics} graphics - The graphics object to display
 * @param {number} padding - Optional padding around the graphics (default: 0)
 */
function fitGraphicsToCanvas(graphics, padding = 0) {
  if (!graphics) return;
  
  // Calculate available space
  const availableWidth = width - (padding * 2);
  const availableHeight = height - (padding * 2);
  
  // Calculate aspect ratios
  const graphicsRatio = graphics.width / graphics.height;
  const canvasRatio = availableWidth / availableHeight;
  
  let drawWidth, drawHeight;
  
  // Determine which dimension constrains the graphics
  if (graphicsRatio > canvasRatio) {
    // Graphics is wider than canvas (relative to height)
    drawWidth = availableWidth;
    drawHeight = drawWidth / graphicsRatio;
  } else {
    // Graphics is taller than canvas (relative to width)
    drawHeight = availableHeight;
    drawWidth = drawHeight * graphicsRatio;
  }
  
  // Draw the graphics centered in the canvas
  imageMode(CENTER);
  image(graphics, width/2, height/2, drawWidth, drawHeight);
}

function drawBackground() {

bgCnvs = createGraphics(cnvs.width, cnvs.height)
bgCnvs.colorMode(HSL, 360, 100, 100)
bgCnvs.noStroke()
bgCnvs.fill(42, 75, 92)
bgCnvs.rect(0, 0, bgCnvs.width, bgCnvs.height)
cnvs.image(bgCnvs, 0, 0)

}

/**
 * Draws a rotated image while maintaining its center position
 * @param {p5.Image} img - The image to rotate and display
 * @param {number} x - X coordinate of the image center
 * @param {number} y - Y coordinate of the image center
 * @param {number} degrees - Rotation angle in degrees
 */
function drawRotatedImage(img, x, y, degrees) {
  cnvs.push(); // Save the current transformation state
  
  
  // Move to the desired position
  cnvs.translate(x+img.width/2, y+img.height/2);
  
  // Convert degrees to radians and rotate
  cnvs.rotate(radians(degrees));
  
  // Draw the image with its center at the origin (0,0)
  // since we've already translated to the desired position
  cnvs.imageMode(CENTER);
  cnvs.image(img,  0, 0);
  
  cnvs.pop(); // Restore the previous transformation state
}

function applyNoise() {

  let noiseCnvs = createGraphics(canvasSize, canvasSize)

  for (let x = canvasSize /10 ; x < noiseCnvs.width; x++) {
    for (let y = canvasSize / 10; y < noiseCnvs.height; y++) {
      let gray = cusrand(120, 200);
      noiseCnvs.set(x, y, color(gray));
    }
  }

  noiseCnvs.updatePixels();

  blendMode(OVERLAY)

  image(noiseCnvs, -canvasSize/20, -canvasSize/20)
}


















function windowResized() {
  
  if (!params) {
    
    canvasSize = Math.min(window.innerWidth, window.innerHeight);
    resizeCanvas(canvasSize, canvasSize);
  }
}


Array.prototype.random = function () {
  return this[Math.floor((Math.random() * this.length))];
}

function flip() {
  return Math.random() <= 0.5? -1 : 1;
}

function half(one, two) {
  if (one == undefined || two == undefined) {
    if (Math.random() < 0.5)
      return false;
    else
      return true;
  }
  else {
    if (Math.random() <= 0.5)
      return one;
    else
      return two;
  }
}

function cusrand(min, max, arr) {
  let result = Math.floor(Math.random() * (max - min + 1) + min);
  if (arr != undefined) {
    while (arr.includes(result)) {
      result = Math.floor(Math.random() * (max - min + 1) + min);
    }
  }
  return result;
}
function floatrand(min, max) {
  return Math.random() * (max - min) + min;
}

function HSLToHex(h, s, l) {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs((h / 60) % 2 - 1)),
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


  if (r.length == 1)
    r = "0" + r;
  if (g.length == 1)
    g = "0" + g;
  if (b.length == 1)
    b = "0" + b;

  return "#" + r + g + b;
}

const HSLToRGB = (h, s, l) => {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
};

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(clr) {
  return "#" + componentToHex(clr[0]) + componentToHex(clr[1]) + componentToHex(clr[2]);
}



