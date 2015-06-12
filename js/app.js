//Controlling the games state
var app = (function() {
  var canvas = document.getElementById('game');
  var ctx = canvas.getContext ("2d");
  var CANVAS_WIDTH = 320;
  var CANVAS_HEIGHT = 480;
  var gameState = ['splash','game','leader'];

  var fps = 30;
  setInterval(function() {
    update();
    draw();
  }, 1000/fps);

  function update() {
  };

  function draw() {
    ctx.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
    ctx.fillStyle = "#000"; // Set color to black
    ctx.fillText("DJ Sanke", 50, 50);
  };

})();
//Home screen

//Leaderboard

//Game init