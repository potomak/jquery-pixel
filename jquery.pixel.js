var pixel = function() {
  var matrix = [],
      canvas = null,
      ctx = null,
      drawing = false,
      action = "pixel",
      pixelSize = 20,
      pixelColor = "#00ff00",
      size = 320,
      gridColor = "#eeeeee",
      showGrid = false;
  
  var init = function(aCanvas) {
    canvas = aCanvas;
    ctx = aCanvas.getContext("2d");
    
    for(var i = 0; i < size/pixelSize; i++) {
      matrix.push(new Array(size/pixelSize));
    }
    
    initCanvas();
  }
  
  var initCanvas = function() {
    drawBackground();
    drawGrid();
    setPixelStyle(pixelColor);
  }
  
  var setPixelStyle = function(color) {
    pixelColor = color;
    ctx.fillStyle = pixelColor;
  }
  
  var setDraw = function(wantToDraw) {
    drawing = wantToDraw;
  }
  
  var setAction = function(wantedAction) {
    action = wantedAction;
  }
  
  var clearCanvas = function() {
    canvas.width = canvas.width;
    initCanvas();
  }
  
  var doAction = function(x, y) {
    if(drawing) {
      switch(action) {
        case "pixel":
          drawPixel(x, y);
          break;
        case "fill":
          fillPixels(x, y);
          break;
        default:
          console.log("unknown action:" + action);
      }
    }
  }
  
  var pixelify = function(val) {
    var i = Math.floor(val/pixelSize);
    
    i >= matrix.length && (i = matrix.length-1);
    i <= 0 && (i = 0);
    
    return i;
  }

  var drawPixel = function(x, y) {
    matrix[pixelify(x)][pixelify(y)] = pixelColor;
    
    draw();
    drawGrid();
  }
  
  var getPixelColor = function(x, y) {
    var pixelData = matrix[pixelify(x)][pixelify(y)];
    
    return "rgba(0, 0, 0, 0)" == pixelData ? "#ffffff" : pixelData;
  }
  
  var fillPixels = function(x, y) {
    var color = getPixelColor(x, y);
    
    var start = (new Date()).getTime();
    if(color != pixelColor) {
      fillPixel(x, y, color);
    }
    console.log("flood fill time: " + ((new Date()).getTime()-start));
    
    draw();
    drawGrid();
  }
  
  var fillPixel = function(x, y, startColor) {
    var color = getPixelColor(x, y);
    
    if(color == startColor && x > 0 && y > 0 && x < size && y < size) {
      matrix[pixelify(x)][pixelify(y)] = pixelColor;
      
      fillPixel(x+pixelSize, y, startColor);
      fillPixel(x-pixelSize, y, startColor);
      fillPixel(x, y+pixelSize, startColor);
      fillPixel(x, y-pixelSize, startColor);
    }
  }

  var drawGrid = function() {
    var correction = 0.5;
    
    if(showGrid) {
      for (var x = correction+pixelSize; x < size; x += pixelSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, size);
      }

      for (var y = correction+pixelSize; y < size; y += pixelSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(size, y);
      }

      ctx.strokeStyle = gridColor;
      ctx.stroke();
    }
  }
  
  var drawBackground = function() {
    for(var i = 0; i < matrix.length; i++) {
      for(var j = 0; j < matrix[i].length; j++) {
        matrix[i][j] = "rgba(0, 0, 0, 0)";
      }
    }
    
    draw();
  }
  
  var getDataURL = function() {
    return canvas.toDataURL("image/png");
  }
  
  var draw = function() {
    canvas.width = canvas.width;
    
    for(var i = 0; i < matrix.length; i++) {
      for(var j = 0; j < matrix[i].length; j++) {
        ctx.fillStyle = matrix[i][j];
        ctx.fillRect(i*pixelSize, j*pixelSize, pixelSize, pixelSize);
      }
    }
    
    // reset to current fill style
    ctx.fillStyle = pixelColor;
  }
  
  return {
    init: init,
    clearCanvas: clearCanvas,
    setDraw: setDraw,
    setAction: setAction,
    setPixelStyle: setPixelStyle,
    doAction: doAction,
    getDataURL: getDataURL
  };
}();