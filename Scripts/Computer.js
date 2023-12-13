let OpponentSide="";
let movesPlayed = 0;

let depth = 3;  // default depth set to medium level

function assignOpponentSide(side){
    OpponentSide = side;
}

// function to calculate the opponent's move
function calculateOpponentMove() {
    let moveObj;    // stores the chosen move
    const isWhite = OpponentSide === "White";   // checks if opponent is playing as white
    const isFirstMove = movesPlayed === 0;      // checks if it's the first move of the game

    if (isWhite || OpponentSide === "Black") {
        if (isFirstMove) {
            // generate initial moves for the first move
            const moves = isWhite ? [new Move(2, 4, 4, 4), new Move(2, 4, 4, 4), new Move(1, 2, 3, 3), new Move(1, 7, 3, 6)] 
                                  : [new Move(1, 2, 3, 3), new Move(1, 7, 3, 6)];
            // select a random move from the generated moves
            moveObj = new optimalMoveObj(undefined, moves[Math.floor(Math.random() * moves.length)]);
        } else {
            // use the Minimax algorithm to find the best move
            moveObj = isWhite ? MAXIMIZE(Board, depth, -999999, 999999) 
                              : MINIMIZE(Board, depth, -999999, 999999);
        }
        movesPlayed++;
    }

    // extract and make the chosen move on the chessboard
    const { oldI, oldJ, newI, newJ } = moveObj.move;
    makeMove(oldI, oldJ, newI, newJ);
}



// Maximizing function for the computer's move selection
function MAXIMIZE(B, depth, alpha, beta) {
    // base case: if depth is 0 return the utility for the current board state
    if (depth === 0) {
        return new optimalMoveObj(calculateUtility(B), undefined);
    }

    let maxUtility = -Infinity;
    let bestMoves = [];

    // get all possible moves for White on the current board
    let possibilities = getAllMoves(B, "White");

    // iterate through each possible move
    for (let possibility of possibilities) {
        // calculate the utility for the current move and depth
        let utility = getUtilityForMove(B, possibility, depth, MINIMIZE);

        // if the utility for this move is greater than the current maxUtility,
        // update the maxUtility and reset the bestMoves array with this move
        if (utility > maxUtility) {
            bestMoves = [possibility];
            maxUtility = utility;
        // if the utility is equal tot the current maxUtitliy, add this move to the bestMoves array
        } else if (utility === maxUtility) {
            bestMoves.push(possibility);
        }

        // update alpha with the maximun utility value encountered do far
        alpha = Math.max(alpha, utility);

        // if beta is less than or equal to alpha, prune the search and break out of the loop
        if (beta <= alpha) {
            break;
        }
    }

    // Return an optimalMoveObj containing the maxUtility and a randomly selected move from bestMoves.
    return new optimalMoveObj(maxUtility, getRandomElement(bestMoves));
}

// calculate the utility value for the given specifc move
function getUtilityForMove(B, move, depth, nextFunction) {
    let cloneBoard = copyBoard(B);  // clone the board to simulate the move
    applyMove(cloneBoard, move);    // apply the move to the cloned board

    // recursively call the next funtion (maximize or minimize) to calculate the utility
    return nextFunction(cloneBoard, depth - 1, -Infinity, Infinity).utility;
}

// applies a move to given baord state
function applyMove(B, move) {
    // extract the old and new position from the move
    let { newI, newJ, oldI, oldJ } = move;
    // move the chess pice from old position to new position
    B.Squares[newI][newJ].piece = B.Squares[oldI][oldJ].piece;
    B.Squares[oldI][oldJ].piece = undefined;

    // update the coordiantes and moved status of the piece if it exists
    if (B.Squares[newI][newJ].piece) {
        B.Squares[newI][newJ].piece.i = newI;
        B.Squares[newI][newJ].piece.j = newJ;
        B.Squares[newI][newJ].piece.moved = true;
    }
}

// returns random element from the array
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function MINIMIZE(B, depth, alpha, beta) {
    if (depth === 0) {
        return new optimalMoveObj(calculateUtility(B), undefined);
    }

    let minUtility = Infinity;
    let bestMoves = [];

    let possibilities = getAllMoves(B, "Black");

    for (let possibility of possibilities) {
        let utility = getUtilityForMove(B, possibility, depth, MAXIMIZE);
        
        if (utility < minUtility) {
            bestMoves = [possibility];
            minUtility = utility;
        } else if (utility === minUtility) {
            bestMoves.push(possibility);
        }
        
        beta = Math.min(beta, utility);
        
        if (beta <= alpha) {
            break;
        }
    }

    return new optimalMoveObj(minUtility, getRandomElement(bestMoves));
}



// calculate the utility value for the current board state
// computes a simple score difference as the utility
function calculateUtility(B){
    // calculate and return the difference between the white player's score and the black player's score
    calculateScore(B, "White");
    calculateScore(B, "Black");

    return B.WhiteScore - B.BlackScore;
}

// represents an object that contains the optimal move and the utility
class optimalMoveObj{

    constructor(u, m){
        this.utility = u;
        this.move = m;
    }
}

// object that represents a chess move with old coordinate and the new coordinate
class Move{
    constructor(oi, oj, ni, nj){
        this.oldI = oi;
        this.oldJ = oj;
        this.newI = ni;
        this.newJ = nj;
        this.utility = undefined;   // utility associated with the move,
    }
}

// get all possible moves for the given player's color and the current board
function getAllMoves(B,s){

    let moves = [];

        // itereate through the board's squares to find all valid moves for the player's side
        for(let i = 1; i < 9; i++){
            for(let j = 1; j < 9; j++){
                if(B.Squares[i][j].piece != undefined && B.Squares[i][j].piece.color == s){
                   // calculate all valid moves for current piece and add them to moves array
                    let m = B.Squares[i][j].piece.getMoves(B);
                    for(let k = 0; k < m.length; k++){
                        let oi = i; // old row
                        let oj = j; // old col
                        let ni = m[k].i;    // new row
                        let nj = m[k].j;    // new col
                        move = new Move(oi,oj,ni,nj);
                        moves.push(move);
                    }
                }
            }
        }
        return moves;
}




