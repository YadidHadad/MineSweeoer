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
const MINE = '●'
// const MINE = '⚫'
// const MINE = '&#11044;'
// const MINE = '⚫'
const FLAG = '🚩'


//global variables

var gBoard = []
var gTimerIsOn
var gAllCells = []
var gLevel = {
    SIZE: LEVEL_EASY_SIZE,
    MINES: LEVEL_EASY_MINES,
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

//called when page loads
function initGame() {
    //stoping the context manue showing on mouse right click
    window.addEventListener("contextmenu", function (e) { e.preventDefault(); })

    gBoard = buildBoard()
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
    console.table(gBoard)
}

//Builds the board, Set mines at random locati
// Call setMinesNegsCount(), Return the created board
function buildBoard() {
    var board = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            // console.log(i, j)
            board[i][j] = createCell()
            gAllCells.push({ i, j })
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
    setRandomMines(board)

    console.log('setMinesNegsCount')

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {

            board[i][j].minesAroundCount = countNegsMines(i, j)
            // console.log('mines count', i, j, gBoard[i][j].minesAroundCount)
        }
    }
}

function setRandomMines(board) {
    var minesCount = gLevel.MINES

    while (minesCount > 0) {

        var randomIdx = getRandomInt(0, gAllCells.length)
        board[gAllCells[randomIdx].i][gAllCells[randomIdx].j].isMine = true
        --minesCount
    }
}

function countNegsMines(iIdx, jIdx) {
    var minesCount = 0

    for (var i = iIdx - 1; i < iIdx + 2; i++) {
        for (var j = jIdx - 1; j < jIdx + 2; j++) {

            if ((i === iIdx && j === jIdx) || i < 0 || j < 0 || i >= gLevel.SIZE || j >= gLevel.SIZE) continue
            else {
                // console.log(gBoard[i][j].isMine)
                gBoard[i][j].isMine ? ++minesCount : minesCount
                // console.log('mine check')
            }
        }
    }

    return minesCount
}
// Render the board as a <table> to the page

function renderBoard(board) {
    var strHtml = ''

    for (var i = 0; i < board.length; i++) {
        var row = board[i]
        strHtml += '<tr>\n'

        for (var j = 0; j < row.length; j++) {
            var cell = row[j]
            var cellBgcClass = (i + j) % 2 ? 'green' : 'lightgreen'
            var tdId = `cell-${i}-${j}`

            // var cellContent = cell.isShown ? (cell.isMine ? MINE : (cell.minesAroundCount !== +0 ? cell.minesAroundCount : EMPTY)) : EMPTY

            var fontColor = cell.isMine === true ? 'black' : (cell.minesAroundCount === 1 ? '#1976d2' : (cell.minesAroundCount === 2 ? '#388e3c' : (cell.minesAroundCount === 3 ? '#d32f2f' : (cell.minesAroundCount === 4 ? '#ad6ba0' : (cell.minesAroundCount === 5 ? '#FF4D00' : (cell.minesAroundCount === 6 ? '#A08600' : '#CC1DAC'))))))
            // strHtml += `\t<td id="${tdId}" onmouseup="cellClicked(this, event)" style="color:${fontColor}" class="${cellBgcClass}">${cellContent}</td>\n`
            strHtml += `\t<td id="${tdId}" onmouseup="cellClicked(this, event)" style="color:${fontColor}" class="${cellBgcClass}"></td>\n`
        }
        strHtml += '</tr>\n'
    }
    var elMat = document.querySelector('.game-board')
    elMat.innerHTML = strHtml
}

// Called when a cell (td) is clicked
function cellClicked(elCell, event) {
    var id = elCell.getAttribute('id').split('-')
    console.log(id)

    var i = +id[1]
    var j = +id[2]
    // console.log(i, j)
    // console.log()

    if (event.button === 2) {
        cellMarked(elCell, i, j)
        return

    } else if (event.button === 0) {

        if (gBoard[i][j].isMine === true) {
            elCell.innerHTML = MINE
            console.log('Mine revealed')


        } else if (gBoard[i][j].minesAroundCount === 0) {
            console.log('EMPTY CELL')

            expandShown(i, j)

        } else {
            console.log('MINES AROUND')
            elCell.innerHTML = gBoard[i][j].minesAroundCount
            elCell.classList.add('content-shown')
        }
    }

    var bgcColor = (i + j) % 2 ? '#e5c29f' : '#d7b899'
    elCell.style.backgroundColor = bgcColor
}

// Called on right click to mark a cell (suspected to be a mine)
// Search the web (and implement) how to hide the
// context menu on right click
function cellMarked(elCell, i, j) {

    if (elCell.innerHTML !== FLAG) {
        gBoard[i][j].isMarked = true
        elCell.innerHTML = FLAG

    } else if (elCell.innerHTML === FLAG) {
        gBoard[i][j].isMarked = false
        elCell.innerHTML = EMPTY

    }
}

// Game ends when all mines are marked, and all the other cells are shown
function checkGameOver() {

}

// When user clicks a cell with no mines around, we need to open
// not only that cell, but also its neighbors.
function expandShown(iIdx, jIdx) { //{0, 0}

    //update model
    gBoard[iIdx][jIdx].isShown = true

    //update DOM
    var selector = selectorConstructor(iIdx, jIdx)
    var elCell = document.querySelector('#' + selector)
    var bgcColor = (iIdx + jIdx) % 2 ? '#e5c29f' : '#d7b899'

    //update style
    elCell.style.backgroundColor = bgcColor
    elCell.classList.add('content-shown')
    elCell.innerHTML = gBoard[iIdx][jIdx].minesAroundCount === 0 ? EMPTY : gBoard[iIdx][jIdx].minesAroundCount

    //recursion
    console.log(iIdx, jIdx, selector, gBoard[iIdx][jIdx].isShown)

    if (gBoard[iIdx][jIdx].minesAroundCount !== 0) return
    // if (gBoard[iIdx][jIdx].minesAroundCount !== 0 || (gBoard[iIdx][jIdx].minesAroundCount !== 0 && gBoard[iIdx][jIdx].isShown === true)) return null

    for (var i = iIdx - 1; i < iIdx + 2; i++) {
        for (var j = jIdx - 1; j < jIdx + 2; j++) { // {-1, -1 }
            console.log('loop', i, j)

            if (i < 0 || j < 0 || i >= gLevel.SIZE || j >= gLevel.SIZE) {
                continue

            } else {
                expandShown(i, j)
                return

            }
        }
    }
}

// function expandShown(iIdx, jIdx) {




//     console.log('expandShown', iIdx, jIdx)

//     for (var i = iIdx - 1; i < iIdx + 2; i++) {
//         console.log('ROW', i)
//         for (var j = jIdx - 1; j < jIdx + 2; j++) {

//             if (i < 0 || j < 0 || i >= gLevel.SIZE || j >= gLevel.SIZE) {
//                 continue

//             } else {
//                 gBoard[i][j].isShown = true

//                 var selector = selectorConstructor(i, j)
//                 var elCell = document.querySelector('#' + selector)
//                 var bgcColor = (i + j) % 2 ? '#e5c29f' : '#d7b899'

//                 console.log(elCell, selector)
//                 elCell.style.backgroundColor = bgcColor
//                 elCell.classList.add('content-shown')
//                 console.log(i, j, selector)



//             }
//         }
//     }
//     return
// }

//a function set level before buildboard is called, receives board size and mines count
function updateLevel(boardSize = 4, minesCount = 2) {



    return {
        SIZE: boardSize,
        MINES: minesCount
    }

}

function resetGame() {

    return {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }

}

function selectorConstructor(iIdx, jIdx) {

    return `cell-${iIdx}-${jIdx}`

}


