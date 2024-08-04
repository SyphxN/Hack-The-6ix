gameState = "menu";
playerState = "idle";
lastState = "low";
lastAttack = "high";
nextSprite = 0;
currentNotesPressed = [];
playerScore = {0: 0, 50: 0, 100: 0, 300: 0}
notesOnScreen = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []}
hitNotes = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []}
scoreFeedback = []

config={
  0:{"k":0,"m":0},
  1:{"k":1,"m":1},
  2:{"k":2,"m":2},
  3:{"k":3,"m":3},
  4:{"k":4,"m":4},
  5:{"k":5,"m":5},
  6:{"k":6,"m":6},
  7:{"k":7,"m":7},
}

if (navigator.requestMIDIAccess){
  navigator.requestMIDIAccess().then(midiAccessAllowed,midiAccessDenied)
}

function keyConfig(lane,type,newKey){
  config[lane][type]=newKey;
}

function setup() {
  // fullscreen canvas
  createCanvas(windowWidth, windowHeight);
  fps = 60;
  frameRate(fps);
  loadSong();
  score = 0;
  playerScore = {0: 0, 50: 0, 100: 0, 300: 0}
  notesOnScreen = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []}
  hitNotes = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []}
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
  image(bg, 0, 0, width, height);
  background(0,0,0,100)
  songFrame++;

  //show song frame counter
  fill(0);
  textSize(32);
  text("time: " + songFrame, 10, 30);
  

  //drawing hit circles/projectiles based on frame number
  renderNotes();
  drawPlayer(playerState, width*0.25,height*0.9,height*0.9);

  // process input hit timing
  checkLateNotes();
  processHitTiming();

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
    }
  }
}

function processHitTiming() {
  if (currentNotesPressed.length > 0 && notesOnScreen[currentNotesPressed[0]].length > 0) {
    while (currentNotesPressed.length > 0) {
      let score = calculateScore(songFrame, currentNotesPressed[0], notesOnScreen[currentNotesPressed[0]][0])
      // console.log("score: ", score);
      renderFeedback(score);
      hitNotes[currentNotesPressed[0]].push(notesOnScreen[currentNotesPressed[0]][0]);
      notesOnScreen[currentNotesPressed[0]].shift();
      currentNotesPressed.shift();
      playerScore[score]++;
      
    }
  }
}

function calculateScore(songFrame, notePressed, latestNote) {
  let frame_duration = 1000 / fps;
  let goodHitWindow = Math.ceil((80 - (overallDifficulty * 6)) / frame_duration);
  let midHitWindow = Math.ceil((140 - (overallDifficulty * 8)) / frame_duration);
  let badHitWindow = Math.ceil((200 - (overallDifficulty * 10)) / frame_duration);
  let hitTiming = abs(latestNote - songFrame);
  console.log("hitTiming: " + latestNote + " - " + songFrame + " = " + hitTiming + " <= (" + goodHitWindow + ", " + midHitWindow + ", " + badHitWindow + ")");
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
  overallDifficulty = jsonData.overallDifficulty;
  healthDrain = jsonData.healthDrain;
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
    if (!currentNotesPressed.includes(note)) {
      inputPressed(note);
    }
  } else  {
    inputReleased(note);
  }
}

function keyPressed(){
  //if key from 1-8
  if (keyCode >= 49 && keyCode <= 56){
    inputPressed(keyCode-49);
  }
}

function keyReleased(){
    //if key from 1-8
    if (keyCode >= 49 && keyCode <= 56){
      inputReleased(keyCode-49);
    }
}

function inputPressed(note){ // merges both kb and midi input
  currentNotesPressed.push(note);
  // console.log("pressed: "+ note);
  // console.log(currentNotesPressed);
}

function inputReleased(note){ // merges both kb and midi input
  currentNotesPressed = currentNotesPressed.filter(n => n != note);
  // console.log("released: "+ note);
  // console.log(currentNotesPressed);
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
    scoreFeedback = ['0', 60];
  } else if (feedback == 50) {
    scoreFeedback = ['50', 60];
  } else if (feedback == 100) {
    scoreFeedback = ['100', 60];
  } else if (feedback == 300) {
    scoreFeedback = ['300', 60];
  }
}

function drawScore() {
  if (scoreFeedback[1] > 30) {
    fill(0);
    stroke(0);
    text(scoreFeedback[0], width*0.5, height*0.5);
    scoreFeedback[1]--;
  } else if (scoreFeedback[1] > 0) {
    console.log(scoreFeedback[1]*255 / 60);
    fill(0, 0, 0, scoreFeedback[1]*255 / 60);
    stroke(0, 0, 0, scoreFeedback[1]*255 / 60);
    text(scoreFeedback[0], width*0.5, height*0.5);
    scoreFeedback[1]--;
  }
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

function makeShadow(img, sigma, shadowColor, opacity) {
  // Gaussian goes to approx. 0 at 3sigma
  // away from the mean; pad image with
  // 3sigma on all sides to give space
  const newW = img.width + 6 * sigma;
  const newH = img.height + 6 * sigma;
  const g = createGraphics(newW, newH);
  
  g.imageMode(CENTER);
  g.translate(newW/2, newH/2);
  //g.tint(0, 0, 0, );
  g.image(img, 0, 0);
  g.filter(BLUR, sigma);
  
  const shadow = g.get();
  const c = color(shadowColor);
  shadow.loadPixels();
  const numVals = 4 * shadow.width * shadow.height;
  for (let i = 0; i < numVals; i+=4) {
    shadow.pixels[i + 0] = c.levels[0];
    shadow.pixels[i + 1] = c.levels[1];
    shadow.pixels[i + 2] = c.levels[2];
    shadow.pixels[i + 3] *= opacity;
  }
  shadow.updatePixels();
  
  g.remove();
  return shadow;
}