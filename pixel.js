// Pixel is a javascript pixel drawing library.

var PIXEL = function() {
  // Global constants.
  var TRANSPARENT = "rgba(0, 0, 0, 0)";
  
  // Global variables.
  var version         = '0.1',
      debug           = false,
      matrix          = [],
      frames          = [],
      animation       = null,
      currentFrame    = 0,
      /* NOTE: deprecated
      onionFrame   = null,
      */
      mainCanvas      = null,
      previewCanvases = [],
      drawing         = false,
      action          = "pixel",
      settings = {
        previewCanvas: {
          pixelSize: 1,
          size:      16,
          gridColor: "#eeeeee",
          showGrid:  false
        },
        mainCanvas: {
          pixelSize: 20,
          size:      320,
          gridColor: "#eeeeee",
          showGrid:  false
        }
      },
      history = {
        action:  [],
        undo:    [],
        oldUndo: [],
        redo:    []
      };
  
  // ## Canvas(canvas, settings)
  //
  // A canvas object.
  //
  // `canvas` a canvas element.<br/>
  // `settings` an object with settings to draw this canvas.
  function Canvas(canvas, settings) {
    // A canvas element.
    this.canvas = canvas;
    
    // Context element of `canvas`
    this.ctx = canvas.getContext("2d");
    
    // An object with canvas settings.
    //
    // Example settings:
    //
    //     {
    //       pixelSize: 1,
    //       size:      16,
    //       gridColor: "#eeeeee",
    //       showGrid:  false
    //     }
    this.settings = settings;
    
    // ## clearCanvas()
    //
    // Clears canvas.
    this.clearCanvas = function() {
      this.canvas.width = this.canvas.width;
    }
    
    // ## drawGrid()
    //
    // Draws canvas grid.
    this.drawGrid = function() {
      var correction = 0.5;

      if(this.settings.showGrid) {
        for (var x = correction+this.settings.pixelSize; x < this.settings.size; x += this.settings.pixelSize) {
          this.ctx.moveTo(x, 0);
          this.ctx.lineTo(x, this.settings.size);
          this.ctx.moveTo(0, x);
          this.ctx.lineTo(this.settings.size, x);
        }

        this.ctx.strokeStyle = this.settings.gridColor;
        this.ctx.stroke();
      }
    }
    
    // ## getDataURL()
    //
    // Returns canvas data url string as `image/png`.
    this.getDataURL = function() {
      return this.canvas.toDataURL("image/png");
    }
    
    // ## draw(m)
    //
    // Draws canvas using `m` as bitmap data.
    this.draw = function(m) {
      this.clearCanvas();

      /* NOTE: deprecated

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
      */

      for(var i = 0; i < m.length; i++) {
        for(var j = 0; j < m[i].length; j++) {
          this.ctx.fillStyle = m[i][j];
          this.ctx.fillRect(i*this.settings.pixelSize, j*this.settings.pixelSize, this.settings.pixelSize, this.settings.pixelSize);
        }
      }

      this.drawGrid();
    }
  }
  
  
  // ## init(mainCanvas, previewCanvases, debug)
  //
  // Initializes Pixel library.
  //
  // `mainCanvas` is a HTML5 canvas elements.<br/>
  // `previewCanvases` is an array of HTML5 canvas elements.<br/>
  // `debug` is a flag to override default debug settings.
  var init = function(aMainCanvas, aPreviewCanvases, aDebug) {
    mainCanvas = new Canvas(aMainCanvas, settings.mainCanvas);
    for(var i = 0; i < aPreviewCanvases.length; i++) {
      previewCanvases[i] = new Canvas(aPreviewCanvases[i], settings.previewCanvas);
    }
    typeof aDebug != 'undefined' ? debug = aDebug : null;
    
    initMatrix();
    initCanvas();
  }
  
  // ## initMatrix()
  //
  // Initializes matrix values to transparent.
  var initMatrix = function() {
    var length = settings.mainCanvas.size/settings.mainCanvas.pixelSize
    matrix = [];
    
    for(var i = 0; i < length; i++) {
      matrix.push(new Array(length));
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
  
  // ## clearCanvasAt(index)
  //
  // Clears canvas at `index`.
  var clearCanvasAt = function(index) {
    previewCanvases[index].clearCanvas();
    
    if(currentFrame == index) {
      mainCanvas.clearCanvas();
      frames[currentFrame] = null;
      initMatrix();
      initCanvas();
    }
  }
  
  // ## clearCanvas()
  //
  // Clears current frame canvas.
  var clearCanvas = function() {
    clearCanvasAt(currentFrame);
  }
  
  // ## removeFrame(index)
  //
  // Removes frame object from `frames` at `index`.
  var removeFrame = function(index) {
    frames.splice(index, 1);
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
      var coords = {
        x: pixelify(x, settings.mainCanvas.pixelSize),
        y: pixelify(y, settings.mainCanvas.pixelSize)
      }
      
      switch(action) {
        case "pixel":
          var startColor = drawPixel(coords.x, coords.y, color);
          
          if(startColor != false) {
            history.undo.push(function() {
              drawPixel(coords.x, coords.y, startColor);
            });

            history.action.push(function() {
              drawPixel(coords.x, coords.y, color);
            });
          }
          
          break;
          
        case "clearPixel":
          var startColor = drawPixel(coords.x, coords.y, TRANSPARENT);
          
          if(startColor != false) {
            history.undo.push(function() {
              drawPixel(coords.x, coords.y, startColor);
            });

            history.action.push(function() {
              drawPixel(coords.x, coords.y, TRANSPARENT);
            });
          }
          
          break;
          
        case "fill":
          var startMatrix = fillPixels(coords.x, coords.y, color);
          
          if(startColor != false) {
            history.undo.push(function() {
              draw(startMatrix);
            });

            history.action.push(function() {
              fillPixels(coords.x, coords.y, color)
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
  //
  // `val` a number.<br/>
  // `pixelSize` a number representing *pixel size in pixels*
  var pixelify = function(val, pixelSize) {
    var i = Math.floor(val/pixelSize);
    
    i >= matrix.length && (i = matrix.length-1);
    i <= 0 && (i = 0);
    
    return i;
  }

  // ## drawPixel(x, y, color)
  //
  // Draws pixel at (`x`, `y`) of `color`.
  var drawPixel = function(x, y, color) {
    var startColor = matrix[x][y];
    
    if(startColor != color) {
      matrix[x][y] = color;
      draw();
      
      return startColor;
    }
    
    return false;
  }
  
  // ## getColorAt(x, y)
  //
  // Returns color string at (`x`, `y`).
  //
  // Color string format:
  //
  //     /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/
  var getColorAt = function(x, y) {
    return TRANSPARENT == matrix[x][y] ? "#ffffff" : matrix[x][y];
  }
  
  // ## fillPixels(x, y, color)
  //
  // Fills pixels.
  var fillPixels = function(x, y, color) {
    var startColor = getColorAt(x, y);
    
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
  //
  // `x`<br/>
  // `y`<br/>
  // `startColor` a hex representation of starting color.<br/>
  // `endColor` a hex representation of target color.
  var fillPixel = function(x, y, startColor, endColor) {
    if(x >= 0 && x < matrix[0].length && y >= 0 && y < matrix.length) {
      if(getColorAt(x, y) == startColor) {
        matrix[x][y] = endColor;

        fillPixel(x+1, y, startColor, endColor);
        fillPixel(x-1, y, startColor, endColor);
        fillPixel(x, y+1, startColor, endColor);
        fillPixel(x, y-1, startColor, endColor);
      }
    }
  }
  
  // ## draw(m)
  //
  // Draws main canvas and preview canvas at `currentFrame` using `m` as matrix or
  // global `matrix` if `m` is `undefined`.
  var draw = function(m) {
    typeof m == 'undefined' ? m = matrix : matrix = copyMatrix(m);
    
    mainCanvas.clearCanvas();
    previewCanvases[currentFrame].clearCanvas();
    
    /* NOTE: deprecated
    
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
    */
    
    mainCanvas.draw(m);
    previewCanvases[currentFrame].draw(m);
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
  //
  // **Deprecation warning**
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
  //
  // **Deprecation warning**
  var setOnionFrame = function(frame) {
    onionFrame = frame;
    draw();
  }
  
  // ## getCurrentOnionFrameId()
  //
  // Returns current onion frame index.
  //
  // **Deprecation warning**
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
  
  // ## rotate()
  //
  // Rotates canvas left by 90 degrees.
  var rotate = function() {
    var startMatrix = copyMatrix(matrix),
        start = (new Date()).getTime();
    
    // For each column of pixels,
    for(var i = 0; i < matrix.length; i++) {
      // for each row of pixels,
      for(var j = 0; j < matrix[i].length; j++) {
        // swap each element to swap row with column.
        matrix[i][j] = startMatrix[matrix[i].length-1 - j][i];
      }
    }
    
    log("rotate time: " + ((new Date()).getTime()-start));
    
    draw();
    
    history.undo.push(function() {
      draw(startMatrix);
    });
  }
  
  // ## copyFrameAt(index)
  //
  // Copies frame at `index` to current frame.
  //
  // `index` an integer representing an index of `frames` array.
  var copyFrameAt = function(index) {
    var startMatrix = copyMatrix(matrix),
        start = (new Date()).getTime();
    
    matrix = copyMatrix(getFrame(index));
    
    log("copyFrameAt " + index + ": " + ((new Date()).getTime()-start));
    
    draw();
    
    history.undo.push(function() {
      draw(startMatrix);
    });
  }
  
  return {
    init: init,
    clearCanvasAt: clearCanvasAt,
    clearCanvas: clearCanvas,
    removeFrame: removeFrame,
    setDraw: setDraw,
    setAction: setAction,
    doAction: doAction,
    getHistory: getHistory,
    undo: undo,
    /* NOTE: deprecated
    redo: redo,
    */
    getFrame: getFrame,
    setCurrentFrame: setCurrentFrame,
    /* NOTE: deprecated
    setOnionFrame: setOnionFrame,
    getCurrentOnionFrameId: getCurrentOnionFrameId,
    */
    getCurrentFrame: getCurrentFrame,
    getCurrentFrameId: getCurrentFrameId,
    play: play,
    stop: stop,
    moveRight: moveRight,
    moveTop: moveTop,
    flipHorizontal: flipHorizontal,
    flipVertical: flipVertical,
    rotate: rotate,
    copyFrameAt: copyFrameAt,
    log: log
  };
}();