import { Board, Square, Color, MoveCalculator, PieceType, Move, Piece } from "./types";
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
    moveStrategies: Record<PieceType, MoveCalculator> = {
        'pawn': (board, pos, color) => {
            const moves: Move[] = [];
            const direction = color === 'black' ? 1 : -1;

            if (this.isEmpty(board, pos.x, pos.y + direction)) {
                moves.push({x: pos.x, y: pos.y + direction});
                const start = color === 'black' ? 1 : 6;
                if (pos.y === start && this.isEmpty(board, pos.x, pos.y + direction * 2)) {
                    moves.push({x: pos.x, y: pos.y + direction * 2});
                }
            }
            if (pos.x !== 7 && this.canStrike(board, pos.x + 1, pos.y + direction, color)) {
                moves.push({x: pos.x + 1, y: pos.y + direction});
            }
            if (pos.x !== 0 && this.canStrike(board, pos.x - 1, pos.y - direction, color)) {
                moves.push({x: pos.x - 1, y: pos.y - direction});
            }
            return moves
        },
        'knight': (board, pos, color) => {
            const moves: Move[] = [];
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
                    if (currentSquare === null) {
                        moves.push({x: nextX, y: nextY});
                    } else if (currentSquare.color !== color) {
                        moves.push({x: nextX, y: nextY});
                    }
                }
            }
            return moves},
        'bishop': (board, pos, color) => {return []},
        'rook': (board, pos, color) => {
            const moves: Move[] = [];
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
                        moves.push({x: nextX, y: nextY})
                    } else {
                        if (currentSquare.color !== color) {
                            moves.push({x: nextX, y: nextY});
                        }
                        break;
                    }
                    nextX += dx;
                    nextY += dy;
                }
            }
            return moves},
        'queen': (board, pos, color) => {return [...this.moveStrategies.bishop(board, pos, color), ...this.moveStrategies.rook(board, pos, color)]},
        'king': (board, pos, color) => {return []}
    }

    constructor() {
        this.initBoard();
        console.log(this.board);
    }

    initBoard() {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const div = document.createElement('div');
                div.className = (i + j) % 2 ? 'bg-black size-8 lg:size-19' : 'bg-white size-8 lg:size-19';
                this.chessBoard.append(div);
                if (i === 1 || i === 6) {
                    this.board[j][i] = this.initPawns(i === 1 ? 'black' : 'white', j, div)
                }
                if (i === 0 || i === 7) {
                    this.board[j][i] = this.initSpecials(i === 0 ? 'black' : 'white', j, div);
                }
            }
        }
        this.refreshAllMoves();
    }

    initPawns(color: Color, x: number, div: HTMLDivElement) {
        const img = document.createElement('img');
        img.className = 'w-full aspect-square';
        img.src = color === 'black' ? BlackPawn : WhitePawn;
        div.append(img);
        return {
            type: 'pawn' as PieceType,
            color,
            isMoved: false,
            isTaken: false,
            moves: [],
        };
    }

    initSpecials(color: Color, x: number, div: HTMLDivElement) {
        const img = document.createElement('img');
        img.className = 'w-full aspect-square';
        const piece: Record<number, Piece> = {
            0: {type: 'rook', color, isMoved: false, isTaken: false, moves: []},
            1: {type: 'knight', color, isMoved: false, isTaken: false, moves: []},
            2: {type: 'bishop', color, isMoved: false, isTaken: false, moves: []},
            3: {type: 'queen', color, isMoved: false, isTaken: false, moves: []},
            4: {type: 'king', color, isMoved: false, isTaken: false, moves: []},
        };
        if (x === 0 || x === 7) {
            img.src = color === 'black' ? BlackRook : WhiteRook;
            div.append(img)
            return piece[0];
        }
        if (x === 1 || x === 6) {
            img.src = color === 'black' ? BlackKnight : WhiteKnight;
            div.append(img)
            return piece[1];
        }
        if (x === 2 || x === 5) {
            img.src = color === 'black' ? BlackBishop : WhiteBishop;
            div.append(img)
            return piece[2];
        }
        if (x === 3) {
            img.src = color === 'black' ? BlackQueen : WhiteQueen;
            div.append(img)
            return piece[3];
        }
        img.src = color === 'black' ? BlackKing : WhiteKing;
        div.append(img)
        return piece[4];
    }

    isEmpty(board: Board, posX: number, posY: number) {
        return board[posX][posY] === null;
    }

    canStrike(board: Board, posX: number, posY: number, color: Color) {
        return (board[posX][posY] !== null && board[posX][posY]?.color !== color);
    }

    refreshAllMoves() {
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = this.board[x][y];
                if (piece) {
                    piece.moves = this.moveStrategies[piece.type](this.board, {x, y}, piece.color);
                }
            }
        }
    }
}