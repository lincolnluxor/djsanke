
var widgetsController = function() {

  var controller = {
    init: function() {

    },

    // type can be "record", "dial", "slider", "button", "switch", or "toggle"
    createWidget: function(sizeW, sizeV, type, options) {
      var controllerName = (type === 'switch' || type === 'toggle') ? 'buttonController' : type.toString() + 'Controller';
      if (typeof type !== 'undefined' && controllerName in window) {
        var controller = window[controllerName](sizeW, sizeV, type, options); // Call dynamic-named function.
        controller.type = 'widgetController';
        return controller;
      }
    }
  };

  controller.init();
  return controller;
};

var recordController = function(sizeW, sizeV, type, options) {
  var widget = new Image();
  widget.controller = {
    size: {width: 0, height: 0},
    centerX: 0,
    centerY: 0,
    radius: 0,

    value: false, // record player is off
    images: {'on': '', 'off': ''},

    init: function(sizeW, sizeV, type, options) {
      var self = this;

      self.size.width = sizeW;
      self.size.height = sizeV;

      self.centerX = self.size.width/2;
      self.centerY = self.size.height/2;
      self.radius = self.size.width/2; // Should be able to tell where in non-equal-distance box this circle sits. Dont rely on x width only.
    },

    updateValue: function(relCursorX, relCursorY) {
      var self = this;

      // Check if user is within clickable limits.
      if (!self.clickedWithinLimits(relCursorX, relCursorY)) { return false; } // User outside of clickable limits

      // User is within clickable limits, flip value and return new image.
      self.value = !self.value;
      return self.getImage();
    },

    clickedWithinLimits: function(relCursorX, relCursorY) {
      var self = this;
      return ( Math.pow((relCursorX - self.centerX), 2) + Math.pow((relCursorY - self.centerY), 2) < Math.pow(self.radius, 2) );
    },

    getImage: function() {
      var self = this;

      var img = new Image();
      img.src = (self.value === true) ? self.images.on : self.images.off;
      return img;
    }
  };

  widget.controller.init(sizeW, sizeV, type, options);
  return widget;
};

var dialController = function(sizeW, sizeV, type, options) {
  // var widget = new Image();
  var controller = {
    size: {width: 0, height: 0},

    // Used to determine the angle in which the dial is rotated.
    maxDialValue: 4,
    anglePerValue: 60,
    centerX: 0,
    centerY: 0,
    radius: 0,
    startDist: false, // Dist from center to point clicked.
    enableUpdates: false,

    value: 0, // The number the dial is set to.
    image: 'imgs/Dial.png',
    dialRotation: -120,
    prevImgObj: null,

    init: function(sizeW, sizeV, type, options) {
      var self = this;

      self.size.width = sizeW;
      self.size.height = sizeV;
      self.centerX = self.size.width/2;
      self.centerY = self.size.height/2;
      self.radius = self.size.width/2; // Should be able to tell where in non-equal-distance box this circle sits. Dont rely on x width only.
      // self.anglePerValue = (360 / self.maxDialValue);

      // Map option key/values to widget key/values
      for (var key in options) {
        self[key] = options[key];
      }
    },

    updateValue: function(active, relCursorX, relCursorY) {
      var self = this;
console.log('hello');
      // Mouseup detected and we want to turn off this widget.
      if (!active) {
        // Disable changing this value
        self.startX = 0;
        self.startY = 0;
        self.startDist = false;
        self.enableUpdates = false;
        console.log('disable update');
        return false;
      }
      // This widget is enabled OR widget not yet enabled but is within clickable limits
      else if (self.enableUpdates || (!self.enableUpdates && self.clickedWithinLimits(relCursorX, relCursorY))) {
        
        self.enableUpdates = true;
        if (self.startDist === false) {
          self.startX = relCursorX;
          self.startY = relCursorY;

          self.startDist = self.getDist(self.centerX, self.centerY, relCursorX, relCursorY);
          // If user clicks exactly on center, the getAngle method shits the bed.
          self.startDist = (self.startDist === 0) ? self.size.width/2 : self.startDist;

          console.log('initial enable update');
          return false; // we dont calc new image this iteration.
        }

        console.log('enable update');

        // Calculation based on triangle shown here with angles A, B, C and side a, b, c.
        // @see http://www.sparknotes.com/testprep/books/sat2/math2c/chapter9section9.rhtml
        var b = self.startDist;
        var a = self.getDist(self.startX, self.startY, relCursorX, relCursorY);
        var c = self.getDist(self.centerX, self.centerY, relCursorX, relCursorY);
        var angle = self.getAngle(c, b, a);

        // Figure out if it rounds up to next or down to prev value.
        var remainder = angle % self.anglePerValue;
        self.value = (remainder > (self.anglePerValue/2) ? Math.ceil(angle/self.anglePerValue) : Math.floor(angle/self.anglePerValue));
        self.rotation = (self.value * 60) -120;
      }
      return true;
    },

    clickedWithinLimits: function(relCursorX, relCursorY) {
      var self = this;
      return ( Math.pow((relCursorX - self.centerX), 2) + Math.pow((relCursorY - self.centerY), 2) < Math.pow(self.radius, 2) );
    },

    getImage: function() {
      var self = this;

      var img = new Image();
      img.src = self.image; //(self.value in self.images) ? self.images[self.value] : '';
      img.rotation = self.rotation;
      // img.width = self.size.width;
      // img.height = self.size.height;
      self.prevImgObj = img;
      return img;
    },

    /** Helper funcs **/
    getAngle: function(AB, BC, CA) {
      var cosX = (Math.pow(CA, 2) - Math.pow(AB, 2) - Math.pow(BC, 2)) / (-2 * AB * BC);
      return (Math.acos(cosX) * (180 / Math.PI)); // Math.acos(cosX) is in radians, so we convert to degrees and return that value.
    },

    getRadians: function(angleInDegrees) {
      return angleInDegrees / (180 / Math.PI);
    },

    getDist: function(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
    }
  };

  controller.init(sizeW, sizeV, type, options);
  return controller;
};

var sliderController = function(sizeW, sizeV, type, options) {
  var widget = new Image();
  widget.controller = {
    size: {width: 0, height: 0},
    start: false,
    enableUpdates: false,
    breakRanges: [],

    maxSliderValue: 3, // 0 - 3
    distPerValue: 0,

    value: 0, // The number the slider is set to.
    bckgndImg: 'imgs/FaderNotches_Vert.png',
    knobImg: 'imgs/Fader.png',
    knobRotation: 0,

    init: function(sizeW, sizeV, type, options) {
      var self = this;

      self.size.width = sizeW;
      self.size.height = sizeV;
      self.distPerValue = (100 / self.maxSliderValue);
      self.options = options;

      if ('orientation' in options && options.orientation === 'horizontal') {
        self.bckgndImg = 'imgs/FaderNotches_Hor.png';
        self.knobRotation = 90;
      }

      // Create a set of ranges in which we determine whare the slider moves to; ex position 0 or 1 or 2 or 3...
      var sizeVal = (self.options.orientation === 'horizontal') ? self.size.width : self.size.height;
      var divisionSize = sizeVal / self.maxSliderValue;
      for (var i = 0; i <= self.maxSliderValue; i++) {
        var unitDiv = (divisionSize * i);
        var lowLimit = Math.ceil(unitDiv - (divisionSize/2));
        var upperLimit = Math.floor(unitDiv + (divisionSize/2));

        self.breakRanges.push([lowLimit, upperLimit]);
      }
      // B/c (only in vertical orientation) higher pixels means the lower value
      if (self.options.orientation === 'vertical') { self.breakRanges.reverse(); }
    },

    updateValue: function(active, relCursorX, relCursorY) {
      var self = this;

      if (!active) {
        self.start = false;
        self.enableUpdates = false;
        return false;
      }
      // This widget is enabled OR widget not yet enabled but is within clickable limits
      else if (self.enableUpdates || (!self.enableUpdates && self.clickedWithinLimits(relCursorX, relCursorY))) {
        self.enableUpdates = true;

        var relCursor = (self.options.orientation === 'horizontal') ? relCursorX : relCursorY;
        if (self.start === false) { self.start = relCursor; }

        // Figure out if it rounds up to next or down to prev value.
        var getNewPosition = function(self, coord) {
          for (var i = 0; i < self.breakRanges.length; i++) {
            if (coord >= Math.min.apply(Math, self.breakRanges[i]) && coord <= Math.max.apply(Math, self.breakRanges[i])) {
              // found range in which coord exists.
              return i;
            }
          }
          console.log('Error detecting the new position of this slider.');
        };

        self.value = getNewPosition(self, relCursor);
        return self.getImage();
      }
    },

    getImage: function() {
      var self = this;

      // Background image
      var bgImg = new Image();
      bgImg.src = self.bckgndImg;

      // Slider image
      var knobImg = new Image();
      knobImg.src = self.knobImg;
      knobImg.setAttribute('rotation', self.knobRotation);
      knobImg.setAttribute('position', self.value);

      return [bgImg, knobImg];
    },

    clickedWithinLimits: function(relCursorX, relCursorY) {
      // Based off size W & H
      return true;
    },
  };

  widget.controller.init(sizeW, sizeV, type, options);
  return widget;
};

var buttonController = function(sizeW, sizeV, type, options) {
  var widget = new Image();
  widget.controller = {
    size: {width: 0, height: 0},
    // maxDims: {x: 0, y: 0},
    images: {on: '', off: ''},
    value: false,

    init: function(sizeW, sizeV, type, options) {
      var self = this;

      self.size.width = sizeW;
      self.size.height = sizeV;


      if (type === "switch") {
        self.images.on = 'imgs/Switch_Up.png';
        self.images.off = 'imgs/Switch_Down.png';
      }
      else if (type === "toggle") {
        self.images.on = 'imgs/Toggle_Left.png';
        self.images.off = 'imgs/Toggle_Right.png';
      }
      else {
        // Need button graphics
      }
    },

    updateValue: function(relCursorX, relCursorY) {
      var self = this;
      if (!self.clickedWithinLimits(relCursorX, relCursorY)) { return false; }

      self.value = !self.value;
      return self.getImage();
    },

    clickedWithinLimits: function(relCursorX, relCursorY) {
      var self = this;
      return ((relCursorX >= 0 && relCursorX <= self.size.width) && (relCursorY >= 0 && relCursorY <= self.size.height));
    },

    getImage: function() {
      var self = this;

      var img = new Image();
      img.src = (self.value === true) ? self.images.on : self.images.off;
      return img;
    }
  };

  widget.controller.init(sizeW, sizeV, type, options);
  return widget;
};