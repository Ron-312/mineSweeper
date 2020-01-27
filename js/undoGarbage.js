



function undoClick() {
    if (gCellsClicked.length === 0) return;
    if (!gGame.isOn && gGame.shownCount !== 0) {
        gGame.isOn = true;
    }
    var lastCellClickedObj = gCellsClicked.pop()
    var lastCellClicked = gBoard[lastCellClickedObj.i][lastCellClickedObj.j]
    //    check if the last cell was marked
    if (lastCellClicked.isMarked) {
        gGame.markedCount--
        // update the model
        lastCellClicked.isMarked = false
        // update the DOM
        elCell = document.querySelector('.cell-' + lastCellClickedObj.i + '-' + lastCellClickedObj.j + ' span')
        elCell.style.display = 'none';
        if (lastCellClicked.isMine) {
            elCell.innerText = MINE;
        } else if (!lastCellClicked.minesAroundCount) {
            elCell.innerText = EMPTY;
        } else {
            elCell.innerText = lastCellClicked.minesAroundCount;
        }
    } else if (!lastCellClicked.isMarked && !lastCellClicked.isShown && !lastCellClicked.isOpen) {
        gGame.markedCount++
        // update the model
        lastCellClicked.isMarked = true
        // update the DOM
        elCell = document.querySelector('.cell-' + lastCellClickedObj.i + '-' + lastCellClickedObj.j + ' span')
        elCell.innerHTML = FLAG;
        elCell.style.display = 'block';
    } else if (lastCellClicked.isShown) {
        // check if a mine was clicked
        if (lastCellClicked.isMine) {
            gGame.lives++;
            gGame.brokenHeartsCount--;
            gGame.shownCount--
            if (gGame.lives === 1) {
                gGame.isOn = true;
                document.querySelector('.reset-btn').innerText = '😐'
                gRunTimeInterval = setInterval(runTime, 1000);
                for (var g = 0; g < gMinesSpots.length; g++) {
                    var currMineSpotObj = gMinesSpots[g];
                    var currMineSpot = gBoard[gMinesSpots[g].i][gMinesSpots[g].j]
                    if (!currMineSpot.isShown) {
                        // update the DOM
                        elCell = document.querySelector('.cell-' + currMineSpotObj.i + '-' + currMineSpotObj.j + ' span');
                        elCell.style.display = 'none';
                        elCell.classList.remove('mine');
                    }
                }
                // update the model
                lastCellClicked.isShown = false;
                // update the DOM
                elCell = document.querySelector('.cell-' + lastCellClickedObj.i + '-' + lastCellClickedObj.j + ' span')
                elCell.style.display = 'none';
                elCell.classList.remove('mine');
                setHearts()
            } else if (gGame.lives > 1) {
                // update the model
                lastCellClicked.isShown = false;
                // update the DOM
                elCell = document.querySelector('.cell-' + lastCellClickedObj.i + '-' + lastCellClickedObj.j + ' span')
                elCell.style.display = 'none'
                elCell.classList.add('mine')
                setHearts()
            }
            //check if the cell was not empty
        } else if (lastCellClicked.minesAroundCount) {
            gGame.shownCount--
            document.querySelector('.mines-left').innerText = `Mines left :${gLevel.mines - gGame.brokenHeartsCount}`;
            // update the model
            lastCellClicked.isShown = false;
            // update the DOM
            elCell = document.querySelector('.cell-' + lastCellClickedObj.i + '-' + lastCellClickedObj.j + ' span')
            elCell.style.display = 'none'
            elCell.classList.remove('shown')
        } else {
            expandHide(gBoard, lastCellClickedObj.i, lastCellClickedObj.j)
        }
    }
    document.querySelector('.mines-left').innerText = `Mines left :${gLevel.mines - gGame.brokenHeartsCount}`;
    if(gCellsClicked.length ===0){
        gMinesSpots=[];
    }
}



function expandHide(board, i, j) {
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
                if (currNeg.isShown && !currNeg.isMarked) {
                    currNeg.isShown = false;
                    gGame.shownCount--
                    if (!currNeg.minesAroundCount && currNeg !== board[i][j]) {
                        expandHide(board, g, h)
                    }
                    // update the DOM
                    document.querySelector('.mines-left').innerText = `Mines left :${gLevel.mines - gGame.brokenHeartsCount}`;
                    elCell = document.querySelector('.cell-' + g + '-' + h + ' span')
                    elCell.style.display = 'none'
                    elCell.classList.remove('shown')
                }
            }
        }
    }
}