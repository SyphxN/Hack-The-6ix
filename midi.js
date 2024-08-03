if (navigator.requestMIDIAccess){
    navigator.requestMIDIAccess().then(success,failure)
}

function success(midiAccess){
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
    if(noteEvent == 144){
    switch(note){
        case 44:
            console.log("KICK");
            break;
        case 47:
            console.log("CLOSED HI-HAT");
            break;
        case 45:
            console.log("SNARE");
            break;
        case 46:
            console.log("FLOOR TOM");
            break;
        case 49:
            console.log("HIGH TOM");
            break;
        case 48:
            console.log("CRASH");
            break;
        case 50:
            console.log("OPEN HI-HAT");
            break;
        case 51:
            console.log("RIDE");
            break;
    }
}
}

function failure(){
    console.log("Could not connect to any midi device.")
}