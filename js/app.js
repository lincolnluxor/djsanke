//Controlling the games state
var app = (function() {
  var api = {};
  var canvas = document.getElementById('game');
  var ctx = canvas.getContext ("2d");
  var CANVAS_WIDTH = 320;
  var CANVAS_HEIGHT = 480;
  var FPS = 30;
  var canvasLeft = canvas.offsetLeft;
  var canvasTop = canvas.offsetTop;
  var elements = [];
  var GAME_STATES = [
    'splash',
    'game',
    'leaderboard',
    'levelup',
    'gameover',
    'transition'];
  var CURR_STATE = GAME_STATES[0];
  var NEW_STATE;
  var LAST_STATE;
  var currTime;
  var lastTime;
  var timer = [30,20,10,7];
  var level;
  var actions = 0;
  var score;
  var now, dt,
      last = timestamp();
  var fpsmeter = new FPSMeter({ decimals: 0, graph: true, theme: 'dark', left: '340px', right: '5px' }); //for devel. shows FPS on screen.
  var transPos = 0;
  var lastCanvas;
  var controls = [];
  var controlList = [{
      'name': 'switch0',
      'label': 'FEEDBACK',
      'text': '',
      'instructions': 'CHANGE FEEDBACK'
  }];
  var activeControl;

  var withinElementBounds = function(element, clickX, clickY) {
    return (clickY > element.top && clickY < element.top + element.height && clickX > element.left && clickX < element.left + element.width);
  };

  var getCursorPosition = function(e) {
    return {x: e.pageX - canvasLeft, y: e.pageY - canvasTop};
  };

  //Click listener
  var mouseIsDown = false;
  canvas.addEventListener('mouseup',function(e) {
    mouseIsDown = false;

    var clickX = getCursorPosition(e).x;
    var clickY = getCursorPosition(e).y;
//    console.log('x: '+clickX+' y: '+clickY); //for devel. shows click location in game
    elements.forEach(function(element) {
      if (withinElementBounds(element, clickX, clickY) === true && ('action' in element)) { element.action(false, clickX, clickY); }
    });
  });

  canvas.addEventListener('mousedown',function(e) {
    mouseIsDown = true;

    var clickX = getCursorPosition(e).x;
    var clickY = getCursorPosition(e).y;
//    console.log('x: '+clickX+' y: '+clickY); //for devel. shows click location in game
    elements.forEach(function(element) {
      if (withinElementBounds(element, clickX, clickY) === true && ('action' in element)) {
        element.action(true, clickX, clickY);
      }
    });
  });

  canvas.addEventListener('mousemove',function(e) {
    var clickX = getCursorPosition(e).x;
    var clickY = getCursorPosition(e).y;

    elements.forEach(function(element) {
      if (mouseIsDown === true && ('action' in element)) {
        element.action(true, clickX, clickY);
      }
    });
  });

  //timing
  function timestamp() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
  }

  //game loop
  function frame(running) {
    fpsmeter.tickStart();
    now = timestamp();
    dt = Math.min(1, (now - last) / 1000);   // duration capped at 1.0 seconds
    update(dt);
    last = now;
    requestAnimationFrame(frame);
    fpsmeter.tick();
  }
  //start loop
  requestAnimationFrame(frame);

  //check to see if images are loaded
  function setAssetReady() {
    this.ready = true;
  }

  //loop through elements array and paint to ctx
  function drawElements(elements) {
    elements.forEach(function(element) {
      ctx.drawImage(element, element.left, element.top);
    });
  }

  function drawText(controls) {
    controls.forEach(function(control) {
      controlList.forEach(function(controlItem) {
        if (control.name == controlItem.name) {
          ctx.font = '20px VT323';
          ctx.fillStyle = '#000';
          ctx.fillText(controlItem.label, control.textTop, control.textLeft);
          if (control.active) {
            ctx.fillStyle = '#fff';
            ctx.fillText(controlItem.instructions,160-(ctx.measureText(controlItem.instructions).width/2),130);
          }
        }
      });
    });
  }

  //update state of the game
  function update(dt) {
    ctx.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
    if (CURR_STATE !== LAST_STATE) {
      elements = [];
      var load = CURR_STATE + 'Load';
      api[load]();
      LAST_STATE = CURR_STATE;
    }
    var run = CURR_STATE + 'Run';
    api[run](dt,elements);
  }

  function getUpdatedElements(elements) {
    for (var i = 0; i < elements.length; i++) {
      if ('controllerID' in elements[i]) {
        elements[i] = api.widgetsControllers[api.getControllerIndex(elements[i].controllerID)].getImage();
      }
    }
    return elements;
  }

  //Home screen before run
  api.splashLoad = function() {
    level = 0; //reset levels
    score = 0; //reset score

    var splashImg = new Image();
    splashImg.ready = false;
    splashImg.onload = setAssetReady;
    splashImg.src = 'imgs/Sanke_Start.png';
    splashImg.left = 0;
    splashImg.top = 0;
    splashImg.name = 'splashImg';
    splashImg.action = function() {
      CURR_STATE = GAME_STATES[1];
    };
    elements.push(splashImg);

    return elements;
  };

  //Home screen running
  api.splashRun = function(dt,elements) {
    drawElements(elements);
  };

  //Game loading
  api.widgetsControllers = [];
  api.getControllerIndex = function(id) {
    for (var i = 0; i < api.widgetsControllers.length; i++) {
      if (api.widgetsControllers[i].options.controllerID === id) {
        return i;
      }
    }
    return -1;
  };

  api.gameLoad = function() {
    var headerImg = new Image();
    headerImg.ready = false;
    headerImg.onload = setAssetReady;
    headerImg.src = 'imgs/BG_Club.gif';
    headerImg.left = 0;
    headerImg.top = 0;
    headerImg.name = 'headerImg';
    elements.push(headerImg);




    //for devel. this will be replaced with all of the individual components
    var widgets = [
      {type: "switch", width: 100, height: 100},
      {type: "toggle", width: 100, height: 100},
      {type: "button", width: 100, height: 100}
    ]; //"record", "dial", "slider", "button", "switch", "toggle"]
    wc = widgetsController();
    var widgetAction = function(active, clickX, clickY) {
      //check here to see if they clicked or moved correctly
      var index = api.getControllerIndex(this.controllerID);
      if (index === -1 || api.widgetsControllers[index].updateValue(active, clickX, clickY) === false) { return; }

      if (active) {
        //update timer
        lastTime = parseInt(new Date().getTime()/getBarSpeed());

        //Increment actions
        actions += 1;

        //Update score
        score = score + (320 + api.findElementProp('timeBarImg','left') + (level * 4));

        //Check to see if requirements are met to move to next level
        if (actions > 10) {
          lastCanvas = ctx.getImageData(0,0,320,480);
          NEW_STATE = GAME_STATES[3];
          CURR_STATE = GAME_STATES[5];
        }
      }
    };
    activeControl = Math.floor(Math.random() * widgets.length);
    for (var i = 0; i < widgets.length; i++) {
      var options = {};
      options.name = widgets[i].type + i;
      options.ready = false;
      options.onload = setAssetReady;
      options.left = (i * widgets[i].width);
      options.top = 180;
      options.action = widgetAction;
      options.textTop = 5;
      options.textLeft = 175;
      options.controllerID = new Date().getTime();
      if (i === activeControl) {
        options.active = true;
      }

      var widget = wc.createWidget(widgets[i].width, widgets[i].height, widgets[i].type, options);
      api.widgetsControllers.push(widget);
      elements.push(widget.getImage());
      controls.push(options);
      // }
    }

    // var hudImg = new Image();
    // hudImg.ready = false;
    // hudImg.onload = setAssetReady;
    // hudImg.src = 'imgs/HUD.png';
    // hudImg.left = 0;
    // hudImg.top = 152;
    // hudImg.name = 'hudImg';
    // hudImg.action = function() {
    //   //check here to see if they clicked or moved correctly
    //   if (Math.round(Math.random()) === 0) { return false; }

    //   //update timer
    //   lastTime = parseInt(new Date().getTime()/getBarSpeed());

    //   //Increment actions
    //   actions += 1;

    //   //Update score
    //   score = score + (320 + api.findElementProp('timeBarImg','left') + (level * 4));

    //   //Check to see if requirements are met to move to next level
    //   if (actions > 10) {
    //     CURR_STATE = GAME_STATES[3];
    //   }
    // };
    // elements.push(hudImg);




    var timeBarImg = new Image();
    timeBarImg.ready = false;
    timeBarImg.onload = setAssetReady;
    timeBarImg.src = 'imgs/bar.jpg';
    timeBarImg.left = 0;
    timeBarImg.top = 139;
    timeBarImg.name = 'timeBarImg';
    elements.push(timeBarImg);

    lastTime = parseInt(new Date().getTime()/getBarSpeed());
  };

  //Game running
  api.gameRun = function(time) {
    currTime = parseInt(new Date().getTime()/getBarSpeed());
    api.updateElement('timeBarImg','left',lastTime - currTime);

    // Update our widgets
    elements = getUpdatedElements(elements);

    //Check to see if they ran out of time
    if (lastTime - currTime > -320) {
      drawElements(elements);
      drawText(controls);
      ctx.font = '48px VT323';
      ctx.fillStyle = '#fff';
      ctx.fillText(level+1, 10, 40);
      ctx.font = '22px VT323';
      ctx.fillText(score,320-ctx.measureText(score).width-10,16);
    } else {
      CURR_STATE = GAME_STATES[4];
    }
  };

  //used to update an object properties in the elements array
  api.updateElement = function(name, prop, value) {
    elements.forEach(function(element) {
      if (element.name === name) {
        element[prop] = value;
      }
    });
  };

  //find a property value of an element
  api.findElementProp = function(name, prop) {
    var elProp;
    elements.forEach(function(element) {
      if (element.name === name) {
        elProp = element[prop];
      }
    });
    return elProp;
  };

  //how fast the timer runs... don't ask me to give you a seconds
  function getBarSpeed() {
    if (level > 3) {
      barSpeed = timer[3];
    } else {
      barSpeed = timer[level];
    }
    return barSpeed;
  }

  //need to reset the board, so levelup is required
  api.levelupLoad = function() {
    level += 1;
    actions = 0;

//    var levelUpImg = new Image();
//    levelUpImg.ready = false;
//    levelUpImg.onload = setAssetReady;
//    levelUpImg.src = 'imgs/splash2.jpg';
//    levelUpImg.left = 0;
//    levelUpImg.top = 0;
//    levelUpImg.name = 'gameOverImg';
//    levelUpImg.action = function(){
//      CURR_STATE = GAME_STATES[1];
//    };
//    elements.push(levelUpImg);
    
    var transTopImg = new Image();
    transTopImg.ready = false;
    transTopImg.onload = setAssetReady;
    transTopImg.src = 'imgs/transition.png';
    transTopImg.left = 0;
    transTopImg.top = 0;
    transTopImg.name = 'transTopImg';
    transTopImg.action = function() {
      CURR_STATE = GAME_STATES[1];
    };
    elements.push(transTopImg);

    var transBottomImg = new Image();
    transBottomImg.ready = false;
    transBottomImg.onload = setAssetReady;
    transBottomImg.src = 'imgs/Turntable.png';
    transBottomImg.left = 0;
    transBottomImg.top = 240;
    transBottomImg.name = 'transBottomImg';
    transBottomImg.action = function() {
      CURR_STATE = GAME_STATES[1];
    };
    elements.push(transBottomImg);
  };

  //reset the board
  api.levelupRun = function() {
    drawElements(elements);
    ctx.font = '44px VT323';
    ctx.fillStyle = '#fff';
    ctx.fillText('LEVEL ' + level + ' COMPLETE', 160 - (ctx.measureText('LEVEL ' + level + ' COMPLETE').width/2), 40);
    
    ctx.fillText('CLICK TO PROCEED', 160 - (ctx.measureText('CLICK TO PROCEED').width/2), 80);
  };

  //game over loser! muahaha
  api.gameoverLoad = function() {
//    var gameOverImg = new Image();
//    gameOverImg.ready = false;
//    gameOverImg.onload = setAssetReady;
//    gameOverImg.src = 'imgs/splash2.jpg';
//    gameOverImg.left = 0;
//    gameOverImg.top = 0;
//    gameOverImg.name = 'gameOverImg';
//    gameOverImg.action = function(){
//      CURR_STATE = GAME_STATES[0];
//    };
//    elements.push(gameOverImg);

    var transTopImg = new Image();
    transTopImg.ready = false;
    transTopImg.onload = setAssetReady;
    transTopImg.src = 'imgs/BG_Gradient.png';
    transTopImg.left = 0;
    transTopImg.top = 0;
    transTopImg.name = 'transTopImg';
    transTopImg.action = function() {
      CURR_STATE = GAME_STATES[0];
    };
    elements.push(transTopImg);

    var transBottomImg = new Image();
    transBottomImg.ready = false;
    transBottomImg.onload = setAssetReady;
    transBottomImg.src = 'imgs/Turntable.png';
    transBottomImg.left = 0;
    transBottomImg.top = 151;
    transBottomImg.name = 'transBottomImg';
    transBottomImg.action = function() {
      CURR_STATE = GAME_STATES[0];
    };
    elements.push(transBottomImg);
  };

  api.gameoverRun = function() {
    drawElements(elements);
    ctx.font = '48px VT323';
    ctx.fillStyle = '#FFB54B';
    ctx.fillText('GAME OVER', 160 - (ctx.measureText('GAME OVER').width/2), 40);
    ctx.fillText('SCORE: ' + score, 160 - (ctx.measureText('SCORE: ' + score).width/2), 80);
    ctx.fillText('CLICK ANYWHERE', 160 - (ctx.measureText('CLICK ANYWHERE').width/2), 120);
  };

  api.transitionLoad = function() {
    transPos = 0;
    
//    var lastCanvasImg = new Image();
//    lastCanvasImg.ready = false;
//    lastCanvasImg.onload = setAssetReady;
//    lastCanvasImg.src = lastCanvas;
//    lastCanvasImg.left = 0;
//    lastCanvasImg.top = 0;
//    lastCanvasImg.name = 'lastCanvasImg';
//    elements.push(lastCanvasImg);

    var transTopImg = new Image();
    transTopImg.ready = false;
    transTopImg.onload = setAssetReady;
    transTopImg.src = 'imgs/transition.png';
    transTopImg.left = 0;
    transTopImg.top = -240 + transPos;
    transTopImg.name = 'transTopImg';
    transTopImg.action = function() {
      CURR_STATE = NEW_STATE;
    };
    elements.push(transTopImg);

    var transBottomImg = new Image();
    transBottomImg.ready = false;
    transBottomImg.onload = setAssetReady;
    transBottomImg.src = 'imgs/transition.png';
    transBottomImg.left = 0;
    transBottomImg.top = 480 - transPos;
    transBottomImg.name = 'transBottomImg';
    transBottomImg.action = function() {
      CURR_STATE = NEW_STATE;
    };
    elements.push(transBottomImg);

  };

  api.transitionRun = function() {
    ctx.putImageData(lastCanvas,0,0);
    drawElements(elements);
    if (transPos < 240) {
      transPos += 10;
    } else {
      CURR_STATE = NEW_STATE;
    }
    api.updateElement('transTopImg','top',-240 + transPos);
    api.updateElement('transBottomImg','top',480 - transPos);
  };

  //for testing
  api.getElements = function() {
    return elements;
  }

  return api;
})();