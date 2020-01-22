'use script'

var MINE = '💣'
var EMPTY = ''
var SELECTOR = '.board'
var FLAG = '🚩'
var HEART = '💚'
var BROKEN_HEART = '💔'

var runTimeInterval;
var gettingAHint = false;
var numOfHintsLeft = 3;
var minesSpots = []
var gBoard = [];
var gLevel = {}
var gGame = {}

function initGame(size = gLevel.size, mines = gLevel.mines, lives = gLevel.lives) {
    gLevel = {
        size: size,
        mines: mines,
        lives: lives
    }
    clearInterval(runTimeInterval)
    document.querySelector('.reset-btn').innerText = '😐'
    // reset
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        brokenHeartsCount: 0,
        secsPassed: 0,
        lives: gLevel.lives
    }
    document.querySelector('.score').innerText = gGame.shownCount;
    // This is called when page loads
    gGame.isOn = true;
    // hearts reset
    setHearts();
    // create and render board
    gBoard = buildBoard();
    renderBoard(gBoard, SELECTOR)
}

function buildBoard() {
    //TODO - Builds the board
    var board = [];
    for (var i = 0; i < gLevel.size; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.size; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell
        }
    }
    return board;
}
function setMines(board, firstPickI, firstPickJ) {
    minesSpots = []
    // TODO -Set mines at random locations
    for (var i = 0; i < gLevel.mines; i++) {
        var x = getRandomIntInclusive(0, gLevel.size - 1);
        var y = getRandomIntInclusive(0, gLevel.size - 1);
        var currCell = board[x][y];
        if (currCell.isMine || (x === firstPickI && y === firstPickJ)) {
            i--;
            continue
        } else {
            currCell.isMine = true;
            // push the mine spot into an array
            minesSpots.push({ i: x, j: y })
        }
    }

    //TODO- Call setMinesNegsCount()
    setMinesNegsCount(board, minesSpots);
    // TODO- Return the created board
    renderBoard(gBoard, SELECTOR);
}

function setMinesNegsCount(board, minesSpots) {
    //  TODO-   Count mines around each cell
    // and set the cell's
    // minesAroundCount.
    for (var z = 0; z < minesSpots.length; z++) {
        currMinedCell = minesSpots[z];
        var rowStart = currMinedCell.i - 1
        var rowEnd = currMinedCell.i + 1
        var colStart = currMinedCell.j - 1
        var colEnd = currMinedCell.j + 1
        for (var i = rowStart; i <= rowEnd; i++) {
            if (i < 0 || i >= board.length) continue
            for (var j = colStart; j <= colEnd; j++) {
                if (j < 0 || j >= board.length) continue
                if (currMinedCell.i === i && currMinedCell.j === j) continue
                var currNeg = board[i][j];
                currNeg.minesAroundCount++;
            }
        }
    }
}

// function renderBoard(board) ???

function cellClicked(elCell, i, j) {
    if (!gGame.isOn) return;
    // if first step, start timer and mines
    if (gettingAHint) {
        hintCheck(gBoard, i, j)
        return;
    }
    if (gGame.shownCount === 0) {
        runTimeInterval = setInterval(runTime, 1000);
        setMines(gBoard, i, j);
    }
    var cell = gBoard[i][j]
    //    check if right or left click
    if (elCell.which === 3) {
        cellMarked(cell, i, j)
    } else if (elCell.which === 1) {
        if (cell.isShown || cell.isMarked) return;
        // check if a mine was clicked
        if (isMineClicked(cell, i, j)) return;
        //check if the cell is not empty
        if (cell.minesAroundCount) {
            gGame.shownCount++
            document.querySelector('.score').innerText = gGame.shownCount;
            // update the model
            cell.isShown = true;
            // update the DOM
            elCell = document.querySelector('.cell-' + i + '-' + j + ' span')
            elCell.style.display = 'block'
            elCell.classList.add('shown')
        } else {
            expandShown(gBoard, i, j)
        }
    }

    // check if game over
    if (checkGameWon()) {
        document.querySelector('.reset-btn').innerText = '😜'
        console.log('Won!')
    }
}

function isMineClicked(cell, i, j) {
    if (cell.isMine) {
        gGame.lives--;
        gGame.brokenHeartsCount++;
        gGame.shownCount++
        if (!gGame.lives) {
            gGame.isOn = false;
            document.querySelector('.reset-btn').innerText = '🤯'
            clearInterval(runTimeInterval)
            for (var g = 0; g < minesSpots.length; g++) {
                var currMineSpot = minesSpots[g];
                elCell = document.querySelector('.cell-' + currMineSpot.i + '-' + currMineSpot.j + ' span')
                elCell.style.display = 'block'
                elCell.classList.add('mine')
            }
            setHearts()
            return true;
        }
        // update the model
        cell.isShown = true;
        // update the DOM
        elCell = document.querySelector('.cell-' + i + '-' + j + ' span')
        elCell.style.display = 'block'
        elCell.classList.add('mine')
        setHearts()
        if (checkGameWon()) {
            document.querySelector('.reset-btn').innerText = '😜'
            console.log('Won!')
        }
        return true;
    }
    return false;
}

function cellMarked(cell, i, j) {
    if (cell.isShown) return;
    // TODO -    Called on right click to mark a
    // cell (suspected to be a mine)
    // Search the web (and
    // implement) how to hide the
    // context menu on right click
    var elCell = document.querySelector('.cell-' + i + '-' + j + ' span');
    if (!cell.isMarked) {
        gGame.markedCount++
        // update the model
        cell.isMarked = true;
        elCell.innerHTML = FLAG;
        elCell.style.display = 'block';
        // update the DOM
    } else {
        gGame.markedCount--
        // update the model
        cell.isMarked = false
        // update the DOM
        elCell.style.display = 'none';
        if (cell.isMine) {
            elCell.innerText = MINE;
        } else if (!cell.minesAroundCount) {
            elCell.innerText = EMPTY;
        } else {
            elCell.innerText = cell.minesAroundCount;
        }
    }
}




function checkGameWon() {
    // TODO -    Game Won when all mines are
    // marked and all the other cells
    // are shown
    if (gGame.shownCount + gGame.markedCount === gLevel.size ** 2) {
        var cellsCorrect = 0;
        for (var i = 0; i < gLevel.size; i++) {
            for (var j = 0; j < gLevel.size; j++) {
                if (gBoard[i][j].isMine && gBoard[i][j].isMarked) {
                    cellsCorrect++
                }
                if (gBoard[i][j].isShown) {
                    cellsCorrect++
                }
            }
        }
        if (cellsCorrect === gLevel.size ** 2) {
            clearInterval(runTimeInterval)
            if (localStorage.getItem(`Best-Score ${gLevel.size}`) < gGame.shownCount || localStorage.length === 0) {
                localStorage.setItem(`Best-Score ${gLevel.size}`, gGame.shownCount);
                document.querySelector('.score').innerHTML = localStorage.getItem(`Best-Score ${gLevel.size}`);
            }

            return true;
        } else { return false }
    } else { return false }
}
function runTime() {
    secsPassed = ++gGame.secsPassed
    if (secsPassed < 10) {
        document.querySelector('.timer').innerText = "0" + secsPassed
    } else {
        document.querySelector('.timer').innerText = secsPassed
    }
}
function expandShown(board, i, j) {
    //TODO - When user clicks a cell with no
    // mines around, we need to open
    // not only that cell, but also its
    // neighbors.
    // ---------------------------------
    // NOTE: start with a basic
    // implementation that only opens
    // the non-mine 1
    // st degree
    // neighbors
    // BONUS: if you have the time
    // later, try to work more like the
    // real algorithm (see description
    // at the Bonuses section below)
    // ------------------------------------
    {
        var rowStart = i - 1
        var rowEnd = i + 1
        var colStart = j - 1
        var colEnd = j + 1
        for (var g = rowStart; g <= rowEnd; g++) {
            if (g < 0 || g >= board.length) continue
            for (var h = colStart; h <= colEnd; h++) {
                if (h < 0 || h >= board.length) continue
                var currNeg = board[g][h];
                // update the model
                if (!currNeg.isShown) {
                    currNeg.isShown = true;
                    gGame.shownCount++
                    if (!currNeg.minesAroundCount && currNeg !== board[i][j]) {
                        expandShown(board, g, h)
                    }
                }
                // update the DOM
                document.querySelector('.score').innerText = gGame.shownCount;
                elCell = document.querySelector('.cell-' + g + '-' + h + ' span')
                elCell.style.display = 'block'
                elCell.classList.add('shown')
            }
        }
    }
}

function getAHint() {
    if (numOfHintsLeft > 0) {
        document.querySelector('.hints').style.backgroundColor = "green";
        gettingAHint = true;
    } else {
        document.querySelector('.hints').style.backgroundColor = "red";
        setTimeout(function () {
            document.querySelector('.hints').style.backgroundColor = null;
        }, 1000)
    }
}


function hintCheck(board, i, j) {
    {
        var g;
        var h;
        var rowStart = i - 1
        var rowEnd = i + 1
        var colStart = j - 1
        var colEnd = j + 1
        for (var g = rowStart; g <= rowEnd; g++) {
            if (g < 0 || g >= board.length) continue
            for (var h = colStart; h <= colEnd; h++) {
                if (h < 0 || h >= board.length) continue
                // update the DOM
                var elCell = document.querySelector('.cell-' + g + '-' + h + ' span')
                elCell.style.display = 'block';
                elCell.classList.add('shown');
                // hide after a sec
                setTimeout(hintsHide, 1000, g, h);
            }
        }
        document.querySelector('.hints').style.backgroundColor = null;
        numOfHintsLeft--
        document.querySelector('.hints').innerText = `${numOfHintsLeft} Hints Left!`
    }
}
function hintsHide(g, h) {
    var elCell = document.querySelector('.cell-' + g + '-' + h + ' span')
    if (!gBoard[g][h].isShown) {
        elCell.style.display = 'none';
        elCell.classList.remove('shown');
    }
    gettingAHint = false;
}
function setHearts() {
    strHTML = ''
    for (var i = 0; i < gGame.lives; i++) {
        strHTML += HEART;
    }
    for (var i = 0; i < gLevel.lives - gGame.lives; i++) {
        strHTML += BROKEN_HEART;
    }
    document.querySelector('.lives').innerText = strHTML;
}

function getSafeClick() {
    var emptySpots = []
    for (var i = 0; i < gGame.size; i++) {
        for (var j = 0; j < gGame.size; j++) {
            var currCell = board[i][j]
            if (!currCell.isMine && !currCell.isShown) {
                emptySpots.push({ i: i, j: j })
            }
        }
    }
    var safeClickCell = emptySpots[getRandomIntInclusive(0, emptySpots.length)]
    // DOM
    document.querySelector(`cell-${safeClickCell.i}-${safeClickCell.j}`).classList.add('safe');
    setTimeout.
}