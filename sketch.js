gameState ="menu";
playerState = "idle";
lastState = "low";

if (navigator.requestMIDIAccess){
  navigator.requestMIDIAccess().then(midiAccessAllowed,midiAccessDenied)
}

function setup() {
  // fullscreen canvas
  createCanvas(windowWidth, windowHeight);
  fps = 60;
  frameRate(fps);
  loadSong();
}

function preload() {
  loadSprites();
  preloadSong();
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
  //1 is pressed
  if (keyIsDown(49)){
    if (gamestate = "menu"){
      songFrame = 0;
    }
    gameState = "play";
  }else 

  drawPlayer(playerState, mouseX,mouseY);
}

function play() {
  //plays for first time
  if (!song.isPlaying()) {
    song.play();
  }
  background(255)
  songFrame++;

  //show song frame counter
  fill(0)
  textSize(32);
  text("time: " + songFrame, 10, 30);

  /*lanes
  let colors = [255,255,255,255,255,255,255,255];
  let rectHeight = height * 0.1;
  for (let i = 0; i < colors.length; i++) {
    fill(colors[i]);
    rect(0, rectHeight * (i+1), width, rectHeight);
  }
    */

  //drawing hit circles/projectiles based on frame number
  renderNotes();
}

function drawPlayer(state="idle", x=0, y=0, size=500) {
  //draws player from bottom right foot
  var animations = {
    "idle":[0,1,2],
    "low":[3,4,10],
    "medium":[5,6,10],
    "high":[7,8,10]
  }
  if(state!=lastState){
    nextSprite=0;
    lastState=state;
  }
  if(frameCount%10==0){
  image(images[animations[state][nextSprite]], x-size*0.6, y-size*0.98, size*1.2,size);
  nextSprite++;
  if(nextSprite/2 >1){
    nextSprite=0;
  }
  }else{
    image(images[animations[state][nextSprite]], x-size*0.6, y-size*0.98, size*1.2,size);
  }
}

function loadSprites() {
  images = []; //each img is 600x500 px
  for (let i = 0; i < 11; i++) {
    images[i] = loadImage("assets/char/" + i + ".png");
  }
}

function preloadSong() {
  song = loadSound("assets/song/audio.mp3");
  preloadNotes = loadStrings("assets/song/notes.txt");
}

function loadSong(){ //secondary parse bc preloadSong() is async
  notes = [];
  for (let line of preloadNotes) {
    let note = int(line.split(","));
    notes.push(note);
  }
}
function midiAccessAllowed(midiAccess){
  //console.log(midiAccess);
  const inputs = midiAccess.inputs;
  //console.log(inputs);

  inputs.forEach((input) => {
      console.log(input);
      input.onmidimessage = handleInput;
  });
}

function handleInput(input){
  const noteEvent = input.data[0];
  const note = input.data[1];
  const velocity = input.data[2];
  console.log(note);
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
            playerState="high";
            break;
        case 47:
          console.log("CLOSED HI-HAT");
          playerState = "high";
          break;
    }
  } else{
    playerState="idle";
  }
}

function renderNotes(){
  let hitCircleSize = 50;
  let hitCircleSpeed = 5;
  line(width*0.3, height*0.1, width*0.3, height*0.9);
  testNote=320;
  fill("#bde0fe");
  for (let i = 0; i < 8; i++) {
    for (let testNote of notes[i]) {
      if (testNote-songFrame > 0 && testNote-songFrame < width/hitCircleSpeed) {
        ellipse(width*0.3 + (testNote-songFrame)*hitCircleSpeed, height*0.15 + height*0.1*i, hitCircleSize, hitCircleSize);
      }
    }
  }
  
}

function midiAccessDenied(){
  console.log("Could not connect to any midi device.")
}