var pixel = function() {
  var matrix = [],
      canvas = null,
      ctx = null,
      drawing = false,
      action = "pixel",
      pixelSize = 20,
      size = 320,
      gridColor = "#eeeeee",
      showGrid = false,
      history = {
        undo: [],
        redo: []
      };
  
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
  
  var doAction = function(x, y, color) {
    if(drawing) {
      switch(action) {
        case "pixel":
          drawPixel(x, y, color);
          break;
        case "fill":
          fillPixels(x, y, color);
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

  var drawPixel = function(x, y, color) {
    matrix[pixelify(x)][pixelify(y)] = color;
    
    draw();
    drawGrid();
  }
  
  var getPixelColor = function(x, y) {
    var color = matrix[pixelify(x)][pixelify(y)];
    
    return "rgba(0, 0, 0, 0)" == color ? "#ffffff" : color;
  }
  
  var fillPixels = function(x, y, color) {
    var startColor = getPixelColor(x, y);
    
    var start = (new Date()).getTime();
    if(startColor != color) {
      fillPixel(x, y, startColor, color);
    }
    console.log("flood fill time: " + ((new Date()).getTime()-start));
    
    draw();
    drawGrid();
  }
  
  var fillPixel = function(x, y, startColor, endColor) {
    var color = getPixelColor(x, y);
    
    if(color == startColor && x > 0 && y > 0 && x < size && y < size) {
      matrix[pixelify(x)][pixelify(y)] = endColor;
      
      fillPixel(x+pixelSize, y, startColor, endColor);
      fillPixel(x-pixelSize, y, startColor, endColor);
      fillPixel(x, y+pixelSize, startColor, endColor);
      fillPixel(x, y-pixelSize, startColor, endColor);
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
  }
  
  return {
    init: init,
    clearCanvas: clearCanvas,
    setDraw: setDraw,
    setAction: setAction,
    doAction: doAction,
    getDataURL: getDataURL
  };
}();