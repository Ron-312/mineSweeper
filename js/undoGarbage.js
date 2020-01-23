




// undo another path

function undoClick() {
    debugger
    var lastMoveBoard = gLastMovesBoard.pop()
    gBoard = lastMoveBoard
    renderBoard(gBoard, SELECTOR);
}