'use strict'

//const variables 
//  levels
const LEVEL_EASY_SIZE = 4
const LEVEL_EASY_MINES = 2

const LEVEL_MEDIUM_SIZE = 8
const LEVEL_MEDIUM_MINES = 14

const LEVEL_EXPERT_SIZE = 12
const LEVEL_EXPERT_MINES = 32

//  cell contents
const EMPTY = ''
const MINE = '💣'
// const MINE = '●'
const FLAG = '🚩'

//smiley
const SMILEY_LOSE = '🤯'
const SMILEY_WIN = '😎'
const SMILEY_NORMAL = '😀'

//bonus
const LIFE = '❤️'
const HINT = '💡'
const SAFE_CELL = '🔐'

//global variables
var gHintMode = false
var gManualMinesMode = false
var gManualMinesModeCount = 0
var gSevenBoomMode = false
var gSafeClicks = 3
var gMegaHintMode = false
var gMegaHintModeAreaClicks = []
var gDate
var gTimerInterval
var gBoard = []
var gAllEmptyCells = []
var gAllMinesCells = []
var gCellsToUndo = []
var gExpandStepsRecord = []
var gMinesAreSet = false
var gLevel = {
    SIZE: LEVEL_EASY_SIZE,
    MINES: LEVEL_EASY_MINES,
}

var gGame = {
    isOn: false,
    shownCount: (gLevel.SIZE ** 2) - gLevel.MINES,
    markedCount: gLevel.MINES,
    secsPassed: 0,
    livesLeft: 1,
    hintsLeft: 3
}

//called when page loads
function initGame() {
    //stoping the context manue showing on mouse right click
    window.addEventListener("contextmenu", function (e) { e.preventDefault(); })

    gHintMode = false
    gGame = resetGame()

    gLevel.SIZE === LEVEL_EASY_SIZE ? gGame.livesLeft = 2 : (gLevel.SIZE === LEVEL_MEDIUM_SIZE ? gGame.livesLeft = 3 : 4)
    var elSpanLives = document.querySelector('.lives span')
    elSpanLives.innerText = gGame.livesLeft

    gBoard = buildBoard()
    gGame.isOn = true
    renderBoard()
    console.table(gBoard)
}

//Builds the board, Set mines at random locati
// Call setMinesNegsCount(), Return the created board
function buildBoard() {
    var board = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = createCell()
            gAllEmptyCells.push({ i, j })
        }
    }
    return board
}

//called from the build board function after first click of the user
function createCell() {
    return {
        minesAroundCount: 0,
        isShown: false, //content revealed
        isMine: false, //mine ot not (empty)
        isMarked: false //flagged or not
    }
}

// Count mines around each cell and set the cell's minesAroundCount
function setMinesNegsCount(board) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            // console.log(i, j)

            board[i][j].minesAroundCount = countNegsMines(i, j)
        }
    }
}

//setting mines randomly
function setRandomMines(board) {

    if (gManualMinesMode === true) return
    var minesCount = gLevel.MINES

    while (minesCount > 0) {
        var randomIdx = getRandomInt(0, gAllEmptyCells.length)
        board[gAllEmptyCells[randomIdx].i][gAllEmptyCells[randomIdx].j].isMine = true
        var mineCell = gAllEmptyCells.splice(randomIdx, 1)
        gAllMinesCells.push(...mineCell)
        --minesCount
    }
    gMinesAreSet = true
}

//countin the mines around each cell
function countNegsMines(iIdx, jIdx) {
    var minesCount = 0

    for (var i = iIdx - 1; i < iIdx + 2; i++) {
        for (var j = jIdx - 1; j < jIdx + 2; j++) {

            if ((i === iIdx && j === jIdx) || i < 0 || j < 0 || i >= gLevel.SIZE || j >= gLevel.SIZE) continue
            else {
                gBoard[i][j].isMine ? ++minesCount : minesCount
            }
        }
    }
    return minesCount
}

// Render the board as a <table> to the page
function renderBoard() {
    var strHtml = ''

    for (var i = 0; i < gBoard.length; i++) {
        var row = gBoard[i]
        strHtml += '<tr>\n'

        for (var j = 0; j < row.length; j++) {
            var cell = row[j]

            var cellBgcClass = (i + j) % 2 ? 'green' : 'lightgreen'
            var tdId = `cell-${i}-${j}`

            var fontColor = cell.isMine === true ? 'black' : (cell.minesAroundCount === 1 ? '#1976d2' : (cell.minesAroundCount === 2 ? '#388e3c' : (cell.minesAroundCount === 3 ? '#d32f2f' : (cell.minesAroundCount === 4 ? '#ad6ba0' : (cell.minesAroundCount === 5 ? '#FF4D00' : (cell.minesAroundCount === 6 ? '#A08600' : '#CC1DAC'))))))
            strHtml += `\t<td id="${tdId}" onmouseup="cellClicked(this, event)" style="color:${fontColor}" class="${cellBgcClass}"></td>\n`
        }
        strHtml += '</tr>\n'
    }

    var elMat = document.querySelector('.game-board')
    elMat.innerHTML = strHtml
}

// actions to execute after a cell on the boar =d
function cellClicked(elCell, event) {
    if (gGame.isOn === false) return
    if (gHintMode === true) {
        initHintMode(elCell)
        return
    }

    if (gManualMinesMode === true) {

        console.log('clicked')
        setManuelMines(elCell)
        return

    }
    if (gMegaHintMode === true && gMinesAreSet === true) {


        if (gMegaHintModeAreaClicks.length < 2) {
            alertUser('Choose area to reveal from left to right')
            console.log('mega hint mode is on:', gMegaHintModeAreaClicks.length)

            gMegaHintModeAreaClicks.push(elCell.getAttribute('id'))
            console.log(elCell.getAttribute('id'))

            console.log('click')


        }

        if (gMegaHintModeAreaClicks.length === 2) {

            console.log('mega hint mode is on:', gMegaHintModeAreaClicks.length === 2)
            megaHint(gMegaHintModeAreaClicks)
        }

        return

    }
    if (gSevenBoomMode === true) {
        sevenBoom()
    }

    if (gGame.secsPassed === 0) {
        clearInterval(gTimerInterval)
        gDate = new Date();
        gTimerInterval = setInterval(timer, 31)

        gGame.isOn = true

        if (event.button === 0) {
            firstClickArea(elCell)
            setRandomMines(gBoard)
            setMinesNegsCount(gBoard)
            renderBoard(gBoard)
        }
    }

    var id = elCell.getAttribute('id').split('-')

    var i = +id[1]
    var j = +id[2]

    if (gBoard[i][j].isShown) return

    if (event.button === 2) {
        cellMarked(elCell, i, j)
        return

    } else if (event.button === 0) {

        if (gBoard[i][j].isMarked === true) return

        if (gBoard[i][j].isMine === true) {

            --gGame.livesLeft
            var elSpanLives = document.querySelector('.lives span')
            elSpanLives.innerText = gGame.livesLeft

            if (gGame.livesLeft > 0) {

                var selector = selectorConstructor(i, j)
                var elCell = document.querySelector('#' + selector)

                elCell.style.backgroundColor = randomColor()
                elCell.innerHTML = MINE
                elCell.classList.add('mine')

                --gGame.markedCount

                gCellsToUndo.push([selector])

                checkGameOver()

                return

            } else {

                revealMines()
                gameOver()
                return
            }
        }

        if (gBoard[i][j].minesAroundCount === 0) {

            expandShown(i, j)

            gCellsToUndo.push(gExpandStepsRecord)
            gExpandStepsRecord = []

        } else {
            var selector = selectorConstructor(i, j)
            elCell.innerHTML = gBoard[i][j].minesAroundCount
            elCell.classList.add('content-shown')
            gBoard[i][j].isShown = true
            --gGame.shownCount
            gCellsToUndo.push([selector])
        }
        var bgcColor = (i + j) % 2 ? '#e5c29f' : '#d7b899'
        elCell.style.backgroundColor = bgcColor
    }

    if (gCellsToUndo.length > 0) {
        var elBtn = document.querySelector('.undo')
        elBtn.removeAttribute('disabled')
    }
    checkGameOver()
}

//defining the mine free area areound users first click
function firstClickArea(elCell) {
    var id = elCell.getAttribute('id').split('-')

    var elBtn = document.querySelector('.hints')
    elBtn.removeAttribute('disabled')

    var iIdx = +id[1]
    var jIdx = +id[2]

    for (let i = -1 + iIdx; i < iIdx + 2; i++) {
        for (let j = -1 + jIdx; j < jIdx + 2; j++) {

            for (let t = 0; t < gAllEmptyCells.length; t++) {

                if (gAllEmptyCells[t].i === i && gAllEmptyCells[t].j === j) gAllEmptyCells.splice(t, 1)

            }
        }
    }
}

// Called on right click to mark a cell (suspected to be a mine)
// Search the web (and implement) how to hide the
// context menu on right click
function cellMarked(elCell, i, j) {

    if (elCell.innerHTML !== FLAG) {
        gBoard[i][j].isMarked = true
        elCell.innerHTML = FLAG

        if (gBoard[i][j].isMine === true) {
            --gGame.markedCount
        }

    } else if (elCell.innerHTML === FLAG) {
        gBoard[i][j].isMarked = false
        elCell.innerHTML = EMPTY
        if (gBoard[i][j].isMine === true) ++gGame.markedCount
    }
    checkGameOver()
}

// When user clicks a cell with no mines around, we need to open
// not only that cell, but also its neighbors.
function expandShown(iIdx, jIdx) { //{0, 0}

    if (gBoard[iIdx][jIdx].minesAroundCount === 0 && gBoard[iIdx][jIdx].isShown === true) return
    //update model

    if (gBoard[iIdx][jIdx].isShown === false) {
        gBoard[iIdx][jIdx].isShown = true
        --gGame.shownCount
        //update DOM
        var selector = selectorConstructor(iIdx, jIdx)
        var elCell = document.querySelector('#' + selector)
        var bgcColor = (iIdx + jIdx) % 2 ? '#e5c29f' : '#d7b899'
        gExpandStepsRecord.push(selector)

        //update style
        elCell.style.backgroundColor = bgcColor
        elCell.classList.add('content-shown')
        elCell.innerHTML = gBoard[iIdx][jIdx].minesAroundCount === 0 ? EMPTY : gBoard[iIdx][jIdx].minesAroundCount

    }

    //recursion
    if (gBoard[iIdx][jIdx].minesAroundCount !== 0) return

    for (var i = iIdx - 1; i < iIdx + 2; i++) {
        for (var j = jIdx - 1; j < jIdx + 2; j++) { // {-1, -1 }

            if (i < 0 || j < 0 || i >= gLevel.SIZE || j >= gLevel.SIZE) {
                continue

            } else {
                expandShown(i, j)
            }
        }
    }
}
//update level to user choice
function updateLevel(elBtn, level) {

    gManualMinesMode = false
    resetGame()

    switch (elBtn, level) {
        case 0:
            gLevel.SIZE = LEVEL_EASY_SIZE
            gLevel.MINES = LEVEL_EASY_MINES
            gGame.livesLeft = 1
            break
        case 1:
            gLevel.SIZE = LEVEL_MEDIUM_SIZE
            gLevel.MINES = LEVEL_MEDIUM_MINES
            gGame.livesLeft = 2
            break;
        case 2:
            gLevel.SIZE = LEVEL_EXPERT_SIZE
            gLevel.MINES = LEVEL_EXPERT_MINES
            gGame.livesLeft = 3
            break;
        default:
            break;
    }

    var elBtnDropdown = document.querySelector('.dropbtn')
    elBtnDropdown.innerText = elBtn.innerText

    initGame()
}

//resetting variables when statring a new game
function resetGame() {
    clearInterval(gTimerInterval)

    gGame.secsPassed = 0
    gGame.isOn = false
    gAllEmptyCells = []
    gCellsToUndo = []
    gExpandStepsRecord = []
    gBoard = []
    gGame.markedCount = gLevel.MINES
    gGame.shownCount = (gLevel.SIZE ** 2) - gLevel.MINES
    gSafeClicks = 3
    gManualMinesModeCount = 0
    gMinesAreSet = false
    gMegaHintMode = false
    gMegaHintModeAreaClicks = []

    var elDiv = document.querySelector('.gameover')
    elDiv.classList.add('hidden')

    var elDivSmiley = document.querySelector('.smiley')
    elDivSmiley.innerText = SMILEY_NORMAL

    var elBtn = document.querySelector('.undo')
    elBtn.setAttribute('disabled', '')

    var elBtn = document.querySelector('.hints')
    elBtn.innerText = 'HINTS LEFT: ' + HINT + HINT + HINT
    elBtn.setAttribute('disabled', '')

    var elBtn = document.querySelector('.safe-click')
    elBtn.innerText = 'SAFE CLICKS 3'
    elBtn.removeAttribute('disabled')

    var elSpanLives = document.querySelector('.lives span')
    elSpanLives.innerText = gGame.livesLeft

    var elBtn = document.querySelector('.mega-hint')
    elBtn.classList.remove('mega-hint-mode')
    elBtn.removeAttribute('disabled')

    var elBtn = document.querySelector('.exterminator')
    elBtn.removeAttribute('disabled')

    if (gManualMinesMode === false) {
        var elBtn = document.querySelector('.manual-mines')
        elBtn.classList.remove('manual-mines-mode')
        elBtn.removeAttribute('disabled')
    }

    return {
        isOn: false,
        shownCount: (gLevel.SIZE ** 2) - gLevel.MINES,
        markedCount: gLevel.MINES,
        secsPassed: 0,
        secsPassed: 0,
        livesLeft: 3,
        hintsLeft: 3
    }
}

// Game ends when all mines are marked, and all the other cells are shown
function checkGameOver() {

    if (gGame.markedCount === 0 && gGame.shownCount === 0) {
        gameOver()
    }
}

//setting model and DOM parameters when game is over
function gameOver() {
    clearInterval(gTimerInterval)


    gGame.isOn = false
    console.log('GAME OVER')

    var elDiv = document.querySelector('.gameover')

    elDiv.innerText = (gGame.markedCount === 0 && gGame.shownCount === 0) ? 'You Saved the Planet!' : 'BOOM! - YOU DEAD!'
    elDiv.classList.remove('hidden')
    setTimeout(() => {
        alertUser('Click on the smiley to refresh')
    }, 2000);

    var elDivSmiley = document.querySelector('.smiley')
    elDivSmiley.innerText = (gGame.markedCount === 0 && gGame.shownCount === 0) ? SMILEY_WIN : SMILEY_LOSE

}
//creating a selector from cel indexes
function selectorConstructor(iIdx, jIdx) {

    return `cell-${iIdx}-${jIdx}`

}
//reveal all mines when losing
function revealMines() {

    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {

            if (gBoard[i][j].isMine === true) {
                gBoard[i][j].isShown = true

                var selector = selectorConstructor(i, j)

                var elCell = document.querySelector('#' + selector)
                elCell.style.backgroundColor = randomColor()
                elCell.innerHTML = MINE
                elCell.classList.add('mine')
            }
        }
    }
}

//initiate hint mode
function initHintMode(elCell) {

    if (gGame.hintsLeft < 0) return

    if (elCell === null) {
        if (gHintMode === true) return

        gHintMode = true
        --gGame.hintsLeft
        var elBtn = document.querySelector('.hints')
        elBtn.classList.add('hints-mode')
        switch (gGame.hintsLeft) {
            case 2:
                elBtn.innerText = 'HINTS LEFT: ' + HINT + HINT

                break;
            case 1:
                elBtn.innerText = 'HINTS LEFT: ' + HINT

                break;
            case 0:
                elBtn.innerText = 'NO MORE HINTS'
                elBtn.setAttribute('disabled', '')

                break;

            default:
                break;
        }

    } else {
        var id = elCell.getAttribute('id').split('-')
        var iIdx = +id[1]
        var jIdx = +id[2]

        for (let i = -1 + iIdx; i < iIdx + 2; i++) {
            for (let j = -1 + jIdx; j < jIdx + 2; j++) {
                if (i < 0 || j < 0 || i >= gLevel.SIZE || j >= gLevel.SIZE || gBoard[i][j].isShown === true || gBoard[i][j].isMarked === true) continue //(i === iIdx && j === jIdx)
                var selector = selectorConstructor(i, j)
                var elHintCell = document.querySelector('#' + selector)
                var bgcColor = (i + j) % 2 ? '#e5c29f' : '#d7b899'

                //update style
                elHintCell.style.backgroundColor = bgcColor
                elHintCell.classList.add('content-shown')
                elHintCell.innerHTML = gBoard[i][j].isMine === true ? MINE : (gBoard[i][j].minesAroundCount === 0 ? EMPTY : gBoard[i][j].minesAroundCount)

                setTimeout(() => {
                    gHintMode = false

                    var selector = selectorConstructor(i, j)
                    var elHintCell = document.querySelector('#' + selector)
                    var bgcColor = (i + j) % 2 ? '#aad751' : '#a2d149'

                    //update style
                    elHintCell.style.backgroundColor = bgcColor
                    elHintCell.classList.remove('content-shown')
                    elHintCell.innerHTML = EMPTY

                    var elBtn = document.querySelector('.hints')
                    elBtn.classList.remove('hints-mode')

                }, 1000)

            }
        }

    }

}

function safeCell(elCell) {

    if (gSafeClicks === 0) return
    --gSafeClicks


    elCell.innerText = 'SAFE CLICKS  ' + gSafeClicks

    if (gSafeClicks === 0) elCell.setAttribute('disabled', '')

    var counter = gAllEmptyCells.length - 1

    do {
        var randomIdx = getRandomInt(0, gAllEmptyCells.length)
        console.log(gAllEmptyCells[randomIdx])
        --counter
    } while (gBoard[gAllEmptyCells[randomIdx].i][gAllEmptyCells[randomIdx].j].isShown === true || counter === 0)

    var selector = selectorConstructor(gAllEmptyCells[randomIdx].i, gAllEmptyCells[randomIdx].j)
    console.log(selector)
    var elCell = document.querySelector('#' + selector)
    elCell.innerText = SAFE_CELL

    setTimeout(() => {
        var elCell = document.querySelector('#' + selector)
        elCell.innerText = EMPTY

    }, 1000);


}
//Undo previous steps
function undoLastReveal() {
    if (gGame.isOn === false) {
        var elBtn = document.querySelector('.undo')
        elBtn.setAttribute('disabled', '')

        return
    }

    if (gCellsToUndo.length === 0) {
        return
    }

    for (let i = 0; i < gCellsToUndo[gCellsToUndo.length - 1].length; i++) {
        console.log(gCellsToUndo[gCellsToUndo.length - 1])
        var selector = gCellsToUndo[gCellsToUndo.length - 1][i]
        var id = selector.split('-')
        console.log(id)

        var iIdx = +id[1]
        var jIdx = +id[2]
        console.log(selector, iIdx, jIdx)

        //update Model
        gBoard[iIdx][jIdx].isShown = false

        var elCell = document.querySelector('#' + selector)
        var bgcColor = ((iIdx + jIdx) % 2) ? '#aad751' : '#a2d149'
        console.log((iIdx + jIdx) % 2)

        //update style
        elCell.style.backgroundColor = bgcColor
        elCell.classList.remove('content-shown')
        elCell.classList.remove('mine')
        elCell.innerHTML = EMPTY
    }
    if (gCellsToUndo.length >= 1) {
        gCellsToUndo.pop()

    }

    if (gCellsToUndo.length === 0) {
        var elBtn = document.querySelector('.undo')
        elBtn.setAttribute('disabled', '')

        return
    }

}

function setManuelMines(elCell = null) {

    if (elCell === null) {
        gManualMinesMode = true
        var elBtn = document.querySelector('.manual-mines')
        elBtn.classList.add('manual-mines-mode')
        alertUser(`Manaul mode is on\nSet ${gLevel.MINES} mines manualy!`)
        gManualMinesModeCount = 0
        initGame()
        return
    }

    console.log(gLevel.MINES)

    if (gManualMinesModeCount <= gLevel.MINES) {

        var id = elCell.getAttribute('id').split('-')

        var i = +id[1]
        var j = +id[2]

        if (gBoard[i][j].isMine === true) return

        gBoard[i][j].isMine = true

        for (let t = 0; t < gAllEmptyCells.length; t++) {

            if (gAllEmptyCells[t].i === i && gAllEmptyCells[t].j === j) {
                var mineCell = gAllEmptyCells.splice(t, 1)
                gAllMinesCells.push(...mineCell)
            }
        }
        ++gManualMinesModeCount
        console.log(gManualMinesModeCount)

        elCell.innerText = MINE
        setTimeout(() => {
            elCell.innerText = EMPTY
        }, 2000);

    }

    if (gManualMinesModeCount === gLevel.MINES) {
        gMinesAreSet = true
        alertUser(`All mines are set!`)

        var elBtn = document.querySelector('.manual-mines')
        elBtn.classList.remove('manual-mines-mode')
        elBtn.setAttribute('disabled', '')

        setMinesNegsCount(gBoard)
        renderBoard(gBoard)

        clearInterval(gTimerInterval)
        gDate = new Date()
        gTimerInterval = setInterval(timer, 31)

        gGame.isOn = true
        gManualMinesMode = false

    }
}

function sevenBoom() {
    if (gSevenBoomMode === false) {
        gSevenBoomMode = true

        var elBtn = document.querySelector('.manual-mines')
        elBtn.setAttribute('disabled', '')
        alertUser('Seven BOOM mode is on')
        initGame()
        return

    } else {
        for (var i = 0; i < gAllEmptyCells.length; i++) {
            if (i % 7 === 0) {
                var iIdx = gAllEmptyCells[i].i
                var jIdx = gAllEmptyCells[i].j
                gBoard[iIdx][jIdx].isMine = true
            }
        }

        setMinesNegsCount(gBoard)
        renderBoard(gBoard)

        clearInterval(gTimerInterval)
        gDate = new Date()
        gTimerInterval = setInterval(timer, 31)

        gGame.isOn = true
        gSevenBoomMode = false
    }
}

function megaHint(gMegaHintModeAreaClicks = null) {
    if (gMinesAreSet === false) {
        alertUser('Start playing\nor set mines manualy to continue')
        return
    }

    if (gMegaHintModeAreaClicks === null) {
        gMegaHintMode = true

        var elBtn = document.querySelector('.mega-hint')
        elBtn.classList.add('mega-hint-mode')
        alertUser('Mega Hint Mode is ON')
        return

    } else {
        var elBtn = document.querySelector('.mega-hint')
        elBtn.classList.remove('mega-hint-mode')
        elBtn.setAttribute('disabled', '')

        console.log(gMegaHintModeAreaClicks)

        //TODO---------------------------------------

        var id1 = gMegaHintModeAreaClicks[0].split('-')
        console.log(id1)
        var iIdx1 = +id1[1]
        var jIdx1 = +id1[2]
        var id2 = gMegaHintModeAreaClicks[1].split('-')
        console.log(id2)
        var iIdx2 = +id2[1]
        var jIdx2 = +id2[2]

        console.log(iIdx1, jIdx1, iIdx2, jIdx2)

        var iDiff = iIdx2 - iIdx1
        var jDiff = jIdx2 - jIdx1

        console.log(iDiff, jDiff)

        for (var i = iIdx1; i <= iIdx1 + iDiff; i++) {
            for (var j = jIdx1; j <= jIdx1 + jDiff; j++) {
                if (i < 0 || j < 0 || i >= gLevel.SIZE || j >= gLevel.SIZE || gBoard[i][j].isShown === true || gBoard[i][j].isMarked === true) continue //(i === iIdx && j === jIdx)
                console.log(i, j)

                var selector = selectorConstructor(i, j)
                var elHintCell = document.querySelector('#' + selector)
                var bgcColor = (i + j) % 2 ? '#e5c29f' : '#d7b899'

                //update style
                elHintCell.style.backgroundColor = bgcColor
                elHintCell.classList.add('content-shown')
                elHintCell.innerHTML = gBoard[i][j].isMine === true ? MINE : (gBoard[i][j].minesAroundCount === 0 ? EMPTY : gBoard[i][j].minesAroundCount)

            }
        }

        setTimeout(() => {

            for (var i = iIdx1; i <= iIdx1 + iDiff; i++) {
                for (var j = jIdx1; j <= jIdx1 + jDiff; j++) {
                    if (i < 0 || j < 0 || i >= gLevel.SIZE || j >= gLevel.SIZE || gBoard[i][j].isShown === true || gBoard[i][j].isMarked === true) continue //(i === iIdx && j === jIdx)
                    console.log(i, j)
                    var selector = selectorConstructor(i, j)
                    var elHintCell = document.querySelector('#' + selector)
                    var bgcColor = (i + j) % 2 ? '#aad751' : '#a2d149'

                    //update style
                    elHintCell.style.backgroundColor = bgcColor
                    elHintCell.classList.remove('content-shown')
                    elHintCell.innerHTML = EMPTY

                }
            }

        }, 15000)

        //TODO-------------------

        gMegaHintMode = false
        gMegaHintModeAreaClicks = []

    }

}

function exterminator() {
    if (gMinesAreSet === false) {
        alertUser('Start playing\nor set mines manualy to continue')
        return
    } else if (gLevel.SIZE === LEVEL_EASY_SIZE) {
        alertUser('This function is available in Medium and Expert levels only')
        return
    }

    var i = 0

    while (i < 3) {
        var randomIdx = getRandomInt(0, gAllMinesCells.length)
        var mineCoordsToRemove = gAllMinesCells[randomIdx]

        if (gBoard[mineCoordsToRemove.i][mineCoordsToRemove.j].isShown === true) continue

        gBoard[mineCoordsToRemove.i][mineCoordsToRemove.j].isMine = false
        gAllMinesCells.splice(randomIdx, 1)
        gLevel.MINES -= 1
        i++
    }

    countNegsMines(gBoard)

    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            var selector = selectorConstructor(i, j)

            var elCell = document.querySelector('#' + selector)
            var fontColor = cell.isMine === true ? 'black' : (cell.minesAroundCount === 1 ? '#1976d2' : (cell.minesAroundCount === 2 ? '#388e3c' : (cell.minesAroundCount === 3 ? '#d32f2f' : (cell.minesAroundCount === 4 ? '#ad6ba0' : (cell.minesAroundCount === 5 ? '#FF4D00' : (cell.minesAroundCount === 6 ? '#A08600' : '#CC1DAC'))))))

            elCell.style.color = fontColor

            if (gBoard[i][j].isShown) {
                elCell.innerText = gBoard[i][j].minesAroundCount === 0 ? EMPTY : gBoard[i][j].minesAroundCount

            }

        }
    }

    var elBtn = document.querySelector('.exterminator')
    elBtn.setAttribute('disabled', '')



    alertUser('Extermination completed')

}
