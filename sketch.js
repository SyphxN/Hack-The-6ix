gameState = "menu";
playerState = "idle";
lastState = "low";
lastAttack = "high";
nextSprite = 0;
currentNotesPressed = [];
playerScore = {0: 0, 50: 0, 100: 0, 300: 0}
notesOnScreen = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []}
hitNotes = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []}
scoreFeedback = [];
score = 0;
combo = 0;
healthValue = 100;
let id,levelID;

function initSketch(id) {
  console.log("Received ID:", id);
  levelID = id;
}

window.initSketch = initSketch;

if (navigator.requestMIDIAccess){
  navigator.requestMIDIAccess().then(midiAccessAllowed,midiAccessDenied)
}

// Define the arrays for k and m values
kValues = [49,50,51,52,53,54,55,56];
mValues = [0, 1, 2, 3, 4, 5, 6, 7];
hitSounds = [];

function setup() {
  console.log("setting up");
  createCanvas(windowWidth, windowHeight);
  fps = 60;
  frameRate(fps);
  resetValues();
  console.log("Setup complete with ID:", levelID);
}

function resetValues() {
  currentNotesPressed = [];
  playerScore = {0: 0, 50: 0, 100: 0, 300: 0}
  notesOnScreen = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []}
  hitNotes = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []}
  scoreFeedback = [];
  score = 0;
  combo = 0;
  healthValue = 100;
}
function preload() {
  menuBg = loadImage("assets/menuBg.png");
  loadSprites();

  // Return a promise that resolves when loadAssets() completes
  return new Promise((resolve, reject) => {
    const checkId = setInterval(() => {
      if (levelID !== undefined) {
        clearInterval(checkId);
        console.log("Preloading assets for ID:", levelID);

        loadAssets()
          .then(() => resolve())
          .catch(error => reject(error));
      }
    }, 1000);
  });
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
  imageMode(CENTER)
  background(200);
  offset=(-frameCount)%(width/2)
  image(menuBg,(width*0.5+offset*2),height*0.51,width,height*1.02);
  image(menuBg,(width*1.5+offset*2),height*0.51,width,height*1.02);
  textSize(32);
  fill(255);
  text("p to play", 10, 30);
  text("c for config", 10, 60);
  //p
  if (keyIsDown(80)){
    if (gamestate = "menu" && frameCount>255){
      songFrame = 0;
      resetValues();
      gameState = "play";
    }
  }
  if (keyIsDown(67)){
    gameState="config";
  }

  drawPlayer(playerState, width*0.5, height*1.16,height*0.4);
  config_length = max(kValues.length,mValues.length)
  if (config_length < 8){
    text("Select a keybind for the note " + int(config_length+1), 10, 90);
    if(!hitSounds[config_length].isPlaying()){
      hitSounds[config_length].play();
    }
  }

  if (frameCount<255){
    background(0,0,0,255-frameCount);
    push();
    textAlign(CENTER);
    text("Loading...", width/2,height/2);
    pop();
  }
}

function play() {
  if (songFrame > songLength + 120) {
    gameState = "menu";
    song.stop();
  }

  //plays for first time
  if (!song.isPlaying()) {
    song.play();
  }
  imageMode(CENTER)
  background(200);
  image(bg,width*0.5,height*0.5,width,height);
  
  imageMode(CORNER)
  background(0,0,0,100)
  songFrame++;
  healthValue -= healthDrain / fps;

  //show song frame counter
  // fill(0);
  // textSize(32);
  // text("time: " + songFrame, 10, 30);
  
  //drawing hit circles/prjectiles based on frame number
  push();
  stroke(255, 0, 0);
	strokeWeight(10);
  x = map(songFrame, 0, songLength + 120, 0, width);
	line(0, height-10, x, height-10);
  pop();

  // show health bar
  push();
  stroke(255, 0, 0);
	strokeWeight(10);
  x = map(healthValue, 0, 100, 0, width/3);
	line(0, 5, x, 5);
  pop();

  // show combo
  if (combo > 0) {
    fill(255);
    textSize(64);
    text(combo + "x", 10, height-50);
  }

  // show score
  fill(255);
  textSize(34);
  noStroke();
  text(score, 30, 50);
  
  //drawing hit circles/projectiles based on frame number
  renderNotes();
  drawPlayer(playerState, width*0.25,height*0.9,height*0.9);

  // process input hit timing
  checkLateNotes();
  processHitTiming();

  if (healthValue > 100) {
    healthValue = 100;
  }

  // draw hit score
  drawScore();

}


function checkLateNotes() {
  for (let [i, frames] of Object.entries(notesOnScreen)) {
    let frame_duration = 1000 / fps;
    let badHitWindow = Math.ceil((200 - (overallDifficulty * 10)) / frame_duration);
    let latestNote = notesOnScreen[i][0]
    let hitTiming = songFrame - latestNote;
    if (hitTiming > badHitWindow) {
      notesOnScreen[i].shift()
      hitNotes[i] = hitNotes[i].filter(n => n == latestNote);
      playerScore[0]++;
      // console.log("missed note");
      renderFeedback(0);
      combo = 0;
      healthValue -= 0.5 * healthDrain;
    }
  }
}

function processHitTiming() {
  if (currentNotesPressed.length > 0 && notesOnScreen[currentNotesPressed[0]].length > 0) {
    while (currentNotesPressed.length > 0) {
      //console.log("currentNotesPressed[0]: ", currentNotesPressed[0]);
      let noteScore = calculateScore(songFrame, currentNotesPressed[0], notesOnScreen[currentNotesPressed[0]][0])
      // console.log("score: ", score);
      renderFeedback(noteScore);
      switch (noteScore) {
        case 0: 
          combo = 0;
          healthValue -= 0.5 * healthDrain;
          break;
        case 50:
          combo++;
          healthValue -= 0.25 * healthDrain;
          score += (50 * combo);
          break;
        case 100:
          combo++;
          healthValue += 2 * healthDrain;
          score += (100 * combo);
          break;
        case 300:
          combo++;
          healthValue += 5 * healthDrain;
          score += (300 * combo);
          break;
        default:
          break;
      }
      hitNotes[currentNotesPressed[0]].push(notesOnScreen[currentNotesPressed[0]][0]);
      notesOnScreen[currentNotesPressed[0]].shift();
      currentNotesPressed.shift();
      playerScore[noteScore]++;
    }
  }
}

function calculateScore(songFrame, notePressed, latestNote) {
  let frame_duration = 1000 / fps;
  let goodHitWindow = Math.ceil((80 - (overallDifficulty * 6)) / frame_duration);
  let midHitWindow = Math.ceil((140 - (overallDifficulty * 8)) / frame_duration);
  let badHitWindow = Math.ceil((200 - (overallDifficulty * 10)) / frame_duration);
  let hitTiming = abs(latestNote - songFrame);
  //console.log("hitTiming: " + latestNote + " - " + songFrame + " = " + hitTiming + " <= (" + goodHitWindow + ", " + midHitWindow + ", " + badHitWindow + ")");
  if (hitTiming <= goodHitWindow) {
    return 300;
  } else if (hitTiming <= midHitWindow) {
    return 100;
  } else if (hitTiming <= badHitWindow) {
    return 50;
  } else {
    return 0;
  }
}

function drawPlayer(state="idle", x=0, y=0, size=500) {
  if (currentNotesPressed.includes(6) || currentNotesPressed.includes(7)){
    playerState="low";
  }else if(currentNotesPressed.includes(3) || currentNotesPressed.includes(4) || currentNotesPressed.includes(5)){
    playerState = "medium";
  }else if(currentNotesPressed.length == 0){
    playerState = "idle";
  }else{
    playerState = "high";
  }
  //console.log(currentNotesPressed);
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
  miss = loadImage("assets/hit/0.png");
  ok = loadImage("assets/hit/50.png");
  great = loadImage("assets/hit/100.png");
  amazing = loadImage("assets/hit/300.png");
}

function loadAssets() {
  return new Promise((resolve, reject) => {
    // Load the JSON data first
    loadJSON(`assets/song/${levelID}.json`, (data) => {
      jsonData = data;

      // Load other assets
      song = loadSound(`assets/song/${levelID}.mp3`);
      bg = loadImage(`assets/song/${levelID}.jpg`);
      kick = loadSound("assets/drum_sounds/0.wav");
      snare = loadSound("assets/drum_sounds/1.wav");
      floorTom = loadSound("assets/drum_sounds/2.wav");
      hi_hat = loadSound("assets/drum_sounds/3.wav");
      crash = loadSound("assets/drum_sounds/4.wav");
      high_tom = loadSound("assets/drum_sounds/5.wav");
      open_hi_hat = loadSound("assets/drum_sounds/6.wav");
      ride = loadSound("assets/drum_sounds/7.wav");
      hitSounds = [kick, snare, floorTom, hi_hat, crash, high_tom, open_hi_hat, ride];

      // Load additional assets or perform setup based on JSON data
      notes = jsonData.rows;
      songLength = jsonData.songLength;
      approachRate = jsonData.approachRate;
      columnCount = jsonData.columnCount;
      overallDifficulty = jsonData.overallDifficulty;
      healthDrain = jsonData.healthDrain;

      // Resolve the promise when all assets are loaded and initialized
      resolve();
    }, (error) => {
      console.error("Error loading JSON:", error);
      reject(error);
    });
  });
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
    if (!currentNotesPressed.includes(note)) {
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
  if(note>=0){
    currentNotesPressed.push(note);
  }
  // console.log("pressed: "+ note);
  if(note>=0){
    hitSounds[note].play();
  }
  
}

function inputReleased(note){ // merges both kb and midi input
  currentNotesPressed = currentNotesPressed.filter(n => n != note);
  // console.log("released: "+ note);
}

function renderNotes(){
  gameplayGUI();
  let hitCircleSize = 50;
  let hitCircleSpeed = approachRate*2;

  let frame_duration = 1000 / fps;
  let hitWindow = 0;
  for (let i = 0; i < columnCount; i++) {
    for (let testNote of notes[i]) {
      if (hitNotes[i].includes(testNote)) {
        continue;
      } else if (testNote-songFrame > 0 && testNote-songFrame < width/hitCircleSpeed) {
        stroke(0)
        fill(189, 224, 254);
        ellipse(width*0.35 + (testNote-songFrame)*hitCircleSpeed, height*0.15 + height*0.1*i, hitCircleSize, hitCircleSize);
        if (!notesOnScreen[i].includes(testNote)) notesOnScreen[i].push(testNote);
      } else if (testNote-songFrame > -10 && testNote-songFrame <= 0) { // transparent fade out
        alpha = map(testNote-songFrame, -10, 0, 0, 255);
        fill(189, 224, 254,alpha);
        stroke(0,alpha)
        ellipse(width*0.35 + (testNote-songFrame)*hitCircleSpeed, height*0.15 + height*0.1*i, hitCircleSize, hitCircleSize);
      }
    }
  }

}

function renderFeedback(feedback) {
  if (feedback == 0) {
    scoreFeedback = [miss, 60];
  } else if (feedback == 50) {
    scoreFeedback = [ok, 60];
  } else if (feedback == 100) {
    scoreFeedback = [great, 60];
  } else if (feedback == 300) {
    scoreFeedback = [amazing, 60];
  }
}

function drawScore() {
  imageMode(CENTER);
  if (scoreFeedback[1] > 30) {
    fill(0);
    stroke(0);
    image(scoreFeedback[0], width*0.5, height*0.5,250,100);
    scoreFeedback[1]--;
  } else if (scoreFeedback[1] > 0) {
    fill(0, 0, 0, scoreFeedback[1]*255 / 60);
    stroke(0, 0, 0, scoreFeedback[1]*255 / 60);
    image(scoreFeedback[0], width*0.5, height*0.5,250,100);
    scoreFeedback[1]--;
  }
  imageMode(CORNER)
}

function gameplayGUI(){
  let colors = [255,255,255,255,255,255,255,255];
  let rectHeight = height * 0.1;
  for (let i = 0; i < colors.length; i++) {
    fill(255,100);
    //rect(width*0.35, rectHeight * (i+1), width, rectHeight);
    fill(colors[i]);
    if (currentNotesPressed.includes(i)) {
      fill(255,0,0);
    }
    stroke(0);
    ellipse(width*0.35,height*0.1*i+height*0.15, 55, 55);
  }
}

function midiAccessDenied(){
  console.log("Could not connect to any midi device.")
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}