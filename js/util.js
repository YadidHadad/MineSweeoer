'use strict'

//setting local storage to keep best results
function setlocalStorage() {

    if (localStorage.highScoresEasy === undefined) localStorage.setItem('highScoresEasy', 1000)
    if (localStorage.highScoresMedium === undefined) localStorage.setItem('highScoresMedium', 1000)
    if (localStorage.highScoresExpert === undefined) localStorage.setItem('highScoresExpert', 1000)
}

//checking if current high score is higher tham the saved one
function checkHighScore(score) {

    setlocalStorage()

    var bestScore = ''
    var storageSelector

    switch (gLevel.SIZE) {
        case LEVEL_EASY_SIZE:
            storageSelector = 'highScoresEasy'
            bestScore = localStorage.getItem('highScoresEasy') ?? []
            break;
        case LEVEL_MEDIUM_SIZE:
            storageSelector = 'highScoresMedium'
            bestScore = localStorage.getItem('highScoresMedium') ?? []
            break;
        case LEVEL_EXPERT_SIZE:
            storageSelector = 'highScoresExpert'
            bestScore = localStorage.getItem('highScoresExpert') ?? []
            break;
        default:
            break;
    }

    if (+score < +bestScore) {

        localStorage.setItem(storageSelector, score)
        // saveHighScore(score, bestScore)
        showHighScores();
        alertUser(`New Best Score!`)
    } else {
        alertUser(`Too bad! You didn't beat the best!`)
    }
}

function showHighScores() {
    var bestScore

    document.getElementById('best-score-easy').innerText = localStorage.getItem('highScoresEasy')
    document.getElementById('best-score-medium').innerText = localStorage.getItem('highScoresMedium')
    document.getElementById('best-score-expert').innerText = localStorage.getItem('highScoresExpert')


    changeBGC('#best-score-easy')
    changeBGC('#best-score-easy-title')
    changeBGC('#best-score-medium')
    changeBGC('#best-score-medium-title')
    changeBGC('#best-score-expert')
    changeBGC('#best-score-expert-title')
    changeBGC('#best-score-title')

    var elDiv = document.querySelector('.best-score-list')
    elDiv.classList.toggle('hidden')
    var elTable = document.querySelector('table')
    elTable.classList.toggle('hidden')
}

//starts a timer from the moment of first click
function timer() {
    var diff = Date.now() - gDate
    var inSeconds = (diff / 1000).toFixed(2)

    gGame.secsPassed = inSeconds

    var elTimer = document.querySelector('.timer span')
    elTimer.innerText = ' ' + inSeconds
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min); setmNUA
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

function randomColor() {

    var hue = Math.floor(Math.random() * 360);
    var pastel = 'hsl(' + hue + ', 100%, 50%)';
    return pastel
}

function unAvailableFeature() {
    var elDiv = document.querySelector('.development')
    elDiv.classList.remove('hidden')

    setTimeout(() => {
        var elDiv = document.querySelector('.development')
        elDiv.classList.add('hidden')
    }, 2500);
}

function alertUser(sentence) {
    var elDiv = document.querySelector('.alert')
    elDiv.innerText = sentence
    elDiv.classList.remove('hidden')

    setTimeout(() => {

        var elDiv = document.querySelector('.alert')
        elDiv.classList.add('hidden')

    }, 2000);

}

function darkMode(elBtn) {
    var element = document.body;
    element.classList.toggle("dark-mode");

    elBtn.innerText = (elBtn.innerText === 'DARK MODE') ? 'LIGHT MODE' : 'DARK MODE'
}

function changeBGC(selector) {
    var el = document.querySelector(selector)
    el.style.backgroundColor = randomColor()
}
