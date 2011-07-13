var pixel = function() {
  var matrix = [],
      frames = [],
      animation = null,
      currentFrame = 0,
      onionFrame = null,
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
    
    initMatrix();
    initCanvas();
  }
  
  var initMatrix = function() {
    matrix = [];
    
    for(var i = 0; i < size/pixelSize; i++) {
      matrix.push(new Array(size/pixelSize));
    }
    
    for(var i = 0; i < matrix.length; i++) {
      for(var j = 0; j < matrix[i].length; j++) {
        matrix[i][j] = "rgba(0, 0, 0, 0)";
      }
    }
  }
  
  var initCanvas = function() {
    history = {
      action: [],
      undo: [],
      oldUndo: [],
      redo: []
    };
    
    draw();
  }
  
  var setDraw = function(wantToDraw) {
    drawing = wantToDraw;
  }
  
  var setAction = function(wantedAction) {
    action = wantedAction;
  }
  
  var clearCanvas = function() {
    canvas.width = canvas.width;
    frames[currentFrame] = null;
    initMatrix();
    initCanvas();
  }
  
  var copyMatrix = function(m) {
    if(typeof m != 'undefined') {
      var copy = m.slice();

      for(var i = 0; i < m.length; i++) {
        copy[i] = m[i].slice();
      }

      return copy;
    }
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
  
  var getDataURL = function() {
    return canvas.toDataURL("image/png");
  }
  
  var draw = function(m) {
    canvas.width = canvas.width;
    
    if(typeof m == 'undefined') {
      m = matrix;
    }
    
    if(onionFrame != null && typeof frames[onionFrame] != 'undefined' && frames[onionFrame] != null) {
      for(var i = 0; i < frames[onionFrame].length; i++) {
        for(var j = 0; j < frames[onionFrame][i].length; j++) {
          c = frames[onionFrame][i][j];
          if(c != "rgba(0, 0, 0, 0)") {
            components = c.match(/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/);
            c = "rgba(" + new Number("0x" + components[1]) + ", " + new Number("0x" + components[2]) + ", " + new Number("0x" + components[3]) + ", 0.5)";
          }
          ctx.fillStyle = c;
          ctx.fillRect(i*pixelSize, j*pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    for(var i = 0; i < m.length; i++) {
      for(var j = 0; j < m[i].length; j++) {
        ctx.fillStyle = matrix[i][j] = m[i][j];
        ctx.fillRect(i*pixelSize, j*pixelSize, pixelSize, pixelSize);
      }
    }
    
    drawGrid();
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
  
  var getFrame = function(frame) {
    return currentFrame == frame ? matrix : frames[frame];
  }
  
  var getCurrentFrame = function() {
    return matrix;
  }
  
  var getCurrentFrameId = function() {
    return currentFrame;
  }
  
  var setCurrentFrame = function(frame) {
    if(frame != currentFrame) {
      frames[currentFrame] = copyMatrix(matrix);
      matrix = copyMatrix(frames[frame]);

      // initialize matrix
      typeof matrix == 'undefined' && initMatrix();
      
      currentFrame = frame;

      initCanvas();
    }
  }
  
  var setOnionFrame = function(frame) {
    onionFrame = frame;
    draw();
  }
  
  var getCurrentOnionFrameId = function() {
    return onionFrame;
  }
  
  var play = function(fps, callback) {
    if(frames.length > 1) {
      animation = setInterval(function() {
        activeFrame = (currentFrame+1)%frames.length;
        setCurrentFrame(activeFrame);
        callback(activeFrame);
      }, (1/fps)*1000);
    }
  }
  
  var stop = function() {
    clearInterval(animation);
    animation = null;
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
    redo: redo,
    getFrame: getFrame,
    setCurrentFrame: setCurrentFrame,
    setOnionFrame: setOnionFrame,
    getCurrentOnionFrameId: getCurrentOnionFrameId,
    getCurrentFrame: getCurrentFrame,
    getCurrentFrameId: getCurrentFrameId,
    play: play,
    stop: stop
  };
}();