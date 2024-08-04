gameState ="menu";
playerState = "idle";
lastState = "low";
lastAttack = "high";
nextSprite = 0;
currentNotes = [];
score = 0;
playerTimings = {50: 0, 100: 0, 300: 0}
hitNotes = [];

if (navigator.requestMIDIAccess){
  navigator.requestMIDIAccess().then(midiAccessAllowed,midiAccessDenied)
}

// Define the arrays for k and m values
kValues = [48,49,50,51,52,53,54,55];
mValues = [0, 1, 2, 3, 4, 5, 6, 7];
hitSounds = [];

function setup() {
  // fullscreen canvas
  createCanvas(windowWidth, windowHeight);
  fps = 60;
  frameRate(fps);
  loadSong();
  score = 0;
  playerTimings = {50: 0, 100: 0, 300: 0}
  hitNotes = []
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
    case "config":
      kValues.splice(0, kValues.length);
      mValues.splice(0,mValues.length);
      gameState="menu";
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
  }
  if (keyIsDown(51)){
    print(kValues,mValues);
  }
  if (keyIsDown(50)){
    gameState="config";
  }

  drawPlayer(playerState, mouseX, mouseY);
}

function play() {
  //plays for first time
  if (!song.isPlaying()) {
    song.play();
  }
  image(bg, 0, 0, width, height);
  background(0,0,0,100)
  songFrame++;

  //show song frame counter
  fill(0)
  textSize(32);
  text("time: " + songFrame, 10, 30);
  

  //drawing hit circles/projectiles based on frame number
  renderNotes();
  drawPlayer(playerState, width*0.25,height*0.9,height*0.9);

  // process input hit timing
  

}

function drawPlayer(state="idle", x=0, y=0, size=500) {
  if (currentNotes.includes(6) || currentNotes.includes(7)){
    playerState="low";
  }else if(currentNotes.includes(3) || currentNotes.includes(4) || currentNotes.includes(5)){
    playerState = "medium";
  }else if(currentNotes.length == 0){
    playerState = "idle";
  }else{
    playerState = "high";
  }
  //draws player from bottom right foot
  var animations = {
    "idle":[0,1,2],
    "low":[3,4,10],
    "medium":[5,6,10],
    "high":[7,8,10],
    "low to high":[9,8,10]
  }
  if(lastState!="idle" && state == "idle" && nextSprite<2){
    state = lastState;
    lastAttack = lastState;
  }else{
    if(lastAttack == "low" && state=="high"){
      state = "low to high";
      lastAttack = "low to high";
      nextSprite=0;
    }else if(state!=lastState){
      nextSprite=0;
      lastState=state;
    }
  }
  if(frameCount%5==0){
    // console.log("Last state:",lastState," State:",state," Sprite:",animations[state][nextSprite]);
    image(images[animations[state][nextSprite]], x-size*0.6, y-size*0.98, size*1.2,size);
    nextSprite++;
    if(nextSprite/2 >1){
      nextSprite=0;
    }
  } else {
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
  // preloadNotes = loadStrings("assets/song/notes.txt")
  jsonData = loadJSON("assets/song/map.json");
  bg = loadImage("assets/song/bg.jpg");
  kick = loadSound("assets/drum_sounds/0.wav");
  snare = loadSound("assets/drum_sounds/1.wav");
  floorTom = loadSound("assets/drum_sounds/2.wav");
  hi_hat = loadSound("assets/drum_sounds/3.wav");
  crash = loadSound("assets/drum_sounds/4.wav");
  high_tom = loadSound("assets/drum_sounds/5.wav");
  open_hi_hat = loadSound("assets/drum_sounds/6.wav");
  ride = loadSound("assets/drum_sounds/7.wav");
  hitSounds = [kick,snare,floorTom,hi_hat,crash,high_tom,open_hi_hat,ride];
}

function loadSong(){ //secondary parse bc preloadSong() is async
  // notes = [];
  // for (let line of preloadNotes) {
  //   let note = int(line.split(","));
  //   notes.push(note);
  // }
  notes = jsonData.rows;
  approachRate = jsonData.approachRate;
  columnCount = jsonData.columnCount;
}
function midiAccessAllowed(midiAccess){
  //console.log(midiAccess);
  const inputs = midiAccess.inputs;
  //console.log(inputs);

  inputs.forEach((input) => {
      input.onmidimessage = handleMidiInput;
  });
}

function handleMidiInput(input){
  const noteEvent = input.data[0];
  const note = input.data[1];
  if(noteEvent == 144){
    if (mValues.length<8 && !mValues.includes(note)){
      mValues.push(note);
      console.log(mValues);
    }
    if (!currentNotes.includes(note)) {
      inputPressed(mValues.indexOf(note));
    }
  } else  {
    inputReleased(mValues.indexOf(note));
  }
}

function keyPressed(){
  //if key from 1-8
  if (kValues.length<8 && !kValues.includes(keyCode)){
    kValues.push(keyCode);
    console.log(kValues);
  }
  if (kValues.includes(keyCode)){
    inputPressed(kValues.indexOf(keyCode));
  }
}

function keyReleased(){
    //if key from 1-8
    if (kValues.includes(keyCode)){
      inputReleased(kValues.indexOf(keyCode));
    }
  }


function inputPressed(note){ // merges both kb and midi input
  currentNotes.push(note);
  console.log("pressed: "+ note);
  console.log(currentNotes);
  hitSounds[note].play();
}

function inputReleased(note){ // merges both kb and midi input
  currentNotes = currentNotes.filter(n => n != note);
  console.log("released: "+ note);
  hitSounds[note].play;
  console.log(currentNotes);
}

function renderNotes(){
  gameplayGUI();
  let hitCircleSize = 50;
  let hitCircleSpeed = approachRate*3;

  let frame_duration = 1000 / fps;
  let hitWindow = 0;
  
  for (let i = 0; i < columnCount; i++) {
    for (let testNote of notes[i]) {
      if (testNote-songFrame > 0 && testNote-songFrame < width/hitCircleSpeed) {
        stroke(0)
        fill(189, 224, 254);
        ellipse(width*0.35 + (testNote-songFrame)*hitCircleSpeed, height*0.15 + height*0.1*i, hitCircleSize, hitCircleSize);
      } else if (testNote-songFrame > -10 && testNote-songFrame <= 0) { //transparent fade out
        alpha = map(testNote-songFrame, -10, 0, 0, 255);
        fill(189, 224, 254,alpha);
        stroke(0,alpha)
        ellipse(width*0.35 + (testNote-songFrame)*hitCircleSpeed, height*0.15 + height*0.1*i, hitCircleSize, hitCircleSize);
      }

      // if (testNote-songFrame)
    }
  }

}

function gameplayGUI(){
  line(width*0.35, height*0.1, width*0.35, height*0.9);
  let colors = [255,255,255,255,255,255,255,255];
  let rectHeight = height * 0.1;
  for (let i = 0; i < colors.length; i++) {
    fill(255,100);
    //rect(width*0.35, rectHeight * (i+1), width, rectHeight);
    fill(colors[i]);
    if (currentNotes.includes(i)) {
      fill(255,0,0);
    }
    ellipse(width*0.35,height*0.1*i+height*0.15, 55, 55);
  }
}

function midiAccessDenied(){
  console.log("Could not connect to any midi device.")
}