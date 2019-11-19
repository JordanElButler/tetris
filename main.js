

const EMPTY_CELL = {
    type: "EMPTY_CELL",
    color: "rgb(0,0,0)"
};
const YELLOW_CELL = {
    type: "YELLOW_CELL",
    color: "rgb(200, 200, 0)"
};
const BLUE_CELL = {
    type: "BLUE_CELL",
    color: "rgb(0,0,200)"
};
const RED_CELL = {
    type: "RED_CELL",
    color: "rgb(200, 0, 0)"
};
const GREEN_CELL = {
    type: "GREEN_CELL",
    color: "rgb(0, 200, 0)"
};
const ORANGE_CELL = {
    type: "ORANGE_CELL",
    color: "rgb(200, 100, 0)"
};
const PURPLE_CELL = {
    type: "PURPLE_CELL",
    color: "rgb(200, 0, 200)"
};
const PINK_CELL = {
    type: "PINK_CELL",
    color: "rgb(200, 100, 100)"
};
const BROWN_CELL = {
    type: "BROWN_CELL",
    color: "rgb(120, 120, 0)"
};
/*
e,y,y,
y,y,e
*/
const SMASK = [
    [EMPTY_CELL, YELLOW_CELL, YELLOW_CELL],
    [YELLOW_CELL, YELLOW_CELL, EMPTY_CELL]
];
const SINFO = {
    mask: SMASK,
    rot_pivot_point: {x: 1.5, y: 0.5}
};
/*
b,b,e
e,b,b
*/
const ZMASK = [
    [GREEN_CELL, GREEN_CELL, EMPTY_CELL],
    [EMPTY_CELL, GREEN_CELL, GREEN_CELL]
];
const ZINFO = {
    mask: ZMASK,
    rot_pivot_point: {x: 1.5, y: 0.5}
};
/*
r,r
r,r
*/
const SQUAREMASK = [
    [RED_CELL, RED_CELL],
    [RED_CELL, RED_CELL]
];
const SQUAREINFO = {
    mask: SQUAREMASK,
    rot_pivot_point: {x: 1, y:1}
};
/*
b,b,b
e,b,e
*/
const TMASK = [
    [BLUE_CELL, BLUE_CELL, BLUE_CELL],
    [EMPTY_CELL, BLUE_CELL, EMPTY_CELL]
];
const TINFO = {
    mask: TMASK,
    rot_pivot_point: {x: 1.5, y: 0.5}
};
/*
o,o,o,o
*/
const IMASK = [
    [ORANGE_CELL, ORANGE_CELL, ORANGE_CELL, ORANGE_CELL]
];
const IINFO = {
    mask: IMASK,
    rot_pivot_point: {x: 1.5, y: 0.5}
};
/*
p,p,p
p,e,e
*/
const LMASK = [
    [PURPLE_CELL, PURPLE_CELL, PURPLE_CELL],
    [PURPLE_CELL, EMPTY_CELL, EMPTY_CELL]
];
const LINFO = {
    mask: LMASK,
    rot_pivot_point: {x: 1.5, y: 0.5}
};
/*
p,p,p
e,e,p
*/
const JMASK = [
    [PINK_CELL, PINK_CELL, PINK_CELL],
    [EMPTY_CELL, EMPTY_CELL, PINK_CELL]
];
const JINFO = {
    mask: JMASK,
    rot_pivot_point: {x: 1.5, y: 0.5}
};

function Grid(w, h) {
    this.w = w;
    this.h = h;
    this.cells = [];
    for (var i = 0; i < h; i++) {
        var tmp = [];
        for (var j = 0; j < w; j++) {
            tmp.push(EMPTY_CELL);
        }
        this.cells.push(tmp);
    }
}
Grid.prototype.inBounds = function(x, y) {
    return (x < this.w && x >= 0 && y < this.h && y >= 0);
};
Grid.prototype.aboveGrid = function(x, y) {
    return (x < this.w && x >= 0 && y < 0);
}
Grid.prototype.getCell = function(x, y) {
    if (!this.inBounds(x, y)) throw Error("OUT OF BOUNDS -- getCell");
    return this.cells[y][x];
};
Grid.prototype.setCell = function(x, y, cell) {
    if (!this.inBounds(x, y)) throw Error("OUT OF BOUNDS -- setCell");
    this.cells[y][x] = cell;
};
Grid.prototype.checkRowForTetris = function(row) {
    if (row < 0 || row >= this.h) throw Error("ROW OUT OF BOUNDS -- checkRowForTetris");
    for (var j = 0; j < this.cells[row].length; j++) {
        var cell = this.getCell(j, row);
        if (cell === EMPTY_CELL) return false;
    }
    return true;
}
Grid.prototype.collapseRowDown = function(row) {
    for (var i = row; i > 0; i--) {
        for (var j = 0; j < this.w; j++) {
            var aboveCell = this.getCell(j, i-1);
            this.setCell(j, i, aboveCell);
        }
    }
    for (var j = 0; j < this.w; j++) this.setCell(j, 0, EMPTY_CELL);
}
function getUnTetris(grid) {
    var rowsCollapsed = 0;
    for (var row = 0; row < grid.h; row++) {
        if (grid.checkRowForTetris(row)) {
            grid.collapseRowDown(row);
            rowsCollapsed++;
        }
    }
    if (rowsCollapsed === 4) return 10000;
    else return 1000 * rowsCollapsed;
}

function Piece(x, y, rot, info) {
    this.x = x;
    this.y = y;
    this.info = info;
    this.rot = rot;
}
Piece.prototype.copy = function() {
    return new Piece(this.x, this.y, this.rot, this.info);
};

Piece.prototype.getAnchorPoint = function() {
    var info = this.info;
    return {
        x: info.rot_pivot_point.x,
        y: info.rot_pivot_point.y
    };
};
Piece.prototype.getPointRotated = function(point) {
    var x = point.x;
    var y = point.y;
    for (var k = 0; k < this.rot; k++) {
        var tmpx = x;
        var tmpy = y;
        x = -tmpy;
        y = tmpx;
    }
    return {
        x: x,
        y: y
    };
}
// returns array of cell coordinates and cell value
Piece.prototype.getCellArray = function() {
    var arr = [];
    var mask = this.info.mask;
    var anchorPoint = this.getAnchorPoint();
    var ra = this.getPointRotated(anchorPoint);
    for (var i = 0; i < mask.length; i++) {
        for (var j = 0; j < mask[i].length; j++) {
            var cell = mask[i][j];
            var p = this.getPointRotated({x: j + 0.5, y: i + 0.5});
            arr.push({
                x: Math.floor(p.x + (this.x - ra.x)),
                y: Math.floor(p.y + (this.y - ra.y)),
                cell: cell
            });
        }
    }
    return arr;
}
function canPlacePiece(grid, piece) {
    // check mask in grid boundaries
    var maskArray = piece.getCellArray();
    for (var i = 0; i < maskArray.length; i++) {
        var cellInfo = maskArray[i];
        
        // check bounds of grid
        if (!grid.inBounds(cellInfo.x, cellInfo.y) && !grid.aboveGrid(cellInfo.x, cellInfo.y)) return false;

        // check non-empty cell intersections
        if (!grid.aboveGrid(cellInfo.x, cellInfo.y)) {
            var gcell = grid.getCell(cellInfo.x, cellInfo.y);
            if (gcell !== EMPTY_CELL && cellInfo.cell !== EMPTY_CELL) return false;
        }
    }
    return true;
}
function transferPieceToGrid(grid, piece) {
    var maskArray = piece.getCellArray();
    for (var i = 0; i < maskArray.length; i++) {
        var cellInfo = maskArray[i];
        if (grid.aboveGrid(cellInfo.x, cellInfo.y)) continue;
        if (!grid.inBounds(cellInfo.x, cellInfo.y) ) throw Error("CELL OUT OF BOUNDS -- transferPieceToGrid");
        if (cellInfo.cell !== EMPTY_CELL) grid.setCell(cellInfo.x, cellInfo.y, cellInfo.cell);
    }
}
function getNextPiece() {
    var index = Math.floor(Math.random() * pieces.length);
    return new Piece(Math.floor(grid.w / 2), -2,  0, pieces[index]);
}


function initializeGameState() {
    grid = new Grid(gw, gh);
    pieces = [SINFO, ZINFO, SQUAREINFO, TINFO, IINFO, LINFO, JINFO];
    activePiece = getNextPiece();
    nextPiece = getNextPiece();

    level = 0; // index used for  levelCounterTime and levelThreshold
    downInterval = levelCounterTime[level];
    downCounter = 0;
    score = 0;
};
// set up all globals
function initialize() {
    canvas = document.getElementById("c");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");


    gw = 10;
    gh = 20;
    pendingInput = null;

    levelCounterTime = [18, 15, 12, 10, 8, 7, 6, 5, 4, 3];
    levelThreshold = [0, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, Infinity];

    gameState = 'gameStart';
}


// gameStates = 'gameStart' | 'gameRunning' | 'gameOver' 
//                         ->              ->           ->
function getGameState() {
    return gameState;
}
function nextGameState() {
    if (gameState === 'gameStart') gameState = 'gameRunning';
    else if (gameState === 'gameRunning') gameState = 'gameOver';
    else if (gameState === 'gameOver') gameState = 'gameStart';
}
function gameLoop() {
    let state = getGameState();
    // gameRunning
    if (pendingInput) {
        var testPiece = activePiece.copy();
        if (pendingInput.dir === "left") testPiece.x -= 1;
        else if (pendingInput.dir === "right") testPiece.x += 1;
        else if (pendingInput.dir === "down") testPiece.y += 1;
        else if (pendingInput.dir === "cc") testPiece.rot = (testPiece.rot + 3) % 4;
        else if (pendingInput.dir === "cw") testPiece.rot = (testPiece.rot + 1) % 4;
        else throw Error("INVALID INPUT -- update");

        if (canPlacePiece(grid, testPiece)) {
            activePiece = testPiece;
        }
    }
    if (downCounter >= downInterval) {
        // forget pending input, attempt going down, if can't, freeze piece and create new active piece
        downCounter = 0;

        var testPiece = activePiece.copy();
        testPiece.y += 1;
        if (canPlacePiece(grid, testPiece)) activePiece = testPiece;
        else {
            // piece cannot fall, transfer, do game over

            // interesting part
            transferPieceToGrid(grid, activePiece);
            // check game over

            var cellArray = activePiece.getCellArray();
            for (var i = 0; i < cellArray.length; i++) {
                var cellInfo = cellArray[i];
                if (grid.aboveGrid(cellInfo.x, cellInfo.y)) {
                    nextGameState();
                    break;
                }
            }
            // otherwise
            if (state === 'gameRunning') {
                // check grid for full rows, and modify if necessary, update score
                score += getUnTetris(grid);
                activePiece = nextPiece;
                nextPiece = getNextPiece();
            }
        }
    }

    downCounter += 1;
    // set level based on score
    for (var i = level; i < levelThreshold.length; i++) {
        if (score > levelThreshold[i]) level = i;
        else break;
    }
    downInterval = levelCounterTime[level];
}


function update() {
    let state = getGameState();
    if (state === 'gameRunning') {
        gameLoop();
    } else if (state === 'gameOver') {
        if (pendingInput) nextGameState();
    } else if (state === 'gameStart') {
        if (pendingInput) nextGameState();
        initializeGameState();
    }
    pendingInput = null;
}


function drawCell(cell, posx, posy, dx, dy) {
    ctx.fillStyle = cell.color;
    ctx.strokeStyle = "white";
    if (cell === EMPTY_CELL) ctx.lineWidth = 0.5;
    else ctx.lineWidth = 0.15;
    ctx.fillRect(posx, posy, dx, dy);
    ctx.strokeRect(posx, posy, dx, dy);
}
function drawCell(cell, posx, posy, dx, dy) {
    ctx.fillStyle = cell.color;
    ctx.strokeStyle = "white";
    if (cell === EMPTY_CELL) ctx.lineWidth = 0.5;
    else ctx.lineWidth = 0.15;
    ctx.fillRect(posx, posy, dx, dy);
    ctx.strokeRect(posx, posy, dx, dy);
}
function drawGhostCell(cell, posx, posy, dx, dy) {
    var ghostColor = "rgba(20, 20, 20, 20)";
    ctx.fillStyle = ghostColor;
    ctx.strokeStyle = ghostColor;
    if (cell === EMPTY_CELL) ctx.lineWidth = 0.5;
    else ctx.lineWidth = 0.15;
    ctx.fillRect(posx, posy, dx, dy);
    ctx.strokeRect(posx, posy, dx, dy);
}
function drawGrid(grid, anchor, cellSize) {
    for (var i = 0; i < grid.h; i++) {
        for (var j = 0; j < grid.w; j++) {
            var cell = grid.getCell(j, i);
            drawCell(cell, anchor.x + j * cellSize, anchor.y + i * cellSize, cellSize, cellSize);
        }
    }
}
function drawDeadGrid(grid, anchor, cellSize) {
    for (var i = 0; i < grid.h; i++) {
        for (var j = 0; j < grid.w; j++) {
            var cell = grid.getCell(j, i);
            if (cell === EMPTY_CELL) drawCell(cell, anchor.x + j * cellSize, anchor.y + i * cellSize, cellSize, cellSize);
            else drawCell(BROWN_CELL, anchor.x + j * cellSize, anchor.y + i * cellSize, cellSize, cellSize);
        }
    }
}
function drawPieceOnGrid(piece, grid, anchor, blockSize) {
    var blockArray = piece.getCellArray();
    for (var i = 0; i < blockArray.length; i++) {
        var cellInfo = blockArray[i];
        if (cellInfo.cell === EMPTY_CELL || grid.aboveGrid(cellInfo.x, cellInfo.y)) continue;
        drawCell(cellInfo.cell, anchor.x + (cellInfo.x) * blockSize, anchor.y + (cellInfo.y) * blockSize, blockSize, blockSize);
    }
}
function drawGhostPieceOnGrid(piece, grid, anchor, blockSize) {
    var ghostPiece = piece.copy();
    while (canPlacePiece(grid, ghostPiece)) {
        ghostPiece.y += 1;
    }
    ghostPiece.y -= 1;
    var blockArray = ghostPiece.getCellArray();
    for (var i = 0; i < blockArray.length; i++) {
        var cellInfo = blockArray[i];
        if (cellInfo.cell === EMPTY_CELL || grid.aboveGrid(cellInfo.x, cellInfo.y)) continue;
        drawGhostCell(cellInfo.cell, anchor.x + (cellInfo.x) * blockSize, anchor.y + (cellInfo.y) * blockSize, blockSize, blockSize);
    }
}
function drawNextPiece(piece, anchor, blockSize) {
    var blockArray = piece.getCellArray();
    for (var i = 0; i < blockArray.length; i++) {
        var cellInfo = blockArray[i];
        if (cellInfo.cell === EMPTY_CELL) continue;
        drawCell(cellInfo.cell, anchor.x + (cellInfo.x) * blockSize, anchor.y + (cellInfo.y) * blockSize, blockSize, blockSize);
    }
}

function drawText(text, anchor, font, color) {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.fillText(text, anchor.x, anchor.y);
}
function runningRender() {

    // clear screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gridAnchor = {x: canvas.width * 1/3, y: canvas.height * 1/20} // tells where grid is on canvas, 
    // calculate block size
    const cellSize = Math.floor(((canvas.width > canvas.height ? canvas.height : canvas.width) - gridAnchor.y) / grid.h);
    // draw grid
    drawGrid(grid, gridAnchor, cellSize);
    
    // draw ghost piece
    drawGhostPieceOnGrid(activePiece, grid, gridAnchor, cellSize);
    // draw piece
    drawPieceOnGrid(activePiece, grid, gridAnchor, cellSize);
    // draw next piece
    const nextPieceSize = cellSize * 0.7;
    const nextPieceAnchor = {x: gridAnchor.x + cellSize * grid.w + canvas.width * 1/30, y: gridAnchor.y + canvas.height * 1/30};
    drawNextPiece(nextPiece, nextPieceAnchor, nextPieceSize);


    const fontSize = Math.floor(canvas.width * 1/30);
    // draw level text
    const levelAnchor = {x: canvas.width/10, y: canvas.height * 1/20};
    const levelFont = fontSize + "px serif";
    const levelColor = "white";
    drawText("Level: " + level, levelAnchor, levelFont, levelColor);

    // draw score text
    const scoreAnchor = {x: levelAnchor.x, y: levelAnchor.y + 2*fontSize};
    const scoreFont = fontSize + "px serif";
    const scoreColor = "white";
    drawText("Score: " + score, scoreAnchor, scoreFont, scoreColor);
}
function gameOverRender() {
        // clear screen
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const gridAnchor = {x: canvas.width * 1/3, y: canvas.height * 1/20} // tells where grid is on canvas, 
        // calculate block size
        const cellSize = Math.floor(((canvas.width > canvas.height ? canvas.height : canvas.width) - gridAnchor.y) / grid.h);
        // draw grid
        drawDeadGrid(grid, gridAnchor, cellSize);

        // draw next piece
        const nextPieceSize = cellSize * 0.7;
        const nextPieceAnchor = {x: gridAnchor.x + cellSize * grid.w + canvas.width * 1/30, y: gridAnchor.y + canvas.height * 1/30};
        drawNextPiece(nextPiece, nextPieceAnchor, nextPieceSize);
    
    
        const fontSize = Math.floor(canvas.width * 1/30);
        // draw level text
        const levelAnchor = {x: canvas.width/10, y: canvas.height * 1/20};
        const levelFont = fontSize + "px serif";
        const levelColor = "white";
        drawText("Level: " + level, levelAnchor, levelFont, levelColor);
    
        // draw score text
        const scoreAnchor = {x: levelAnchor.x, y: levelAnchor.y + 2*fontSize};
        const scoreFont = fontSize + "px serif";
        const scoreColor = "white";
        drawText("Score: " + score, scoreAnchor, scoreFont, scoreColor);

        // draw game over text
        const gameOverAnchor = {x: canvas.width/2, y: canvas.height/2};
        const gameOverFont = (2 * fontSize) + 'px serif';
        const gameOverColor = "red";
        drawText("Game Over", gameOverAnchor, gameOverFont, gameOverColor);
}

function startRender() {
        // clear screen
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const gridAnchor = {x: canvas.width * 1/3, y: canvas.height * 1/20} // tells where grid is on canvas, 
        // calculate block size
        const cellSize = Math.floor(((canvas.width > canvas.height ? canvas.height : canvas.width) - gridAnchor.y) / gh);
       
        // draw grid
        drawGrid(new Grid(gw, gh), gridAnchor, cellSize);
        
        const fontSize = Math.floor(canvas.width * 1/30)
        // draw level text
        const levelAnchor = {x: canvas.width/10, y: canvas.height * 1/20};
        const levelFont = fontSize + "px serif";
        const levelColor = "white";
        drawText("Level: 0", levelAnchor, levelFont, levelColor);

        // draw score text
        const scoreAnchor = {x: levelAnchor.x, y: levelAnchor.y + 2*fontSize};
        const scoreFont = fontSize + "px serif";
        const scoreColor = "white";
        drawText("Score: 0", scoreAnchor, scoreFont, scoreColor);
        // start game text

        const gameStartAnchor = {x: canvas.width/3, y: canvas.height/2};
        const gameStartFont = (1 * fontSize) + 'px serif';
        const gameStartColor = "white";
        drawText("Press button to start", gameStartAnchor, gameStartFont, gameStartColor);
}
function render() {
    let state = getGameState();

    if (state === 'gameRunning') {
        runningRender();
    } else if (state === "gameOver") {
        // game over screen
        gameOverRender();
    } else if (state === "gameStart"){
        startRender();
    }
}

function loopAnimation() {
    window.requestAnimationFrame(loopAnimation);
    render();
}

initialize();
loopAnimation();
window.setInterval(update, 1000/30);

window.addEventListener("keydown", function(e) {
    let state = getGameState();
    if (state === 'gameStart' || state === 'gameOver') {
        pendingInput = true;
        return;
    }
    if (pendingInput) return;
    if (e.key === 'a') pendingInput = {type: "move", dir: "left"};
    else if (e.key === 'd') pendingInput = {type: "move", dir: "right"};
    else if (e.key === 's') pendingInput = {type: "move", dir: "down"};
    else if (e.key === 'q') pendingInput = {type: "rotate", dir: "cc"};
    else if (e.key === 'e') pendingInput = {type: "rotate", dir: "cw"};
});

window.addEventListener('resize', function(e) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})