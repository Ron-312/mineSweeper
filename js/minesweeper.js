'use script'

var MINE = '💣'
var EMPTY = ''
var SELECTOR = '.board'
var FLAG = '🚩'
var HEART = '💚'
var BROKEN_HEART = '💔'

var gIsUndo = false;
var gManual = false
var gRunTimeInterval = null;
var gGettingAHint = false;
var gNumOfHintsLeft = 3;
var gNumOfSafeClicksLeft = 3;
//
var gLastMovesBoard = [];
//
var gMinesSpots = []
var gBoard = [];
var gLevel = {}
var gGame = {}

function initGame(size = gLevel.size, mines = gLevel.mines, lives = gLevel.lives) {
    // reset
    gLastMovesBoard = [];
    resetMines()
    gNumOfHintsLeft = 3;
    gNumOfSafeClicksLeft = 3;
    document.querySelector('.hints').innerText = `${gNumOfHintsLeft} Hints Left!`
    document.querySelector('.safeClick').innerHTML = `${gNumOfSafeClicksLeft} Safe clicks Left!`
    gLevel = {
        size: size,
        mines: mines,
        lives: lives
    }
    // show best score
    if ((+localStorage.getItem(`Best-Score ${gLevel.size}`))) {
        document.querySelector('.best-score').innerHTML = `Your best score is: ${+localStorage.getItem(`Best-Score ${gLevel.size}`)} seconds!`;
    } else {
        document.querySelector('.best-score').innerHTML = `You dont have a best score yet!`;
    }
    clearInterval(gRunTimeInterval);
    gRunTimeInterval = 0;
    document.querySelector('.reset-btn').innerText = '😐'
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        brokenHeartsCount: 0,
        secsPassed: 0,
        lives: gLevel.lives
    }
    // show mines left
    setMinesCount()
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
                isMarked: false,
                isOpen: false
            }
            board[i][j] = cell
        }
    }
    return board;
}
function setMines(board, firstPickI, firstPickJ) {
    resetMines();
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
            gMinesSpots.push({ i: x, j: y })
        }
    }

    //TODO- Call setMinesNegsCount()
    setMinesNegsCount(board, gMinesSpots);
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

function manualCellClicked(elCell, i, j) {
    currCell = gBoard[i][j];
    currCell.isMine = true;
    // push the mine spot into an array
    gMinesSpots.push({ i: i, j: j })
    // TODO- Return the created board
    renderMineCell(i, j);
    if (`${gMinesSpots.length}` === gLevel.mines) {
        //TODO- Call setMinesNegsCount()
        setMinesNegsCount(gBoard, gMinesSpots);
        renderBoard(gBoard, SELECTOR);
        document.querySelector('.manual').style.backgroundColor = null;

    }

}
function cellClicked(elCell, i, j) {
    if (!gGame.isOn) return;
    if (gManual && `${gMinesSpots.length}` !== gLevel.mines) {
        manualCellClicked(elCell, i, j)
        return
    }

    if (gGettingAHint) {
        hintCheck(gBoard, i, j)
        return;
    }
    if (gGame.shownCount === 0 && gGame.markedCount === 0 && !gManual &&!gIsUndo) {
        setMines(gBoard, i, j);
    }
    // if first step, start timer and mines
    if (!gRunTimeInterval) {
        gRunTimeInterval = setInterval(runTime, 1000);
    }
    gManual = false;
    // var cellsClicked = gLastMovesBoard.length;
    // var alreadyClicked = false;
    // for (var g = 0; g < cellsClicked; g++) {
    //     if ((j === gCellsClicked[g].j && i === gCellsClicked[g].i) && gBoard[i][j].isShown) {
    //         alreadyClicked = true
    //     }
    // }
    // if (!gCellsClicked.length || alreadyClicked === false) {
    //     gCellsClicked.push({ i: i, j: j })
    // }

    // if (!gLastMovesBoard.length) {
    //     }
    if (!gIsUndo) {
        var newBoard = []
        for (var g = 0; g < gLevel.size; g++) {
            newBoard[g] = []
            for (var h = 0; h < gLevel.size; h++) {
                newBoard[g][h] = {}
                Object.assign(newBoard[g][h], gBoard[g][h]);
                newBoard[g][h].isOpen = false;
            }
        }
        gLastMovesBoard.push(newBoard);
        // gLastMovesBoard.push({i:i,j:j})
    }
    var cell = gBoard[i][j]
    //    check if right or left click
    if (elCell.which === 3) {
        cellMarked(cell, i, j)
    } else if (elCell.which === 1) {
        // dont let double clicks on an open cell to be saved
        if (!gIsUndo) {
            if (cell.isShown || cell.isMarked) return;
        }
        // check if a mine was clicked
        if (isMineClicked(cell, i, j)) return;
        //check if the cell is not empty
        if (cell.minesAroundCount) {
            gGame.shownCount++
            setMinesCount()
            // update the model
            cell.isShown = true;
            cell.isOpen = true;
            // update the DOM
            elCell = document.querySelector('.cell-' + i + '-' + j + ' span')
            elCell.style.display = 'block'
            elCell.classList.add('shown')
        } else {
            // update the current cell and check other cells
            gBoard[i][j].isShown = true;
            gGame.shownCount++
            elCell = document.querySelector('.cell-' + i + '-' + j + ' span')
            elCell.style.display = 'block'
            elCell.classList.add('shown')
            expandShown(gBoard, i, j)
        }
    }
    // check if game over
    if (checkGameWon()) {
        document.querySelector('.reset-btn').innerText = '😜'
        document.querySelector('.best-score').innerHTML = `Your best score is: ${+localStorage.getItem(`Best-Score ${gLevel.size}`)} seconds!`;
        console.log('Won!')
    }
}


function isMineClicked(cell, i, j) {
    if (cell.isMine) {
        gGame.lives--;
        gGame.brokenHeartsCount++;;
        gGame.shownCount++;
        setMinesCount()
        if (!gGame.lives) {
            gGame.isOn = false;
            document.querySelector('.reset-btn').innerText = '🤯';
            clearInterval(gRunTimeInterval);
            gRunTimeInterval = 0;
            cell.isShown = true;
            cell.isOpen = true;
            for (var g = 0; g < gMinesSpots.length; g++) {
                var currMineSpot = gMinesSpots[g];
                elCell = document.querySelector('.cell-' + currMineSpot.i + '-' + currMineSpot.j + ' span')
                elCell.style.display = 'block'
                elCell.classList.add('mine')
            }
            setHearts()
            return true;
        }
        // update the model
        cell.isShown = true;
        cell.isOpen = true;
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
    if (!cell.isMarked || gIsUndo && cellMarked) {
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
                } else if (gBoard[i][j].isShown) {
                    cellsCorrect++
                } else if (gBoard[i][j].isOpen) {
                    cellsCorrect++
                }
            }
        }
        if (cellsCorrect === gLevel.size ** 2) {
            clearInterval(gRunTimeInterval);
            gRunTimeInterval = 0;
            if (localStorage.getItem(`Best-Score ${gLevel.size}`) > gGame.secsPassed || localStorage.getItem(`Best-Score ${gLevel.size}`) === null) {
                localStorage.setItem(`Best-Score ${gLevel.size}`, gGame.secsPassed);
                document.querySelector('.best-score').innerHTML = `Your best score is: ${+localStorage.getItem(`Best-Score ${gLevel.size}`)} seconds!`;
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
                if (!currNeg.isShown && !currNeg.isMarked && !currNeg.isOpen) {
                    currNeg.isOpen = true;
                    gGame.shownCount++
                    if (!currNeg.minesAroundCount && currNeg !== board[i][j]) {
                        expandShown(board, g, h)
                    }
                    // update the DOM
                    setMinesCount()
                    elCell = document.querySelector('.cell-' + g + '-' + h + ' span')
                    elCell.style.display = 'block'
                    elCell.classList.add('shown')
                }
                // debugger
                // if (currNeg.isOpen && gIsUndo || currNeg.isShown && gIsUndo) {
                //     if(currNeg.isShown && gIsUndo){
                //         gGame.shownCount++  
                //     }
                //     elCell = document.querySelector('.cell-' + g + '-' + h + ' span')
                //     elCell.style.display = 'block'
                //     elCell.classList.add('shown')
                //     if (!currNeg.minesAroundCount && currNeg !== board[i][j]) {
                //         expandShown(board, g, h)
                // }
                // }
            }
        }
    }
}

function getAHint() {
    if (gNumOfHintsLeft > 0 && gGame.shownCount ) {
        document.querySelector('.hints').style.backgroundColor = "green";
        gGettingAHint = true;
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
                if (!gBoard[g][h].isMarked) {
                    elCell.style.display = 'block';
                    elCell.classList.add('shown');
                    // hide after a sec
                    setTimeout(hintsHide, 1000, g, h);
                }
            }
        }
        document.querySelector('.hints').style.backgroundColor = null;
        gNumOfHintsLeft--
        document.querySelector('.hints').innerText = `${gNumOfHintsLeft} Hints Left!`
    }
}
function hintsHide(g, h) {
    var elCell = document.querySelector('.cell-' + g + '-' + h + ' span')
    if (!gBoard[g][h].isShown && !gBoard[g][h].isOpen) {
        elCell.style.display = 'none';
        elCell.classList.remove('shown');
    }
    gGettingAHint = false;
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
    if (gNumOfSafeClicksLeft && gGame.shownCount) {
        gNumOfSafeClicksLeft--
        var emptySpots = []
        for (var i = 0; i < gLevel.size; i++) {
            for (var j = 0; j < gLevel.size; j++) {
                var currCell = gBoard[i][j]
                if (!currCell.isMine && !currCell.isShown) {
                    emptySpots.push({ i: i, j: j })
                }
            }
        }
        var safeClickCell = emptySpots[getRandomIntInclusive(0, emptySpots.length - 1)]
        // DOM
        document.querySelector(`.cell-${safeClickCell.i}-${safeClickCell.j}`).classList.add('safe');
        document.querySelector('.safeClick').innerHTML = `${gNumOfSafeClicksLeft} Safe clicks Left!`
        setTimeout(function () {
            document.querySelector(`.cell-${safeClickCell.i}-${safeClickCell.j}`).classList.remove('safe')
        }, 1000)
    } else {
        document.querySelector('.safeClick').style.backgroundColor = 'red';
        setInterval(function () {
            document.querySelector('.safeClick').style.backgroundColor = null;
        }, 1000)
    }
}
function manualInitGame() {
    document.querySelector('.manual').style.backgroundColor = 'green';
    gManual = true;
    var mines = prompt('Pleas enter the number of Mines!')
    var size = prompt('Pleas enter the size of the board!')
    var lives = prompt('Pleas enter the number of Lives!')
    gLevel = {
        size: size,
        mines: mines,
        lives: lives
    }
    clearInterval(gRunTimeInterval)
    gRunTimeInterval = 0;
    document.querySelector('.reset-btn').innerText = '😐'
    // reset
    gMinesSpots = []
    gNumOfHintsLeft = 3;
    gNumOfSafeClicksLeft = 3;
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        brokenHeartsCount: 0,
        secsPassed: 0,
        lives: gLevel.lives
    }
    setMinesCount()
    // This is called when page loads
    gGame.isOn = true;
    // hearts reset
    setHearts();
    // create and render board
    gBoard = buildBoard();
    renderBoard(gBoard, SELECTOR)
}


function resetMines() {
    gMinesSpots = []
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            var currCell = gBoard[i][j];
            // update model 
            currCell.isMine = false
            currCell.minesAroundCount = 0;
            // update Dom
            elCell = document.querySelector('.cell-' + i + '-' + j + ' span');
            elCell.classList.remove('mine');

        }
    }
}
function modeSwitch() {
    if (document.querySelector('.mode-switch').innerText === 'Click to Dark Mode') {
        document.querySelector('.link').href = 'css/dark.css'
        document.querySelector('.mode-switch').innerHTML = 'Click to Light Mode'
    } else {
        document.querySelector('.link').href = 'css/style.css'
        document.querySelector('.mode-switch').innerHTML = 'Click to Dark Mode'
    }
}




// undo another path

function undoClick() {
    if (!gLastMovesBoard.length) return;
    gIsUndo = true;
    // reset gGame
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        brokenHeartsCount: 0,
        secsPassed: gGame.secsPassed,
        lives: gLevel.lives
    }
    gGame.isOn = true;
    document.querySelector('.reset-btn').innerText = '😐'
    if (gRunTimeInterval === 0) {
        gRunTimeInterval = setInterval(runTime, 1000);
    }
    setHearts()
    var lastMoveBoard = gLastMovesBoard.pop()
    gBoard = lastMoveBoard
    // right click cell
    var rightCell = { which: 1 };
    // left click cell
    var leftCell = { which: 3 };
    renderBoard(gBoard, SELECTOR);
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            if (gBoard[i][j].isShown) {
                cellClicked(rightCell, i, j);
            }
            if (gBoard[i][j].isMarked) {
                cellClicked(leftCell, i, j);
            }
        }
    }
    gIsUndo = false;

}
function setMinesCount() {
    document.querySelector('.mines-left').innerText = `Mines left :${gLevel.mines - gGame.brokenHeartsCount}`
}