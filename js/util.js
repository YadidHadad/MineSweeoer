'use strict'


//starts a timer from the moment og first click
function currTime() {

    var diff = Date.now() - gDate
    var inSeconds = (diff / 1000).toFixed(3)

    var elTimer = document.querySelector('.timer')
    elTimer.innerText = inSeconds
}


//every time the user clicks on a cell the function identifies the event and execute the command
function clickCell(event) {

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}