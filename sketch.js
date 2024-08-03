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
  if (navigator.requestMIDIAccess){
    navigator.requestMIDIAccess().then(midiAccessAllowed,failure)
  }
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
  text("1 for low", 10, 30);
  text("2 for medium", 10, 60);
  text("3 for high", 10, 90);
  /*
  //1 is pressed
  if (keyIsDown(49)){
    playerState ="low";
  }else 
  //2 is pressed
  if (keyIsDown(50)){
    playerState ="medium";
  } else
  //3 is pressed
  if (keyIsDown(51)){
    playerState ="high";
  } else 
  //Default/Idle
  {
    playerState ="idle";
  }
    */
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
      console.log(int(frameCount/15)%3);
      break;
    case "low":
      //range = [3,4]
      image(images[int(frameCount/15)%2+3], x-size*0.6, y-size*0.98, size*1.2,size);
      console.log(int(frameCount/15)%2);
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

function midiAccessAllowed(midiAccess){
  console.log(midiAccess);
  const inputs = midiAccess.inputs;
  console.log(inputs);

  inputs.forEach((input) => {
      console.log(input);
      input.onmidimessage = handleInput;
  });
}

function handleInput(input){
  const noteEvent = input.data[0];
  const note = input.data[1];
  const velocity = input.data[2];
  console.log("")
  if(noteEvent == 144){
    switch(note){
        case 44:
            console.log("KICK");
            playerState = "low";
            break;
        case 46:
            console.log("FLOOR TOM");
            playerState ="low";
            break;
        case 45:
            console.log("SNARE");
            playerState = "medium";
            break;
        case 49:
            console.log("HIGH TOM");
            playerState = "high";
            break;
        case 48:
            console.log("CRASH");
            playerState="high";
            break;
        case 50:
            console.log("OPEN HI-HAT");
            playerState ="high";
            break;
        case 51:
            console.log("RIDE");
            playerState="idle";
            break;
        case 47:
          console.log("CLOSED HI-HAT");
          playerState = "high";
          break;
    }
  }else{
    playerState="idle";
  }
}

function midiAccessDenied(){
  console.log("Could not connect to any midi device.")
}