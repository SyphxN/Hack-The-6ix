gameState ="menu";
playerState = "idle";
lastState = "low";
lastAttack = "high";
nextSprite=0;
currentNotes=[];

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
  }

  drawPlayer(playerState, mouseX, mouseY);
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
  jsonData = loadJSON("assets/song/Turbo - PADORU  PADORU (PokeSky) [PADORU].osu.json");
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
  const velocity = input.data[2];
  if(noteEvent == 144){
    if (!currentNotes.includes(note)) {
      currentNotes.push(note);
    }
  }else{
    currentNotes = currentNotes.filter(n => n != note);
  }
  console.log(currentNotes);
}

function keyPressed(){
  //if key from 1-8
  if (keyCode >= 49 && keyCode <= 56){
    currentNotes.push(keyCode-49);
    console.log(currentNotes);
  }
}

function keyReleased(){
    //if key from 1-8
    if (keyCode >= 49 && keyCode <= 56){
      //remove element from list
      currentNotes = currentNotes.filter(n => n != keyCode-49);
    }
}

function renderNotes(){
  gameplayGUI();
  let hitCircleSize = 50;
  let hitCircleSpeed = approachRate*3;
  fill("#bde0fe");
  for (let i = 0; i < columnCount; i++) {
    for (let testNote of notes[i]) {
      if (testNote-songFrame > -10 && testNote-songFrame < width/hitCircleSpeed) {
        ellipse(width*0.35 + (testNote-songFrame)*hitCircleSpeed, height*0.15 + height*0.1*i, hitCircleSize, hitCircleSize);
      }
    }
  }
  
}

function gameplayGUI(){
  line(width*0.35, height*0.1, width*0.35, height*0.9);
  let colors = [255,255,255,255,255,255,255,255];
  let rectHeight = height * 0.1;
  for (let i = 0; i < colors.length; i++) {
    fill(255);
    rect(0, rectHeight * (i+1), width, rectHeight);
    fill(colors[i]);
    if (currentNotes.includes(i)) {
      fill(255,0,0);
    }
    ellipse(width*0.36,height*0.1*i+height*0.15, 55, 55);
  }
}

function midiAccessDenied(){
  console.log("Could not connect to any midi device.")
}