let boardColor = "Brown";
let Board = {};
let makingPromotion = false;
let isGameOver = false;
let gameStarted = false;

function initializeChessBoard() {
    // Initialize Board
    Board = {
        Squares: new Array(9).fill(null).map(() => new Array(9).fill(null)),
        Side: "White",
        Turn: "White",
        CurrentSelected: undefined,
        WhiteCheck: false,
        BlackCheck: false,
        GAMEMODE: "2Player",
        WhiteKing: undefined,
        BlackKing: undefined,
        CheckMateOnBlack: false,
        CheckMateOnWhite: false,
        Stalemate: false,
        WhiteScore: 10039,
        BlackScore: 10039,
    };

    // Set up the board element
    let boardElement = document.getElementById("Board");
    boardElement.innerHTML = "";
    let boardHTML = "";
    let isWhiteSquare = true;

    // Construct HTML for the board
    for (let row = 1; row < 9; row++) {
        isWhiteSquare = row % 2 === 1;

        for (let col = 1; col < 9; col++) {
            let squareColorClass = isWhiteSquare ? 'whiteSquare' : 'blackSquare';
            boardHTML += `<div class='${squareColorClass}' id='${row}${col}'></div>`;
            isWhiteSquare = !isWhiteSquare;

            Board.Squares[row][col] = {
                piece: undefined,
                potentialWhiteCheck: false,
                potentialBlackCheck: false,
            };
        }
    }

    // Update the board element
    boardElement.innerHTML = boardHTML;

    // Additional function calls
    makingPossibleMoves();
    addToCapturedPieces();
    setBoardColor(boardColor);
}


function setBoardColor(boardColor) {
    if (boardColor !== 'Brown') return; // Exit if the theme is not 'Brown'

    for (let row = 1; row < 9; row++) {
        for (let col = 1; col < 9; col++) {
            let square = document.getElementById(`${row}${col}`);
            if (!square) continue;

            if (square.classList.contains('blackSquare')) {
                square.classList.toggle('BrownThemeBlack', true);
            } else if (square.classList.contains('whiteSquare')) {
                square.classList.toggle('BrownThemeWhite', true);
            }
        }
    }
}

function chooseSide(side) {
    // Reset game states
    isGameOver = false;
    gameStarted = true;
    movesPlayed = 0; // for computer

    // Initialize board and set the side
    initializeChessBoard();
    Board.Side = side;
    OpponentSide = (side === "White") ? "Black" : "White";

    // Remove the popup and setup the game
    document.getElementById("PopUp").remove();
    setPieces();
    drawBoard();
    resetPotentialChecks(Board);

    // If it's the opponent's turn, calculate their move
    if (Board.Turn === OpponentSide) {
        calculateOpponentMove(); // white -> computer goes first
    }
}

function setPieces() {
    // set up pawns on a specific row for a given color
    const setupPawns = (color, row) => {
        for (let i = 1; i < Board.Squares.length; i++) {
            Board.Squares[row][i].piece = new Pawn(color, row, i);
        }
    };

    // set up rooks, knights, and bishops on a specific row for a given color
    const setupRooksKnightsBishops = (color, row) => {
        Board.Squares[row][1].piece = new Rook(color, row, 1);
        Board.Squares[row][8].piece = new Rook(color, row, 8);
        Board.Squares[row][2].piece = new Knight(color, row, 2);
        Board.Squares[row][7].piece = new Knight(color, row, 7);
        Board.Squares[row][3].piece = new Bishop(color, row, 3);
        Board.Squares[row][6].piece = new Bishop(color, row, 6);
    };

    // set up the king and queen on specific columns for a given color and row
    const setupKingQueen = (color, row, kingCol, queenCol) => {
        Board.Squares[row][kingCol].piece = new King(color, row, kingCol);
        Board.Squares[row][queenCol].piece = new Queen(color, row, queenCol);
        // track the king's position for each color
        color === "White" ? Board.WhiteKing = Board.Squares[row][kingCol].piece : Board.BlackKing = Board.Squares[row][kingCol].piece;
    };

    // initialize the chessboard pieces based on the side playing
    if (Board.Side === "White") {
        setupPawns("White", 7);
        setupPawns("Black", 2);
        setupRooksKnightsBishops("White", 8);
        setupRooksKnightsBishops("Black", 1);
        setupKingQueen("White", 8, 5, 4);
        setupKingQueen("Black", 1, 5, 4);
    } else {
        setupPawns("Black", 7);
        setupPawns("White", 2);
        setupRooksKnightsBishops("Black", 8);
        setupRooksKnightsBishops("White", 1);
        setupKingQueen("Black", 8, 4, 5);
        setupKingQueen("White", 1, 4, 5);
    }
}


function drawBoard() {
    // Helper function to add file letters and rank numbers
    // adjusts the lettes and numbers of the board based on the side selected
    const addFileAndRank = (isBlackSide) => {
        // Adds file letter (a-h) at the bottom of the board
        const addFileLetter = (i, increment) => {
            const letter = String.fromCharCode(96 + i + increment);
            document.getElementById(`8${i}`).innerHTML += `<p class='fileLetter'>${letter}</p>`;
        };

        // Adds rank number (1-8) at the side of the board
        const addRankNumber = (i, number) => {
            document.getElementById(`${i}1`).innerHTML += `<p class='rankNumber'>${number}</p>`;
        };

        for (let i = 1; i < 9; i++) {
            addFileLetter(i, isBlackSide ? 8 - 2 * i : 0);
            addRankNumber(i, isBlackSide ? i : 9 - i);
        }
    };

    // Loop through each square on the board
    for (let i = 1; i < 9; i++) {
        for (let j = 1; j < 9; j++) {
            let square = document.getElementById(`${i}${j}`);
            // If the square contains a piece, display the piece's image
            if (Board.Squares[i][j].piece) {
                square.innerHTML = `<img src='Images/Pieces/${Board.Squares[i][j].piece.color}${Board.Squares[i][j].piece.name}.png' width='100%' style='pointer-events:none; user-select: none;'>`;
                square.classList.add("squareHover");
            } else {
                // If the square is empty, display a blank image
                square.innerHTML = "<img src='Images/Pieces/Blank.png' width='100%' style='pointer-events:none; user-select: none;'>";
                square.classList.remove("squareHover");
            }
        }
    }

    // Add file letters and rank numbers based on the side
    // This adjusts the display based on whether the player is playing as White or Black
    if (Board.Side === "White") {
        addFileAndRank(false);  // for white side
    } else if (Board.Side === "Black") {
        addFileAndRank(true);   // for black side
    }
}

function highlightPossibilities(coordinates) {

    // iterating over an 8x8 grid
    for (let i = 1; i < 9; i++) {
        for (let j = 1; j < 9; j++) {
            let id = i + "" + j;

            // remove existing tints from all squares
            document.getElementById(id).classList.toggle("tint", false);

            // disable hover effect for squares without a piece
            if(Board.Squares[i][j].piece == undefined){
                document.getElementById(id).classList.toggle("squareHover", false);
            }
        }
    }

    // check if coordinates are provided
    if (coordinates != undefined) {

        // iterate through possible moves
        for (let i = 0; i < coordinates.length; i++) {

            // highlight legal moves
            if(coordinates[i].legalMove){
                let id = coordinates[i].i + "" + coordinates[i].j;

                // apply tint to indicate a legal move
                document.getElementById(id).classList.toggle("tint", true);

                // update move indicators
                document.getElementById(id).classList.toggle("moveIndicator", false);

                // enable hover effect for legal moves
                document.getElementById(id).classList.toggle("squareHover", true);
            }

        }
    }

}


function idToSquare(id) {
    let i = id.substring(0, 1);
    let j = id.substring(1);
    return Board.Squares[parseInt(i)][parseInt(j)];
}

function makingPossibleMoves() {
    // Consolidated query for both black and white squares
    let squares = document.querySelectorAll('.whiteSquare, .blackSquare');

    // Single event listener for all squares
    squares.forEach(square => {
        square.addEventListener('click', (e) => {
            handleSquareClick(e);
        });
    });
}

// Extracted logic for handling square clicks
function handleSquareClick(e) {
    let square = idToSquare(e.target.id);
    if (square.piece && square.piece.color === Board.Side && square.piece.color === Board.Turn && !isGameOver) {
        highlightPossibilities(square.piece.getMoves(Board));
        Board.CurrentSelected = square.piece;
    } else if (e.target.classList.contains('tint') && !isGameOver) {
        // We are making a move with the current selected piece
        processPieceMove(e.target);
    } else {
        // Clicked outside and deselected the piece
        highlightPossibilities();
        Board.CurrentSelected = undefined;
    }
}

function processPieceMove(target) {
    let oldI = Board.CurrentSelected.i;
    let oldJ = Board.CurrentSelected.j;
    let newI = parseInt(target.id.substring(0, 1));
    let newJ = parseInt(target.id.substring(1));
    makeMove(oldI, oldJ, newI, newJ);
    
    highlightPossibilities();
    Board.CurrentSelected = undefined;
}

function makeMove(oldI, oldJ, newI, newJ) {
    let safeToMove = true;

    // Test the move by making a deep copy of the board
    let cloneBoard = copyBoard(Board);
    cloneBoard.Squares[newI][newJ].piece = cloneBoard.Squares[oldI][oldJ].piece;
    cloneBoard.Squares[oldI][oldJ].piece = undefined;

    // Update the moved piece's coordinates and state
    cloneBoard.Squares[newI][newJ].piece.i = newI;
    cloneBoard.Squares[newI][newJ].piece.j = newJ;
    cloneBoard.Squares[newI][newJ].piece.moved = true;

    resetPotentialChecks(cloneBoard); // Check for potential checks after the move

    // Check if the move causes a check on the king
    let kingColor = cloneBoard.Squares[newI][newJ].piece.color;
    if (cloneBoard.Side === kingColor) {
        for (let i = 1; i < cloneBoard.Squares.length; i++) {
            for (let j = 1; j < cloneBoard.Squares[i].length; j++) {
                let squarePiece = cloneBoard.Squares[i][j].piece;
                if (squarePiece && squarePiece.name === "King" && squarePiece.color === kingColor) {
                    let potentialCheck = (kingColor === "White") ? 
                        cloneBoard.Squares[i][j].potentialWhiteCheck : 
                        cloneBoard.Squares[i][j].potentialBlackCheck;
                    if (potentialCheck) {
                        safeToMove = false;
                    }
                }
            }
        }
    }
    cloneBoard = undefined; // Clear the clone board

    if (safeToMove) {
        // Execute the move on the actual board
        sound();
        calculateScore(Board, "White");
        calculateScore(Board, "Black");

        if(Board.Squares[oldI][oldJ].piece.name == "King"){
            Board.Squares[oldI][oldJ].piece.oldJ = oldJ; //keep track of where the king was last
        }
        if(Board.Squares[newI][newJ].piece != undefined){ //capturing a piece
            addToCapturedPieces(Board.Squares[newI][newJ].piece.name, Board.Squares[newI][newJ].piece.color);
        }
        Board.Squares[newI][newJ].piece = Board.Squares[oldI][oldJ].piece;
        Board.Squares[oldI][oldJ].piece = undefined;

        Board.Squares[newI][newJ].piece.i = newI; //setting new coordinates of piece we just moved
        Board.Squares[newI][newJ].piece.j = newJ; //setting new coordinates of piece we just moved
        Board.Squares[newI][newJ].piece.moved = true;


        for(let i = 1; i < 9; i++){
            for(let j = 1; j < 9; j++){
                document.getElementById(i + "" + j).classList.toggle("moveIndicator", false);
            }
        }
        document.getElementById(oldI + "" + oldJ).classList.toggle("moveIndicator", true);
        document.getElementById(newI + "" + newJ).classList.toggle("moveIndicator", true);


        if(Board.Squares[newI][newJ].piece.name == "King"){ 
            if(Board.Squares[newI][newJ].piece.oldJ - newJ == -2){//moved to the right since oldJ is smaller than newJ (castling)
                Board.Squares[newI][newJ-1].piece = Board.Squares[newI][8].piece; //since king moved to right, rook has to cross king and go 1 left of the king
                Board.Squares[newI][8].piece = undefined;

                Board.Squares[newI][newJ-1].piece.i = newI; //setting new coordinates of rook we just moved
                Board.Squares[newI][newJ-1].piece.j = newJ-1; //setting new coordinates of rook we just moved
                Board.Squares[newI][newJ-1].piece.moved = true;
            }
            if(Board.Squares[newI][newJ].piece.oldJ - newJ == 2){//moved to the left since oldJ is bigger than newJ (castling)
                Board.Squares[newI][newJ+1].piece = Board.Squares[newI][1].piece; //since king moved to left, rook has to cross king and go 1 right of the king
                Board.Squares[newI][1].piece = undefined;

                Board.Squares[newI][newJ+1].piece.i = newI; //setting new coordinates of rook we just moved
                Board.Squares[newI][newJ+1].piece.j = newJ+1; //setting new coordinates of rook we just moved
                Board.Squares[newI][newJ+1].piece.moved = true;
            }
        }

        //check if you moved a pawn to the other side 
        if(Board.Squares[newI][newJ].piece.name == "Pawn" && (Board.Squares[newI][newJ].piece.i == 8 || Board.Squares[newI][newJ].piece.i == 1)){ //1 is top row and 8 is bottom row. Your pawn will never be able to move backwards, so that means a certain pawn can reach only edge 8 or edge 1 for promotion depending on its color and side of the board
            //promotion
            if(Board.Squares[newI][newJ].piece.color == Board.Side){
                makePromotion(Board.Side, newI, newJ);
            }
            else{
                makePromotion(OpponentSide, newI, newJ);
            }
        }

        if(!makingPromotion)
            resetTurnsAndAnalyzeCheckmates();

    } else {
                let kingI;
        let kingJ;
        for (let i = 1; i < 9; i++) {
            for (let j = 1; j < 9; j++) {
                if (Board.Squares[i][j].piece != undefined && Board.Squares[i][j].piece.name == "King" && Board.Squares[i][j].piece.color == Board.Side) {
                    kingI = i;
                    kingJ = j;

                }
            }
        }

        //red flash
        document.getElementById(kingI + "" + kingJ).classList.toggle("kingInCheck", true)
        setTimeout(function () {
            document.getElementById(kingI + "" + kingJ).classList.toggle("kingInCheck", false);
            setTimeout(function () {
                document.getElementById(kingI + "" + kingJ).classList.toggle("kingInCheck", true);
                setTimeout(function () {
                    document.getElementById(kingI + "" + kingJ).classList.toggle("kingInCheck", false)
                }, 250);
            }, 250);
        }, 250);
    }
}


function addToCapturedPieces(piece, color) {
    // clear the innerHTML of the specified class
    const clearInnerHTML = (className) => {
        const element = document.getElementsByClassName(className)[0];
        element.innerHTML = "";
    };

    // if both piece and color are undefined, clear both White and Black captured pieces
    if (piece === undefined && color === undefined) {
        clearInnerHTML("WhitePiecesCaptured");
        clearInnerHTML("BlackPiecesCaptured");
    } else {
        // construct the image source path
        const imageSrc = `Images/Pieces/${color}${piece}.png`;
        // determine the class name based on the color
        const className = color === "White" ? "WhitePiecesCaptured" : "BlackPiecesCaptured";
        // append the new piece image to the corresponding element
        const element = document.getElementsByClassName(className)[0];
        element.innerHTML += `<img src='${imageSrc}' width='20%'>`;
    }
}

function resetPotentialChecks(board) {
    // reset checkmate and check flags
    board.CheckMateOnBlack = false;
    board.CheckMateOnWhite = false;
    board.WhiteCheck = false;
    board.BlackCheck = false;

    // clear potential checks on all squares
    for (let i = 1; i < board.Squares.length; i++) {
        for (let j = 1; j < board.Squares[i].length; j++) {
            board.Squares[i][j].potentialBlackCheck = false;
            board.Squares[i][j].potentialWhiteCheck = false;
        }
    }

    // update potential checks based on current piece positions
    for (let i = 1; i < board.Squares.length; i++) {
        for (let j = 1; j < board.Squares[i].length; j++) {
            if (board.Squares[i][j].piece != undefined) {
                board.Squares[i][j].piece.setPotentialCheck(board);
            }
        }
    }

    // check if any king is in check
    for (let i = 1; i < board.Squares.length; i++) {
        for (let j = 1; j < board.Squares[i].length; j++) {
            if (board.Squares[i][j].piece != undefined) {
                if (board.Squares[i][j].piece.name == "King") {
                    if (board.Squares[i][j].piece.color == "White" && board.Squares[i][j].potentialWhiteCheck) {
                        board.WhiteCheck = true;
                    }
                    if (board.Squares[i][j].piece.color == "Black" && board.Squares[i][j].potentialBlackCheck) {
                        board.BlackCheck = true;
                    }
                }
            }
        }
    }
}




function resetTurnsAndAnalyzeCheckmates(){
    drawBoard();
    resetPotentialChecks(Board);



    //reset turn
    if (Board.Turn == "White") {
        Board.Turn = "Black";

        //analyze checkmate
        if (Board.BlackCheck) {
            if (Board.BlackKing.getMoves(Board).length == 0  || !areMovesLegal(Board.BlackKing.getMoves(Board))) {
                let isCheckMate = true;
                for (let i = 1; i < 9; i++) {
                    for (let j = 1; j < 9; j++) {
                        if (Board.Squares[i][j].piece != undefined && Board.Squares[i][j].piece.color == "Black") {
                            let moves = Board.Squares[i][j].piece.getMoves(Board);
                            for (let k = 0; k < moves.length; k++) {
                                let newI = moves[k].i;
                                let newJ = moves[k].j;
                                let oldI = Board.Squares[i][j].piece.i;
                                let oldJ = Board.Squares[i][j].piece.j;

                                let cloneBoard = copyBoard(Board);
                                cloneBoard.Squares[newI][newJ].piece = cloneBoard.Squares[oldI][oldJ].piece;
                                cloneBoard.Squares[oldI][oldJ].piece = undefined;

                                cloneBoard.Squares[newI][newJ].piece.i = newI; //setting new coordinates of piece we just moved
                                cloneBoard.Squares[newI][newJ].piece.j = newJ; //setting new coordinates of piece we just moved
                                cloneBoard.Squares[newI][newJ].piece.moved = true;
                                resetPotentialChecks(cloneBoard); //we moved the piece and now we want to see if the king is in check

                                //are we in check?
                                for (let a = 1; a < cloneBoard.Squares.length; a++) {
                                    for (let b = 1; b < cloneBoard.Squares[i].length; b++) {
                                        if (cloneBoard.Squares[a][b].piece != undefined) {
                                            if (cloneBoard.Squares[a][b].piece.name == "King") {
                                                if (cloneBoard.Squares[a][b].piece.color == "Black" && !cloneBoard.Squares[a][b].potentialBlackCheck) {
                                                    isCheckMate = false;
                                                }
                                            }
                                        }

                                    }
                                }
                            }
                        }
                    }
                }
                if(isCheckMate){Board.CheckMateOnBlack = true;}
            }                
        }
        else{//stalemate because of black
            if(getAllMovesExceptKing(Board, "Black").length == 0){  //no other piece has legal move
                if(Board.BlackKing.getMoves(Board).length == 0 || !areMovesLegal(Board.BlackKing.getMoves(Board))){ //the king also does not have any moves
                    Board.Stalemate = true;
                    makePopUp("Draw - Stalemate");
                    isGameOver = true;
                    gameStarted = false
                }
            }
        }
    } else if (Board.Turn == "Black") {
        Board.Turn = "White";

        //analyze checkmate
        if (Board.WhiteCheck) {
            if (Board.WhiteKing.getMoves(Board).length == 0 || !areMovesLegal(Board.WhiteKing.getMoves(Board))) {
                let isCheckMate = true;
                for (let i = 1; i < 9; i++) {
                    for (let j = 1; j < 9; j++) {
                        if (Board.Squares[i][j].piece != undefined && Board.Squares[i][j].piece.color == "White") {
                            let moves = Board.Squares[i][j].piece.getMoves(Board);

                            for (let k = 0; k < moves.length; k++) {
                                let newI = moves[k].i;
                                let newJ = moves[k].j;
                                let oldI = Board.Squares[i][j].piece.i;
                                let oldJ = Board.Squares[i][j].piece.j;

                                let cloneBoard = copyBoard(Board);
                                cloneBoard.Squares[newI][newJ].piece = cloneBoard.Squares[oldI][oldJ].piece;
                                cloneBoard.Squares[oldI][oldJ].piece = undefined;

                                cloneBoard.Squares[newI][newJ].piece.i = newI; //setting new coordinates of piece we just moved
                                cloneBoard.Squares[newI][newJ].piece.j = newJ; //setting new coordinates of piece we just moved
                                cloneBoard.Squares[newI][newJ].piece.moved = true;
                                resetPotentialChecks(cloneBoard); //we moved the piece and now we want to see if the king is in check

                                //are we in check?
                                for (let a = 1; a < 9; a++) {
                                    for (let b = 1; b < 9; b++) {
                                        if (cloneBoard.Squares[a][b].piece != undefined) {
                                            if (cloneBoard.Squares[a][b].piece.name == "King") {
                                                if (cloneBoard.Squares[a][b].piece.color == "White" && !cloneBoard.Squares[a][b].potentialWhiteCheck) {
                                                    isCheckMate = false;
                                                }
                                            }
                                        }

                                    }
                                }
                            }
                        }
                    }
                }
                if(isCheckMate){Board.CheckMateOnWhite = true;}
            }   
        }
        else{//stalemate because of white
            if(getAllMovesExceptKing(Board, "White").length == 0){  //no other piece has legal move
                if(Board.WhiteKing.getMoves(Board).length == 0   || !areMovesLegal(Board.WhiteKing.getMoves(Board))){ //the king also does not have any moves
                    Board.Stalemate = true;
                    makePopUp("Draw - Stalemate");
                    isGameOver = true;
                    gameStarted = false;
                }
            }
        }
    }

    if(Board.CheckMateOnBlack){
        if(Board.Side == "White"){
           makePopUp("Checkmate - You Win!");
        }else{
            makePopUp("Checkmate - You Lose!");
        }
        isGameOver = true;
        gameStarted = false;

    }
    if(Board.CheckMateOnWhite){
        if(Board.Side == "Black"){
            makePopUp("Checkmate - You Win!");
        }else{
            makePopUp("Checkmate - You Lose!");
        }
        isGameOver = true;
        gameStarted = false;
    }

    calculateScore(Board, "White");
    calculateScore(Board, "Black");
    if(Board.WhiteScore == 10000 && Board.BlackScore == 10000){
        makePopUp("Draw - Insufficient Material");
        isGameOver = true;
        gameStarted = false;
    }
    if(Board.Turn == OpponentSide && !isGameOver){
        setTimeout(function () {
            calculateOpponentMove();
        }, 50);
    }
}

function resign(){
    if(!isGameOver && gameStarted){
        isGameOver = true;
        gameStarted = false;
        makePopUp("Resigned - You Lose");
    }
}

function drawGame(){
    if(!isGameOver && gameStarted){
        calculateScore(Board, "White");
        calculateScore(Board, "Black");

        if(OpponentSide == "White"){
            if(Board.WhiteScore - Board.BlackScore < 10){ //if the computer is not winning by a whole lot, it will be nice and accept the draw
                isGameOver = true;
                gameStarted = false;
                makePopUp("Draw - By Agreement");
            }else{ //if the computer is clearlt winning, it will decline the draw
                alert("The computer declined your draw offer!");
            }
        }else{
            if(Board.BlackScore - Board.WhiteScore < 10){ //if the computer is not winning by a whole lot, it will be nice and accept the draw
                isGameOver = true;
                gameStarted = false;
                makePopUp("Draw - By Agreement");
            }else{ //if the computer is clearlt winning, it will decline the draw
                alert("The computer declined your draw offer!");
            }
        }

    }
}

function restart(){
    movesPlayed = 0; //for computer
    //we want to choose side first and then set up board later on
    initializeChessBoard();
    setPieces();
    drawBoard();
    resetPotentialChecks(Board);
    makePopUp("Chess");
    isGameOver = false;
}

function chooseDifficulty(d){
    depth = d;
}

function copyBoard(B) {

    let p = undefined; //currentSelecyed piece
    if (B.CurrentSelected != undefined) {
        //make new currentSelected piece
        if (B.CurrentSelected.name == "Pawn") {
            p = new Pawn(B.CurrentSelected.color, B.CurrentSelected.i, B.CurrentSelected.j);
        }
        if (B.CurrentSelected.name == "King") {
            p = new King(B.CurrentSelected.color, B.CurrentSelected.i, B.CurrentSelected.j);
        }
        if (B.CurrentSelected.name == "Knight") {
            p = new Knight(B.CurrentSelected.color, B.CurrentSelected.i, B.CurrentSelected.j);
        }
        if (B.CurrentSelected.name == "Bishop") {
            p = new Bishop(B.CurrentSelected.color, B.CurrentSelected.i, B.CurrentSelected.j);
        }
        if (B.CurrentSelected.name == "Rook") {
            p = new Rook(B.CurrentSelected.color, B.CurrentSelected.i, B.CurrentSelected.j);
        }
        if (B.CurrentSelected.name == "Queen") {
            p = new Queen(B.CurrentSelected.color, B.CurrentSelected.i, B.CurrentSelected.j);
        }
        p.moved = B.CurrentSelected.moved;
    }
    let cloneBoard = {
        Squares: [],
        Side: B.Side,
        Turn: B.Turn,
        CurrentSelected: p,
        WhiteCheck: B.WhiteCheck,
        BlackCheck: B.BlackCheck,
        GAMEMODE: B.GAMEMODE,
        WhiteScore: B.WhiteScore,
        BlackScore: B.BlackScore,
        CheckMateOnBlack: B.CheckMateOnBlack,
        CheckMateOnWhite: B.CheckMateOnWhite,
    }

    //initilialize Squares
    {
        cloneBoard.Squares = [];
        for (let i = 0; i < 9; i++) {
            cloneBoard.Squares.push(new Array(9));
        }
        for (let i = 1; i < 9; i++) {
            for (let j = 1; j < 9; j++) {
                let pce = undefined;
                if (B.Squares[i][j].piece != undefined) {//initialize square piece
                    if (B.Squares[i][j].piece.name == "Pawn") {
                        pce = new Pawn(B.Squares[i][j].piece.color, B.Squares[i][j].piece.i, B.Squares[i][j].piece.j);
                    }
                    if (B.Squares[i][j].piece.name == "King") {
                        pce = new King(B.Squares[i][j].piece.color, B.Squares[i][j].piece.i, B.Squares[i][j].piece.j);
                    }
                    if (B.Squares[i][j].piece.name == "Queen") {
                        pce = new Queen(B.Squares[i][j].piece.color, B.Squares[i][j].piece.i, B.Squares[i][j].piece.j);
                    }
                    if (B.Squares[i][j].piece.name == "Knight") {
                        pce = new Knight(B.Squares[i][j].piece.color, B.Squares[i][j].piece.i, B.Squares[i][j].piece.j);
                    }
                    if (B.Squares[i][j].piece.name == "Bishop") {
                        pce = new Bishop(B.Squares[i][j].piece.color, B.Squares[i][j].piece.i, B.Squares[i][j].piece.j);
                    }
                    if (B.Squares[i][j].piece.name == "Rook") {
                        pce = new Rook(B.Squares[i][j].piece.color, B.Squares[i][j].piece.i, B.Squares[i][j].piece.j);
                    }
                    pce.moved = B.Squares[i][j].piece.moved;
                }
                //troublesome////////////////////////////////////////
                cloneBoard.Squares[i][j] = {
                    piece: pce,
                    potentialWhiteCheck: B.Squares[i][j].potentialWhiteCheck,
                    potentialBlackCheck: B.Squares[i][j].potentialBlackCheck,
                }
            }
        }
    }
    return cloneBoard;

}
function makePopUp(event){
    let body = document.getElementsByClassName('Container')[0];
    
    let popUpHeader = "<div class='PopUpHeader'> <h1 class='PopUpText'>"+ event +"</h1>    </div>";

    let difficultyText = "<h2 class='PopUpBodyText' style='margin-top: 8px;'>Choose Difficulty:</h2>"
    let normal = "<button onclick=chooseDifficulty(2) class='ChooseSideButton DifficultyButton'> Easy </button>";
    let tough = "<button onclick=chooseDifficulty(3) class='ChooseSideButton DifficultyButton' autofocus> Medium </button>";
    let hard = "<button onclick=chooseDifficulty(4) class='ChooseSideButton DifficultyButton'> Hard (Slow) </button>";
    let extreme = "<button onclick=chooseDifficulty(5) class='ChooseSideButton DifficultyButton'> Extreme (Super Slow) </button>";

    let popUpBodyText = "<h1 class='PopUpBodyText'>Choose Side:</h1>";
    let whiteButton = "<button onclick=chooseSide('White') class='ChooseSideButton'><img src='Images/Pieces/WhiteKing.png' height='50vw'></button>";
    let blackButton = "<button onclick=chooseSide('Black') class='ChooseSideButton'><img src='Images/Pieces/BlackKing.png' height='50vw'></button>";
    
    
    let br = "<br>";
    let viewBoard = "<button onclick=viewBoard() class='viewBoardButton' > View Board </button>";


    let popUpBody = "<div class='PopUpBody'>" + 
                    difficultyText + 
                    normal + tough + hard + extreme +
                    
                    popUpBodyText + 
                    whiteButton + blackButton + 
                    
                    br + 
                    viewBoard+  "</div>";


    let popUp = "<div id='PopUp'>"+ popUpHeader + popUpBody +"</div>";
    body.innerHTML += popUp;
}





function makePromotion(color, i, j){
    let node = document.createElement("div");
    makingPromotion = true;    

    if(color != OpponentSide){
        let QueenPromote = "<div class='PromotionOptions' id='QueenPromote'><img src='Images/Pieces/"+color+"Queen.png' width='90%' height='90%'></div>";
        let KnightPromote = "<div class='PromotionOptions' id='KnightPromote'><img src='Images/Pieces/"+color+"Knight.png' width='90%' height='90%'></div>";
        let RookPromote = "<div class='PromotionOptions' id='RookPromote'><img src='Images/Pieces/"+color+"Rook.png' width='90%' height='90%'></div>";
        let BishopPromote = "<div class='PromotionOptions' id='BishopPromote'><img src='Images/Pieces/"+color+"Bishop.png' width='90%' height='90%'></div>";
    
        node.innerHTML = "<div id='Promotion'>" + QueenPromote + KnightPromote + RookPromote + BishopPromote + "</div>";
    
        document.getElementsByTagName("body")[0].appendChild(node);
    
        document.getElementById("QueenPromote").addEventListener("click", function(){
            if(color == "White"){
                Board.Squares[i][j].piece = new Queen("White", i, j);
            }else{ //Black
                Board.Squares[i][j].piece = new Queen("Black", i, j);
            }
            calculateScore(Board,"White");
            calculateScore(Board,"Black");
            document.getElementById("Promotion").remove();
            drawBoard();
            resetPotentialChecks(Board);
            checkFlag();
            makingPromotion = false;
            resetTurnsAndAnalyzeCheckmates();
        });
        document.getElementById("KnightPromote").addEventListener("click", function(){
            if(color == "White"){
                Board.Squares[i][j].piece = new Knight("White", i, j);
            }else{ //Black
                Board.Squares[i][j].piece = new Knight("Black", i, j);
            }
            calculateScore(Board,"White");
            calculateScore(Board,"Black");
            document.getElementById("Promotion").remove();
            drawBoard();
            resetPotentialChecks(Board);
            checkFlag();
            makingPromotion = false;
            resetTurnsAndAnalyzeCheckmates();
        });
        document.getElementById("RookPromote").addEventListener("click", function(){
            if(color == "White"){
                Board.Squares[i][j].piece = new Rook("White", i, j);
            }else{ //Black
                Board.Squares[i][j].piece = new Rook("Black", i, j);
            }
            calculateScore(Board,"White");
            calculateScore(Board,"Black");
            document.getElementById("Promotion").remove();
            drawBoard();
            resetPotentialChecks(Board);
            checkFlag();
            makingPromotion = false;
            resetTurnsAndAnalyzeCheckmates();
        });
        document.getElementById("BishopPromote").addEventListener("click", function(){
            if(color == "White"){
                Board.Squares[i][j].piece = new Bishop("White", i, j);
            }else{ //Black
                Board.Squares[i][j].piece = new Bishop("Black", i, j);
            }
            calculateScore(Board,"White");
            calculateScore(Board,"Black");
            document.getElementById("Promotion").remove();
            drawBoard();
            resetPotentialChecks(Board);
            checkFlag();
            makingPromotion = false;
            resetTurnsAndAnalyzeCheckmates();
        });
    }
    else{
        //minimax will choose queen anyway since it has highest value
        if(color == "White"){
            Board.Squares[i][j].piece = new Queen("White", i, j);
        }else{ //Black
            Board.Squares[i][j].piece = new Queen("Black", i, j);
        }
        resetPotentialChecks(Board);
        calculateScore(Board,"White");
        calculateScore(Board,"Black");
        drawBoard();
        makingPromotion = false;
    }
    

    
}
function checkFlag() {
    if(makingPromotion == true) {
       window.setTimeout(checkFlag, 100); /* this checks the flag every 100 milliseconds*/
    } else {
      /* do something*/
    }
}
//make a function for calculating score

function calculateScore(B,s){
    let score = 0;
    for(let i = 1; i < 9; i++){
        for(let j = 1; j < 9; j++){
            if(B.Squares[i][j].piece != undefined && B.Squares[i][j].piece.color == s){
                score += B.Squares[i][j].piece.value;
            }
        }
    }
    if(s == "White"){
        B.WhiteScore = score;
    }else{
        B.BlackScore = score;
    }
}

function areMovesLegal(moves){
    for(let i = 0; i < moves.length; i++){
        if(moves[i].legalMove){
            return true;
        }
    }
    return false;
}
restart();
function getAllMovesExceptKing(B, s){
    let moves = [];
        for(let i = 1; i < 9; i++){
            for(let j = 1; j < 9; j++){
                if(B.Squares[i][j].piece != undefined && B.Squares[i][j].piece.color == s && B.Squares[i][j].piece.name != "King"){ //not king
                   
                    let m = B.Squares[i][j].piece.getMoves(B);
                    for(let k = 0; k < m.length; k++){
                        let oi = i;
                        let oj = j;
                        let ni = m[k].i;
                        let nj = m[k].j;
                        move = new Move(oi,oj,ni,nj);
                        moves.push(move);
                    }
                }
            }
        }
    return moves;
}

function sound(){
    var snd = new Audio("Sound/ChessMoveSound.mp3");
    snd.volume = 0.5;
    snd.play();
    snd.currentTime=0;
}

function viewBoard(){
    let popUp = document.getElementById("PopUp");
    popUp.remove();
}
