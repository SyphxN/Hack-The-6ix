gameState ="menu";
playerState = "idle";

function setup() {
  // fullscreen canvas
  createCanvas(windowWidth, windowHeight);
  fps = 60;
  frameRate(fps);
}

function preload() {
  loadSprites();
  loadSong();
}

function draw() {
  switch (gameState) {
    case "menu":
      menu();
      break;
    case "play":
      play();
      break;
  }
}
function menu() {
  background(120);
  textSize(32);
  text("1 for idle", 10, 30);
  text("2 for low", 10, 60);
  text("3 for medium", 10, 90);
  text("4 for high", 10, 120);

  //1 is pressed
  if (keyIsDown(49)){
    playerState ="idle";
  }
  //2 is pressed
  if (keyIsDown(50)){
    playerState ="low";
  }
  //3 is pressed
  if (keyIsDown(51)){
    playerState ="medium";
  }
  //4 is pressed
  if (keyIsDown(52)){
    playerState ="high";
  }
  drawPlayer(playerState, mouseX,mouseY);
}

function play() {
  background(255);
}

function drawPlayer(state="idle", x=0, y=0, size=500) {
  //draws player from bottom right foot
  switch (state) {
    case "idle":
      //range = [0,1,2]
      image(images[int(frameCount/15)%3], x-size*0.6, y-size*0.98, size*1.2,size);
      break;
    case "low":
      //range = [3,4]
      image(images[int(frameCount/15)%2+3], x-size*0.6, y-size*0.98, size*1.2,size);
      break;
    case "medium":
      //range = [5,6,7]
      image(images[int(frameCount/15)%3+5], x-size*0.6, y-size*0.98, size*1.2,size);
      break;
    case "high":
      //range = [8,9,10]
      image(images[int(frameCount/15)%3+8], x-size*0.6, y-size*0.98, size*1.2,size);
      break;
  }
}

function loadSprites() {
  images = []; //each img is 600x500 px
  for (let i = 0; i < 11; i++) {
    images[i] = loadImage("assets/char/" + i + ".png");
  }
}

function loadSong() {
  song = loadSound("assets/audio.mp3");
}