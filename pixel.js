// Pixel is a javascript pixel drawing library.

var PIXEL = function() {
  // Global constants.
  var TRANSPARENT = "rgba(0, 0, 0, 0)";
  
  // Global variables.
  var debug        = false,
      matrix       = [],
      frames       = [],
      animation    = null,
      currentFrame = 0,
      onionFrame   = null,
      canvas       = null,
      ctx          = null,
      drawing      = false,
      action       = "pixel",
      pixelSize    = 20,
      size         = 320,
      gridColor    = "#eeeeee",
      showGrid     = false,
      history = {
        action:  [],
        undo:    [],
        oldUndo: [],
        redo:    []
      };
  
  // ## init(canvas, debug)
  //
  // Initializes pixel library.
  //
  // `canvas` is a HTML5 canvas DOM element.<br/>
  // `debug` is a flag to override default debug settings.
  var init = function(aCanvas, aDebug) {
    canvas = aCanvas;
    ctx = aCanvas.getContext("2d");
    typeof aDebug != 'undefined' ? debug = aDebug : null;
    
    initMatrix();
    initCanvas();
  }
  
  // ## initMatrix()
  //
  // Initializes matrix values to transparent.
  var initMatrix = function() {
    matrix = [];
    
    for(var i = 0; i < size/pixelSize; i++) {
      matrix.push(new Array(size/pixelSize));
    }
    
    for(var i = 0; i < matrix.length; i++) {
      for(var j = 0; j < matrix[i].length; j++) {
        matrix[i][j] = TRANSPARENT;
      }
    }
  }
  
  // ## initCanvas()
  //
  // Initializes canvas and history.
  var initCanvas = function() {
    history = {
      action: [],
      undo: [],
      oldUndo: [],
      redo: []
    };
    
    draw();
  }
  
  // ## log(obj)
  //
  // Logs `obj` to `console` if `debug` flag is `true`.
  var log = function(obj) {
    debug && console.log([(new Date()).toString(), obj]);
  }
  
  // ## printMatrix(m)
  //
  // Returns a formatted string representing `m`, where `m` is a matrix composed by
  // an *array of arrays*.
  var printMatrix = function(m) {
    mString = "";
    
    for(var i = 0; i < m.length; i++) {
      for(var j = 0; j < m[i].length; j++) {
        mString += (TRANSPARENT == m[i][j] ? "0" : "X") + ", ";
      }
      
      mString += "\n";
    }
    
    return mString;
  }
  
  // ## setDraw(flag)
  //
  // Sets `drawing` attribute.
  var setDraw = function(wantToDraw) {
    drawing = wantToDraw;
  }
  
  // ## setAction(action)
  //
  // Sets `action` attribute.
  var setAction = function(wantedAction) {
    action = wantedAction;
  }
  
  // ## clearCanvas()
  //
  // Clears canvas.
  var clearCanvas = function() {
    canvas.width = canvas.width;
    frames[currentFrame] = null;
    initMatrix();
    initCanvas();
  }
  
  // ## copyMatrix(m)
  //
  // Returns an object copied from `m` matrix.
  var copyMatrix = function(m) {
    if(typeof m != 'undefined') {
      var copy = m.slice();

      for(var i = 0; i < m.length; i++) {
        copy[i] = m[i].slice();
      }

      return copy;
    }
  }
  
  // ## doAction(x, y, color)
  //
  // Executes `action` at (`x`, `y`) with `color`.
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
          var startColor = drawPixel(x, y, TRANSPARENT);
          
          if(startColor != false) {
            history.undo.push(function() {
              drawPixel(x, y, startColor);
            });

            history.action.push(function() {
              drawPixel(x, y, TRANSPARENT);
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
          log("unknown action:" + action);
      }
    }
  }
  
  // ## pixelify(val)
  //
  // Returns quantized value of `val` by `pixelSize`.
  var pixelify = function(val) {
    var i = Math.floor(val/pixelSize);
    
    i >= matrix.length && (i = matrix.length-1);
    i <= 0 && (i = 0);
    
    return i;
  }

  // ## drawPixel(x, y, color)
  //
  // Draws pixel at (`x`, `y`) of `color`.
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
  
  // ## getPixelColor(x, y)
  //
  // Returns color string at (`x`, `y`).
  //
  // Color string format:
  //
  //     /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/
  var getPixelColor = function(x, y) {
    var color = matrix[pixelify(x)][pixelify(y)];
    
    return TRANSPARENT == color ? "#ffffff" : color;
  }
  
  // ## fillPixels(x, y, color)
  //
  // Fills pixels.
  var fillPixels = function(x, y, color) {
    var startColor = getPixelColor(x, y);
    
    if(startColor != color) {
      var startMatrix = copyMatrix(matrix),
          start = (new Date()).getTime();
          
      fillPixel(x, y, startColor, color);
      log("flood fill time: " + ((new Date()).getTime()-start));

      draw();
      
      return startMatrix;
    }
    
    return false;
  }
  
  // ## fillPixel(x, y, startColor, endColor)
  //
  // Recursive part of `fillPixels` function.
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

  // ## drawGrid()
  //
  // Draws canvas grid.
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
  
  // ## getDataURL()
  //
  // Returns canvas data url string.
  var getDataURL = function() {
    return canvas.toDataURL("image/png");
  }
  
  // ## draw(m)
  //
  // Draws canvas using `m` as matrix or `matrix` if `m` is `undefined`.
  var draw = function(m) {
    canvas.width = canvas.width;
    
    if(typeof m == 'undefined') {
      m = matrix;
    }
    
    if(onionFrame != null && typeof frames[onionFrame] != 'undefined' && frames[onionFrame] != null) {
      for(var i = 0; i < frames[onionFrame].length; i++) {
        for(var j = 0; j < frames[onionFrame][i].length; j++) {
          c = frames[onionFrame][i][j];
          if(c != TRANSPARENT) {
            components = c.match(/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/);
            c = "rgba(" +
                new Number("0x" + components[1]) + ", " +
                new Number("0x" + components[2]) + ", " +
                new Number("0x" + components[3]) + ", 0.5)";
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
  
  // ## getHistory()
  //
  // Returns history object.
  var getHistory = function() {
    return history;
  }
  
  // ## undo()
  //
  // Undoes latest action.
  var undo = function() {
    if(history.undo.length > 0) {
      var todo = history.undo.pop();
      todo.call();
      history.redo.push(history.action.pop());
      history.oldUndo.push(todo);
    }
  }
  
  // ## redo()
  //
  // Viceversa of `undo()`.
  var redo = function() {
    if(history.redo.length > 0) {
      var todo = history.redo.pop();
      todo.call();
      history.undo.push(history.oldUndo.pop());
      history.action.push(todo);
    }
  }
  
  // ## getFrame(frame)
  //
  // Returns data matrix for frame at index `frame`.
  var getFrame = function(frame) {
    return currentFrame == frame ? matrix : frames[frame];
  }
  
  // ## getCurrentFrame()
  //
  // Returns current frame data matrix.
  var getCurrentFrame = function() {
    return matrix;
  }
  
  // ## getCurrentFrameId()
  //
  // Returns current frame id.
  var getCurrentFrameId = function() {
    return currentFrame;
  }
  
  // ## setCurrentFrame(frame)
  //
  // Sets current frame and matrix to object at index `frame`.
  var setCurrentFrame = function(frame) {
    log("setCurrentFrame: " + frame);
    
    if(frame != currentFrame) {
      frames[currentFrame] = copyMatrix(matrix);
      matrix = copyMatrix(frames[frame]);

      // a new frame
      if(typeof matrix == 'undefined') {
        // set current frame placeholder
        frames[frame] = null;
        // initialize matrix
        initMatrix();
      }
      
      currentFrame = frame;

      initCanvas();
      
      log("setCurrentFrame - frames.length: " + frames.length);
    }
  }
  
  // ## setOnionFrame(frame)
  //
  // Sets `frame` as onion frame and draws canvas.
  var setOnionFrame = function(frame) {
    onionFrame = frame;
    draw();
  }
  
  // ## getCurrentOnionFrameId()
  //
  // Returns current onion frame index.
  var getCurrentOnionFrameId = function() {
    return onionFrame;
  }
  
  // ## play(fps, callback)
  //
  // Plays animation at `fps` frames per second.
  //
  // At every frame redraw `callback` is called.
  var play = function(fps, callback) {
    if(frames.length > 1) {
      animation = setInterval(function() {
        activeFrame = (currentFrame+1)%frames.length;
        log([
          "play animation",
          "activeFrame: " + activeFrame,
          "currentFrame: " + currentFrame,
          "frames.length: " + frames.length
        ]);
        setCurrentFrame(activeFrame);
        callback(activeFrame);
      }, (1/fps)*1000);
    }
  }
  
  // ## stop()
  //
  // Stops animation.
  var stop = function() {
    clearInterval(animation);
    animation = null;
  }
  
  // ## moveTop()
  //
  // Moves canvas top by one pixel.
  var moveTop = function() {
    var startMatrix = copyMatrix(matrix),
        start = (new Date()).getTime();
    
    // For each column of pixels
    for(var i = 0; i < matrix.length; i++) {
      // push at beginning of column latest array element.
      matrix[i].push(matrix[i].shift());
    }
    
    log("move top time: " + ((new Date()).getTime()-start));
    
    draw();
    
    history.undo.push(function() {
      draw(startMatrix);
    });
  }
  
  // ## moveRight()
  //
  // Moves canvas right by one pixel.
  var moveRight = function() {
    var startMatrix = copyMatrix(matrix),
        start = (new Date()).getTime();
    
    // For each row of pixels:
    for(j = 0; j < matrix[0].length; j++) {
      // save latest row pixel to `temp` buffer,
      var temp = matrix[matrix.length-1][j];
      
      // shift elements by row,
      for(i = matrix.length - 1; i > 0; i--) {
        matrix[i][j] = matrix[i-1][j];
      }
      
      // set first row element as `temp`.
      matrix[0][j] = temp;
    }
    
    log("move right time: " + ((new Date()).getTime()-start));
    
    draw();
    
    history.undo.push(function() {
      draw(startMatrix);
    });
  }
  
  // ## flipVertical()
  //
  // Flips canvas vertically.
  var flipVertical = function() {
    var startMatrix = copyMatrix(matrix),
        start = (new Date()).getTime();
    
    // For each column of pixels,
    for(var i = 0; i < matrix.length; i++) {
      // for half of each row of pixels,
      for(var j = 0; j < matrix[i].length/2; j++) {
        var temp = matrix[i][j],
            length = matrix[i].length;
        
        // swap first half column with second half.
        matrix[i][j] = matrix[i][length-1-j];
        matrix[i][length-1-j] = temp;
      }
    }
    
    log("flip vertical time: " + ((new Date()).getTime()-start));
    
    draw();
    
    history.undo.push(function() {
      draw(startMatrix);
    });
  }
  
  // ## flipHorizontal()
  //
  // Flips canvas horizontally.
  var flipHorizontal = function() {
    var startMatrix = copyMatrix(matrix),
        start = (new Date()).getTime();
    
    // For half of each column of pixels,
    for(var i = 0; i < matrix.length/2; i++) {
      // for each row of pixels,
      for(var j = 0; j < matrix[i].length; j++) {
        var temp = matrix[i][j],
            length = matrix.length;

        // swap first half row with second half.
        matrix[i][j] = matrix[length-1-i][j];
        matrix[length-1-i][j] = temp;
      }
    }
    
    log("flip vertical time: " + ((new Date()).getTime()-start));
    
    draw();
    
    history.undo.push(function() {
      draw(startMatrix);
    });
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
    stop: stop,
    moveRight: moveRight,
    moveTop: moveTop,
    flipHorizontal: flipHorizontal,
    flipVertical: flipVertical,
    log: log
  };
}();