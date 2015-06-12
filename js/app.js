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
  var GAME_STATES = ['splash','game','leaderboard'];
  var CURR_STATE = GAME_STATES[0];
  var LAST_STATE;

  canvas.addEventListener('click',function(e) {
    var clickX = e.pageX - canvasLeft;
    var clickY = e.pageY - canvasTop;
    console.log('x: '+clickX+' y: '+clickY);
    elements.forEach(function(element) {
      if (clickY > element.top && clickY < element.top + element.height && clickX > element.left && clickX < element.left + element.width) {
        element.action();
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
    if (CURR_STATE !== LAST_STATE) {
      elements = [];
      var load = CURR_STATE + 'Load';
      api[load]();
      LAST_STATE = CURR_STATE;
    }
    var run = CURR_STATE + 'Run';
    api[run](dt,elements);
  };

  api.splashLoad = function() {
    var startImg = new Image();
    startImg.ready = false;
    startImg.onload = setAssetReady;
    startImg.src = 'imgs/start.png';
    startImg.left = 110;
    startImg.top = 350;
    startImg.name = 'startImg';
    startImg.action = function() {
      CURR_STATE = GAME_STATES[1];
    }
    elements.push(startImg);
    return elements;
  };

  api.splashRun = function(dt,elements) {
    var splashImg = new Image();
    splashImg.ready = false;
    splashImg.onload = setAssetReady;
    splashImg.src = 'imgs/splash2.jpg';
    ctx.drawImage(splashImg,0,0);
    drawElements(elements);
    ctx.font = '30px Arial';
    ctx.fillStyle = '#00f';
    ctx.fillText('DJ SANKE', 90, CANVAS_HEIGHT/4);
  };
  
  api.gameLoad = function() {
  }
  
  api.gameRun = function() {
  }

  return api;
})();
//Home screen

//Leaderboard

//Game init