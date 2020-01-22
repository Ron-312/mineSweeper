'use script'


function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  
  function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  function renderBoard(board, selector) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < board.length; i++) {
      strHTML += '<tr>';
      for (var j = 0; j < board[0].length; j++) {
        var cell = board[i][j];
        if(cell.isMine){
            cell = MINE;
        }else if(!cell.minesAroundCount){
            cell = EMPTY;
        }else{
            cell= cell.minesAroundCount;
        }
        var className = 'cell cell-' + i + '-' + j;
        strHTML += '<td class="' + className + '" onmousedown ="cellClicked(event,'+i+','+j+')"> <span>' + cell + '</span> </td>'
      }
      strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
  }
  
  function renderCell(location, value,color) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    elCell.innerHTML = value;
    elCell.style.color =color
  }
  
  // finding neigbors
  function printNegs(board, cellI, cellJ) {
    var rowStart = cellI - 1
    var rowEnd = cellI + 1
    var colStart = cellJ - 1
    var colEnd = cellJ + 1
    for (var i = rowStart; i <= rowEnd; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colStart; j <= colEnd; j++) {
            if (j < 0 || j >= board.length) continue
            if (cellI === i && cellJ === j) continue
            var currNeg = board[i][j]
            console.log('curren neighbor is:', currNeg)
        }
    }
  }