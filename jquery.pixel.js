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
        action: [],
        undo: [],
        oldUndo: [],
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
    history = {
      action: [],
      undo: [],
      oldUndo: [],
      redo: []
    };
    
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
  
  var copyMatrix = function() {
    var copy = matrix.slice();
    
    for(var i = 0; i < matrix.length; i++) {
      copy[i] = matrix[i].slice();
    }
    
    return copy;
  }
  
  var doAction = function(x, y, color) {
    if(drawing) {
      switch(action) {
        case "pixel":
          var startColor = drawPixel(x, y, color);
          
          if(startColor != false) {
            history.undo.push(function() {
              drawPixel(x, y, startColor);
            });

            history.action.push(function() {
              drawPixel(x, y, color);
            });
          }
          
          break;
        case "clearPixel":
          var transparent = "rgba(0, 0, 0, 0)",
              startColor = drawPixel(x, y, transparent);
          
          if(startColor != false) {
            history.undo.push(function() {
              drawPixel(x, y, startColor);
            });

            history.action.push(function() {
              drawPixel(x, y, transparent);
            });
          }
          break;
        case "fill":
          var startMatrix = fillPixels(x, y, color);
          
          if(startColor != false) {
            history.undo.push(function() {
              draw(startMatrix);
            });

            history.action.push(function() {
              fillPixels(x, y, color)
            });
          }
          
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
    var px = pixelify(x),
        py = pixelify(y),
        startColor = matrix[px][py];
    
    if(startColor != color) {
      matrix[px][py] = color;
      draw();
      drawGrid();
      
      return startColor;
    }
    
    return false;
  }
  
  var getPixelColor = function(x, y) {
    var color = matrix[pixelify(x)][pixelify(y)];
    
    return "rgba(0, 0, 0, 0)" == color ? "#ffffff" : color;
  }
  
  var fillPixels = function(x, y, color) {
    var startColor = getPixelColor(x, y);
    
    if(startColor != color) {
      var startMatrix = copyMatrix(matrix),
          start = (new Date()).getTime();
          
      fillPixel(x, y, startColor, color);
      console.log("flood fill time: " + ((new Date()).getTime()-start));

      draw();
      drawGrid();
      
      return startMatrix;
    }
    
    return false;
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
  
  var draw = function(m) {
    canvas.width = canvas.width;
    
    if(typeof m == 'undefined') {
      m = matrix;
    }
    
    for(var i = 0; i < m.length; i++) {
      for(var j = 0; j < m[i].length; j++) {
        ctx.fillStyle = matrix[i][j] = m[i][j];
        ctx.fillRect(i*pixelSize, j*pixelSize, pixelSize, pixelSize);
      }
    }
  }
  
  var getHistory = function() {
    return history;
  }
  
  var undo = function() {
    if(history.undo.length > 0) {
      var todo = history.undo.pop();
      todo.call();
      history.redo.push(history.action.pop());
      history.oldUndo.push(todo);
    }
  }
  
  var redo = function() {
    if(history.redo.length > 0) {
      var todo = history.redo.pop();
      todo.call();
      history.undo.push(history.oldUndo.pop());
      history.action.push(todo);
    }
  }
  
  return {
    init: init,
    clearCanvas: clearCanvas,
    setDraw: setDraw,
    setAction: setAction,
    doAction: doAction,
    getDataURL: getDataURL,
    getHistory: getHistory,
    undo: undo,
    redo: redo
  };
}();