var pixel = function() {
  var canvas = null,
      ctx = null,
      draw = false,
      action = "pixel",
      pixelSize = 20,
      pixelColor = "#00ff00",
      size = 320,
      gridColor = "#eeeeee",
      showGrid = false;
  
  var init = function(aCanvas) {
    canvas = aCanvas;
    ctx = aCanvas.getContext("2d");
    
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
    draw = wantToDraw;
  }
  
  var setAction = function(wantedAction) {
    action = wantedAction;
  }
  
  var clearCanvas = function() {
    canvas.width = canvas.width;
    initCanvas();
  }
  
  var doAction = function(x, y) {
    if(draw) {
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
  
  var pad = function(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    
    return str;
  }
  
  var pixelify = function(val) {
    return Math.floor(val/pixelSize)*pixelSize;
  }
  
  var fillRect = function(x, y) {
    ctx.fillRect(pixelify(x), pixelify(y), pixelSize, pixelSize);
  }

  var drawPixel = function(x, y) {
    fillRect(x, y);
    drawGrid();
  }
  
  var getPixelColor = function(x, y) {
    var pixelData = ctx.getImageData(x, y, 1, 1).data,
        color = "";
    
    for(var i = 0; i < 3; i++) {
      color += pad(pixelData[i].toString(16), 2);
    }
    
    return "#" + color;
  }
  
  var fillPixels = function(x, y) {
    var color = getPixelColor(x, y);
    
    var start = (new Date()).getTime();
    if(color != pixelColor) {
      fillPixel(x, y, color);
    }
    console.log("flood fill time: " + ((new Date()).getTime()-start));
    
    drawGrid();
  }
  
  var fillPixel = function(x, y, startColor) {
    var color = getPixelColor(x, y);
    //console.log([color, x, y]);
    
    if(color == startColor && x > 0 && y > 0 && x < size && y < size) {
      fillRect(x, y);
      
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
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fillRect(0, 0, size, size);
  }
  
  var getDataURL = function() {
    return canvas.toDataURL("image/png");
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