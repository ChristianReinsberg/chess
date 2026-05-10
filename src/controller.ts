import { Board, Square, Color, MoveCalculator, PieceType, Move, Piece, Coord, GameState } from "./types";
import BlackBishop from './assets/black_bishop.svg';
import BlackKing from './assets/black_king.svg';
import BlackKnight from './assets/black_knight.svg';
import BlackPawn from './assets/black_pawn.svg';
import BlackQueen from './assets/black_queen.svg';
import BlackRook from './assets/black_rook.svg';
import WhiteBishop from './assets/white_bishop.svg';
import WhiteKing from './assets/white_king.svg';
import WhiteKnight from './assets/white_knight.svg';
import WhitePawn from './assets/white_pawn.svg';
import WhiteQueen from './assets/white_queen.svg';
import WhiteRook from './assets/white_rook.svg';

export class Controller {
    board: Board = [new Array(8).fill(null), new Array(8).fill(null), new Array(8).fill(null), new Array(8).fill(null), new Array(8).fill(null), new Array(8).fill(null), new Array(8).fill(null), new Array(8).fill(null)];
    chessBoard = document.querySelector('#chess-board') as HTMLElement;
    activePieces: {piece: Square, coord: Coord}[] = [];
    x_letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    y_numbers = [8, 7, 6, 5, 4, 3, 2, 1];
    gameState: GameState = {lastMove: null, color: 'white', removedPieces: {black: [], white: []}, promotions: {black: [], white: []}, enPassantTarget: null};
    moveStrategies: Record<PieceType, MoveCalculator> = {
        'pawn': (board, pos, color) => {
            const moves: Move[] = [];
            const attacks: Move[] = []
            const direction = color === 'black' ? 1 : -1;

            if (this.isEmpty(board, pos.x, pos.y + direction)) {
                moves.push({x: pos.x, y: pos.y + direction});
                const start = color === 'black' ? 1 : 6;
                if (pos.y === start && this.isEmpty(board, pos.x, pos.y + direction * 2)) {
                    moves.push({x: pos.x, y: pos.y + direction * 2});
                }
            }
            const targets = [{dx: 1, dy: direction}, {dx: -1, dy: direction}];
            for (const {dx, dy} of targets) {
                const tx = pos.x + dx;
                const ty = pos.y + dy;
                if (tx >= 0 && tx < 8 && ty >= 0 && ty < 8) {
                    attacks.push({x: tx, y: ty});
                    if (this.canStrike(board, tx, ty, color)) {
                        moves.push({x: tx, y: ty});
                    }
                }
            }
            return {moves, attacks}
        },
        'knight': (board, pos, color) => {
            const moves: Move[] = [];
            const attacks: Move[] = [];
            const directions = [
                {dx: 2, dy: 1},
                {dx: 1, dy: 2},
                {dx: -2, dy: 1},
                {dx: -1, dy: 2},
                {dx: 2, dy: -1},
                {dx: 1, dy: -2},
                {dx: -2, dy: -1},
                {dx: -1, dy: -2},
            ];

            for(const {dx, dy} of directions) {
                const nextX = pos.x + dx;
                const nextY = pos.y + dy;

                if (nextX >= 0 && nextX < 8 && nextY >= 0 && nextY < 8) {
                    const currentSquare = board[nextX][nextY];
                    if (currentSquare === null || currentSquare.color !== color) {
                        moves.push({x: nextX, y: nextY});
                        attacks.push({x: nextX, y: nextY});
                    }
                }
            }
            return {moves, attacks}
        },
        'bishop': (board, pos, color) => {
            const moves: Move[] = [];
            const attacks: Move[] = [];
            const directions = [
                {dx: 1, dy: 1},
                {dx:1, dy: -1},
                {dx: -1, dy: 1},
                {dx: -1, dy: -1},
            ];

            for (const {dx, dy} of directions) {
                let nextX = pos.x + dx;
                let nextY = pos.y + dy;

                while (nextX >= 0 && nextX < 8 && nextY >= 0 && nextY < 8) {
                    const currentSquare = board[nextX][nextY];
                    if (currentSquare === null) {
                        moves.push({x: nextX, y: nextY});
                        attacks.push({x: nextX, y: nextY});
                    } else {
                        if (currentSquare.color !== color) {
                            moves.push({x: nextX, y: nextY});
                            attacks.push({x: nextX, y: nextY});
                        }
                        break;
                    }
                    nextX += dx;
                    nextY += dy;
                }
            }
            return {moves, attacks};
        },
        'rook': (board, pos, color) => {
            const moves: Move[] = [];
            const attacks: Move[] = [];
            const directions = [
                {dx: 1, dy: 0},
                {dx: 0, dy: 1},
                {dx: -1, dy: 0},
                {dx: 0, dy: -1},
            ];

            for (const {dx, dy} of directions) {
                let nextX = pos.x + dx;
                let nextY = pos.y + dy;

                while (nextX >= 0 && nextX < 8 && nextY >= 0 && nextY < 8) {
                    const currentSquare = board[nextX][nextY];
                    if (currentSquare === null) {
                        moves.push({x: nextX, y: nextY});
                        attacks.push({x: nextX, y: nextY});
                    } else {
                        if (currentSquare.color !== color) {
                            moves.push({x: nextX, y: nextY});
                            attacks.push({x: nextX, y: nextY});
                        }
                        break;
                    }
                    nextX += dx;
                    nextY += dy;
                }
            }
            return {moves, attacks}},
        'queen': (board, pos, color) => {return {moves: this.moveStrategies.bishop(board, pos, color).moves.concat(this.moveStrategies.rook(board, pos, color).moves), attacks: this.moveStrategies.bishop(board, pos, color).attacks.concat(this.moveStrategies.rook(board, pos, color).attacks)} },
        'king': (board, pos, color) => {
            const moves: Move[] = [];
            const attacks: Move[] = [];

            const directions = [
                {dx: 0, dy: 1},
                {dx: 0, dy: -1},
                {dx: 1, dy: 1},
                {dx: 1, dy: 0},
                {dx: 1, dy: -1},
                {dx: -1, dy: 1},
                {dx: -1, dy: 0},
                {dx: -1, dy: -1},
            ];
            for(const {dx, dy} of directions) {
                const nextX = pos.x + dx;
                const nextY = pos.y + dy;
                if (nextX >= 0 && nextX < 8 && nextY >= 0 && nextY < 8) {
                    const currentSquare = board[nextX][nextY];
                    if (currentSquare === null || currentSquare.color !== color) {
                        if (!this.isSquareAttacked({x: nextX, y: nextY})) {
                            moves.push({x: nextX, y: nextY});
                        }
                        attacks.push({x: nextX, y: nextY});
                    }
                }
            }
            if (this.canCastle(color, 'king')) {
                moves.push({x: 6, y: pos.y});
            }
            if (this.canCastle(color, 'queen')) {
                moves.push({x: 2, y: pos.y});
            }
            return {moves, attacks}}
    }

    constructor() {
        this.initBoard();
    }

    initBoard() {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const div = document.createElement('div');
                div.dataset.xcoord = j.toString();
                div.dataset.ycoord = i.toString();
                div.id = `${this.x_letters[j]}${this.y_numbers[i]}`;
                div.className = (i + j) % 2 ? 'bg-black size-8 lg:size-19' : 'bg-white size-8 lg:size-19';
                this.chessBoard.append(div);
                if (i === 1 || i === 6) {
                    this.board[j][i] = this.initPawns(i === 1 ? 'black' : 'white', j, i, div)
                }
                if (i === 0 || i === 7) {
                    this.board[j][i] = this.initSpecials(i === 0 ? 'black' : 'white', j, i, div);
                }
            }
        }
        this.refreshAllMoves();
    }

    initPawns(color: Color, x: number, y: number, div: HTMLDivElement) {
        const img = document.createElement('img');
        img.className = 'w-full aspect-square';
        img.dataset.xcoord = x.toString();
        img.dataset.ycoord = y.toString();
        img.src = color === 'black' ? BlackPawn : WhitePawn;
        img.id = `${color}-pawn-${x}`;
        div.append(img); 
        return {
            type: 'pawn' as PieceType,
            color,
            isMoved: false,
            isTaken: false,
            moves: [],
            attacks: [],
        };
    }

    initSpecials(color: Color, x: number, y: number, div: HTMLDivElement) {
        const img = document.createElement('img');
        img.className = 'w-full aspect-square';
        img.dataset.xcoord = x.toString();
        img.dataset.ycoord = y.toString();
        const piece: Record<number, Piece> = {
            0: {type: 'rook', color, isMoved: false, isTaken: false, moves: [], attacks: []},
            1: {type: 'knight', color, isMoved: false, isTaken: false, moves: [], attacks: []},
            2: {type: 'bishop', color, isMoved: false, isTaken: false, moves: [], attacks: []},
            3: {type: 'queen', color, isMoved: false, isTaken: false, moves: [], attacks: []},
            4: {type: 'king', color, isMoved: false, isTaken: false, moves: [], attacks: []},
        };
        if (x === 0 || x === 7) {
            img.src = color === 'black' ? BlackRook : WhiteRook;
            img.id = `${color}-rook-${x}`;
            div.append(img)
            return piece[0];
        }
        if (x === 1 || x === 6) {
            img.src = color === 'black' ? BlackKnight : WhiteKnight;
            img.id = `${color}-knight-${x}`;
            div.append(img)
            return piece[1];
        }
        if (x === 2 || x === 5) {
            img.src = color === 'black' ? BlackBishop : WhiteBishop;
            img.id = `${color}-bishop-${x}`;
            div.append(img)
            return piece[2];
        }
        if (x === 3) {
            img.src = color === 'black' ? BlackQueen : WhiteQueen;
            img.id = `${color}-queen-${x}`;
            div.append(img)
            return piece[3];
        }
        img.src = color === 'black' ? BlackKing : WhiteKing;
        img.id = `${color}-king-${x}`;
        div.append(img)
        return piece[4];
    }

    isEmpty(board: Board, posX: number, posY: number) {
        return board[posX][posY] === null;
    }

    canStrike(board: Board, posX: number, posY: number, color: Color) {
        return (board[posX][posY] !== null && board[posX][posY]?.color !== color) || (posX === this.gameState.enPassantTarget?.x && posY === this.gameState.enPassantTarget?.y);
    }

    refreshAllMoves() {
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = this.board[x][y];
                if (piece) {
                    const result = this.moveStrategies[piece.type](this.board, {x, y}, piece.color)
                    piece.moves = result.moves;
                    piece.attacks = result.attacks;
                    this.activePieces.push({piece, coord: {x, y}});
                }
            }
        }
    }

    selectPiece(piece: HTMLElement) {
        const coords: Coord = {x: +(piece.dataset.xcoord as string), y: +(piece.dataset.ycoord as string)};
        let square = this.board[coords.x][coords.y];
        if (square) {
            square.moves = this.moveStrategies[square?.type as PieceType](this.board, coords, square?.color as Color).moves;
            for (const move of square.moves) {
                let target = document.querySelector(`[data-xcoord="${move.x}"][data-ycoord="${move.y}"]`) as HTMLElement;
                this.board[move.x][move.y]?.color !== square.color && this.board[move.x][move.y] !== null ? target.classList.add('bg-red-300!') : target.classList.add('bg-yellow-300!');
            }
        }
    }

    movePiece(piece: HTMLElement, target: Coord) {
        const from: Coord = {x: +piece.dataset.xcoord!, y: +piece.dataset.ycoord!}
        const pieceData = this.board[from.x][from.y];

        if (!pieceData) {
            return;
        }

        const isValidMove = pieceData.moves.some(m => m.x === target.x && m.y === target.y);
        if (!isValidMove) {
            return;
        }
        this.clearHighlights(pieceData.moves);
        this.gameState.color = this.gameState.color === 'white' ? 'black' : 'white';
        this.gameState.lastMove = {from, to: target, pieceType: pieceData.type};
        if (pieceData.type === 'king' && Math.abs(target.x - from.x) === 2) {
            const rookFromX = target.x === 6 ? 7 : 0;
            const rookToX = target.x === 6 ? 5 : 3;
            this.castleRookMove({x: rookFromX, y: from.y}, {x: rookToX, y: target.y});
        }
        this.board[from.x][from.y] = null;
        const targetPiece = this.board[target.x][target.y];
        let enPassantTarget: Square = null;
        const direction = pieceData.color === 'white' ? 1 : -1;
        if (this.gameState.enPassantTarget !== null) {
            if (target.x === this.gameState.enPassantTarget?.x && target.y === this.gameState.enPassantTarget?.y) {
                enPassantTarget = this.board[target.x][target.y + direction];
            }
        }
        this.board[target.x][target.y] = pieceData;
        pieceData.isMoved = true;
        this.gameState.lastMove = {from, to: target, pieceType: pieceData.type};
        this.gameState.color = pieceData.color === 'black' ? 'white' : 'black';
        if (targetPiece || enPassantTarget) {
            const to = {x: target.x, y: enPassantTarget !== null ? target.y + direction : target.y};
            enPassantTarget !== null ? this.gameState.removedPieces[this.gameState.color].push(enPassantTarget as Piece) : this.gameState.removedPieces[this.gameState.color].push(targetPiece as Piece);
            this.removeTargetElement(to);
            if (enPassantTarget) {
                this.board[to.x][to.y] = null;
            }
            this.activePieces.splice(this.activePieces.indexOf(this.activePieces.find(active => active.coord.x === target.x && active.coord.y === to.y)!), 1);
        }
        
        piece.dataset.xcoord = target.x.toString();
        piece.dataset.ycoord = target.y.toString();

        const {moves, attacks} = this.moveStrategies[pieceData.type](this.board, target, pieceData.color);
        pieceData.attacks = attacks;
        pieceData.moves = moves;
        this.activePieces[this.activePieces.indexOf(this.activePieces.find(active => active.coord.x === from.x && active.coord.y === from.y)!)] = {piece: pieceData, coord: target};
        this.updateActiveMoves();
        if (pieceData.type === 'pawn' && Math.abs(target.y - from.y) === 2) {
            this.gameState.enPassantTarget = {x: target.x, y: target.y + direction};
        } else {
            this.gameState.enPassantTarget = null;
        }
        this.updateElementPosition(piece, target);
    }

    private clearHighlights(moves: Move[]) {
        moves.forEach(move => {
            const el = document.querySelector(`[data-xcoord="${move.x}"][data-ycoord="${move.y}"]`);
            el?.classList.remove('bg-red-300!', 'bg-yellow-300!');
        });
    }

    updateElementPosition(piece: HTMLElement, target: Coord) {
        const tile = document.querySelector(`div[data-xcoord="${target.x}"][data-ycoord="${target.y}"]`);
        tile?.append(piece);
    }

    removeTargetElement(target: Coord) {
        const square = document.querySelector(`[data-xcoord="${target.x}"][data-ycoord="${target.y}"]`);
        if (square) {
            square.firstChild?.remove();
        }
    }

    isSquareAttacked(coord: Coord) {
        return this.activePieces
            .filter(piece => piece.piece!.color !== this.gameState.color)
            .some(piece => piece.piece!.attacks.some(attack => attack.x === coord.x && attack.y === coord.y));
    }

    updateActiveMoves() {
        this.activePieces.forEach(activePiece => {
            const {moves, attacks} = this.moveStrategies[activePiece.piece!.type](this.board, activePiece.coord, activePiece.piece!.color);
            activePiece.piece!.attacks = attacks;
            activePiece.piece!.moves = moves;
        });
    }

    canCastle(color: Color, side: 'king' | 'queen') {
        const y = color === 'black' ? 0 : 7;
        const king = this.board[4][y];
        const rookX = side === 'king' ? 7 : 0;
        const rook = this.board[rookX][y];

        if (!king || king.type !== 'king' || king.isMoved) {
            return false;
        }
        if (!rook || rook.type !== 'rook' || rook.isMoved) {
            return false;
        }
        if (this.isSquareAttacked({x: 4, y})) {
            return false;
        }

        const checkX = side === 'king' ? [5, 6] : [1, 2, 3];
        for (const x of checkX) {
            if (this.board[x][y] !== null) {
                return false;
            }
            if (this.isSquareAttacked({x, y})) {
                return false;
            }
        }

        return true;
    }

    castleRookMove(from: Coord, to: Coord) {
        const rookFrom = this.board[from.x][from.y];
        const piece = document.querySelector(`img[data-xcoord="${from.x}"][data-ycoord="${from.y}"]`) as HTMLElement;

        this.board[to.x][to.y] = rookFrom;
        this.board[from.x][from.y] = null;
        rookFrom!.isMoved = true;
        piece.dataset.xcoord = to.x.toString();
        piece.dataset.ycoord = to.y.toString();
        this.updateElementPosition(piece, to);
        this.activePieces[this.activePieces.indexOf(this.activePieces.find(active => active.coord.x === from.x && active.coord.y === from.y)!)] = {piece: rookFrom, coord: to};
    }
}