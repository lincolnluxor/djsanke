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
  var GAME_STATES = ['splash','game','leaderboard','levelup'];
  var CURR_STATE = GAME_STATES[0];
  var LAST_STATE;
  var currTime;
  var lastTime;
  var timer = [30,20,10,7];
  var level;
  var actions = 0;

  canvas.addEventListener('click',function(e) {
    var clickX = e.pageX - canvasLeft;
    var clickY = e.pageY - canvasTop;
    console.log('x: '+clickX+' y: '+clickY);
    elements.forEach(function(element) {
      if (clickY > element.top && clickY < element.top + element.height && clickX > element.left && clickX < element.left + element.width) {
        if (element.action) {element.action()};
        console.log('clicked: ' + element.name);
      }
    });
  });

  function timestamp() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
  };

  var now, dt,
      last = timestamp();
  var fpsmeter = new FPSMeter({ decimals: 0, graph: true, theme: 'dark', left: '600px', right: '5px' });


  function frame(running) {
    fpsmeter.tickStart();
    now = timestamp();
    dt = Math.min(1, (now - last) / 1000);   // duration capped at 1.0 seconds
    update(dt);
    last = now;
    requestAnimationFrame(frame);
    fpsmeter.tick();
  }
  requestAnimationFrame(frame);

  function setAssetReady() {
    this.ready = true;
  };

  function drawElements(elements) {
    elements.forEach(function(element) {
      ctx.drawImage(element, element.left, element.top);
    });
  };

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
  };

  //Home screen
  api.splashLoad = function() {
    level = 0;
    var splashImg = new Image();
    splashImg.ready = false;
    splashImg.onload = setAssetReady;
    splashImg.src = 'imgs/Sanke_Start.png';
    splashImg.left = 0;
    splashImg.top = 0;
    splashImg.name = 'splashImg';
    splashImg.action = function() {
      CURR_STATE = GAME_STATES[1];
    }
    elements.push(splashImg);

    return elements;
  };

  api.splashRun = function(dt,elements) {

//    ctx.drawImage(splashImg,0,0);
    drawElements(elements);
//    ctx.font = '48px VT323';
//    ctx.fillStyle = '#fff';
//    ctx.fillText('DJ SANKE', 80, 320);
  };

  //Game
  api.gameLoad = function() {
    var bgImg = new Image();
    bgImg.ready = false;
    bgImg.onload = setAssetReady;
    bgImg.src = 'imgs/header.png';
    bgImg.left = 0;
    bgImg.top = 0;
    bgImg.name = 'bgImg';
    elements.push(bgImg);

    var deckImg = new Image();
    deckImg.ready = false;
    deckImg.onload = setAssetReady;
    deckImg.src = 'imgs/HUD.png';
    deckImg.left = 0;
    deckImg.top = 152;
    deckImg.name = 'deckImg';
    deckImg.action = function() {
      //check here to see if they clicked or moved correctly
      lastTime = parseInt(new Date().getTime()/getBarSpeed());
      actions += 1;
      if (actions > 10) {
        CURR_STATE = GAME_STATES[3];
      }
    }
    elements.push(deckImg);

    var barImg = new Image();
    barImg.ready = false;
    barImg.onload = setAssetReady;
    barImg.src = 'imgs/bar.jpg';
    barImg.left = 0;
    barImg.top = 139;
    barImg.name = 'barImg';
    elements.push(barImg);

    lastTime = parseInt(new Date().getTime()/getBarSpeed());
  };

  api.gameRun = function(time) {
    console.log(actions +'-'+ level);
    currTime = parseInt(new Date().getTime()/getBarSpeed());
    api.updateElement('barImg','left',lastTime - currTime);

    if (lastTime - currTime > -320) {
      drawElements(elements);
    } else {
      CURR_STATE = GAME_STATES[0];
//      CURR_STATE = GAME_STATES[3]; //for devel... levels up
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
  };

  //reset the board
  api.levelupRun = function() {
    CURR_STATE = GAME_STATES[1];
  };

  //for testing
  api.getElements = function() {
    return elements;
  }

  //Leaderboard

  return api;
})();