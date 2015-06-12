
var widgetsController = function() {

  var controller = {
    // type can be "record", "dial", "slider", or "button"
    createWidget: function(sizeX, sizeY, type) {
      var controllerName = type.toString() + 'Controller';
      if (typeof type !== 'undefined' && controllerName in window) { return window[controllerName](sizeX, sizeY); } // Call dynamic-named function.
    }
  };

  controller.init();
  return controller;
};

var recordController = function(sizeX, sizeY) {
  var image: false,
  var size: {x: 0, y: 0},

  var value: false, // record player is off
  var images: {'on': '', 'off': ''},

  var controller = {
    init: function(sizeX, sizeY) {
      var self = this;

      self.size.x = sizeX;
      self.size.y = sizeY;
    },

    updateValue: function(relCusrsorX, relCusrsorY) {
      var self = this;

      // Check if user is within clickable limits.
      if (!clickedWithinLimits(relCusrsorX, relCusrsorY)) { return false; } // User outside of clickable limits

      // User is within clickable limits, flip value and return new image.
      self.value = !self.value;
      return self.getImage();
    },

    clickedWithinLimits: function(relCusrsorX, relCusrsorY) {
      var self = this;

      var centerX = self.size.x/2;
      var centerY = self.size.y/2;
      var radius = self.size.x/2; // Should be able to tell where in non-equal-distance box this circle sits. Dont rely on x width only.

      return ( Math.pow((relCusrsorX - centerX), 2) + Math.pow((relCusrsorY - centerY), 2) < Math.pow(radius, 2) );
    },

    getImage: function() {
      var img = new Image();
      img.src = (self.value === true) ? self.images.on : self.images.off;
      return img;
    }
  };

  controller.init();
  return controller;
};

var dialController = function(sizeX, sizeY) {
  var size: {x: 0, y: 0},

  // Used to determine the angle in which the dial is rotated.
  var maxDialValue: 10,
  var anglePerValue: (360 / this.maxDialValue),
  var centerX: 0,
  var centerY: 0,
  var radius: 0,
  var startDist: false, // Dist from center to point clicked.
  var enableUpdates: false,

  var value: 0, // The number the dial is set to.
  var images = [
    '',
    '',
    '',
    '',
    '',
    ''
  ],

  var controller = {
    init: function(sizeX, sizeY) {
      var self = this;

      self.size.x = sizeX;
      self.size.y = sizeY;
      self.centerX = self.size.x/2;
      self.centerY = self.size.y/2;
      self.radius = self.size.x/2; // Should be able to tell where in non-equal-distance box this circle sits. Dont rely on x width only.
    },

    updateValue: function(relCusrsorX, relCusrsorY) {
      if ((typeof relCusrsorX === 'undefined' || typeof relCusrsorY === 'undefined') || (!sel.enableUpdates && !clickedWithinLimits(relCusrsorX, relCusrsorY))) {
        // Disable changing this value
        self.startX = 0,
        self.startY = 0,
        self.startDist = false;
        return false;
      }
      else if (self.startDist === false) {
        self.startX = relCusrsorX,
        self.startY = relCusrsorY,
        self.startDist = getDist(self.centerX, self.centerY, relCusrsorX, relCusrsorY);
      }

      // Calculation based on triangle shown here with angles A, B, C and side a, b, c.
      // @see http://www.sparknotes.com/testprep/books/sat2/math2c/chapter9section9.rhtml
      var b = self.startDist;
      var a = getDist(self.startX, self.startY, relCusrsorX, relCusrsorY);
      var c = Math.sqrt(Math.pow(b, 2) + Math.pow(a, 2));
      var angle = getAngle(b, a, c);

      // Figure out if it rounds up to next or down to prev value.
      var remainder = angle % anglePerValue;
      self.value = (remainder > (anglePerValue/2) ? Math.ceil(angle/anglePerValue) : Math.floor(angle/anglePerValue));
      return self.getImage();
    },

    clickedWithinLimits: function(relCusrsorX, relCusrsorY) {
      return ( Math.pow((relCusrsorX - self.centerX), 2) + Math.pow((relCusrsorY - self.centerY), 2) < Math.pow(radius, 2) );
    },

    getImage: function() {
      var img = new Image();
      img.src = (self.value in self.images) ? self.images[self.value] : '';
      return img;
    },

    /** Helper funcs **/
    getAngle: function(AB, BC, CA) {
      var cosX = (Math.pow(CA, 2) - Math.pow(AB, 2) - Math.pow(BC, 2)) / (-2 * AB * BC);
      return (Math.acos(cosX) * (180 / Math.PI)); // Math.acos(cosX) is in radians, so we convert to degrees and return that value.
    },

    getDist: function(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
    }
  };

  controller.init();
  return controller;
};

var sliderController = function(sizeX, sizeY) {
  var size: {x: 0, y: 0},
  var startY: false,

  var maxSliderValue: 10,
  var distPerValue: (100 / this.maxDialValue),

  var value: 0, // The number the slider is set to.
  var images = [
    '',
    '',
    '',
    '',
    '',
    ''
  ],

  var controller = {
    init: function(sizeX, sizeY) {
      var self = this;

      self.size.x = sizeX;
      self.size.y = sizeY;
    },

    updateValue: function(relCusrsorX, relCusrsorY) {
      if ((typeof relCusrsorX === 'undefined' || typeof relCusrsorY === 'undefined') || (!sel.enableUpdates && !clickedWithinLimits(relCusrsorX, relCusrsorY))) {
        self.startY = false;
        return false;
      }

      if (self.startY === false) { self.startY = relCusrsorY; }

    },

    clickedWithinLimits: function(relCusrsorX, relCusrsorY) {
      return true;
    },
  };

  controller.init();
  return controller;
};

var buttonController = function(sizeX, sizeY) {
  var size: {x: 0, y: 0},
  var maxDims: {x: 50, y: 100},
  var images: {'on': '', 'off': ''},
  var value: false,

  var controller = {
    init: function(sizeX, sizeY) {
      var self = this;

      self.size.x = sizeX;
      self.size.y = sizeY;
    },

    updateValue: function(relCusrsorX, relCusrsorY) {
      var self = this;
      if (!clickedWithinLimits(relCusrsorX, relCusrsorY)) { return false; }

      self.value = !self.value;
      return self.getImage();
    },

    clickedWithinLimits: function(relCusrsorX, relCusrsorY) {
      var self = this;
      return ((relCusrsorX >= 0 && relCusrsorX <= self.maxDims.x) && (relCusrsorY >= 0 && relCusrsorY <= self.maxDims.y));
    },

    getImage: function() {
      var img = new Image();
      img.src = (self.value === true) ? self.images.on : self.images.off;
      return img;
    }
  };

  controller.init();
  return controller;
};