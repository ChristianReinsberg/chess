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
            if (pos.x !== 0 && this.canStrike(board, pos.x - 1, pos.y + direction, color)) {
                moves.push({x: pos.x - 1, y: pos.y - direction});
            }
            return moves
        },
        'knight': (board, pos, color) => {
            const moves: Move[] = [];
            return []},
        'bishop': (board, pos, color) => {return []},
        'rook': (board, pos, color) => {return []},
        'queen': (board, pos, color) => {return [...this.moveStrategies.bishop(board, pos, color), ...this.moveStrategies.rook(board, pos, color)]},
        'king': (board, pos, color) => {return []}
    }

    constructor() {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const div = document.createElement('div');
                div.className = (i + j) % 2 ? 'bg-[#202224] size-8 lg:size-19' : 'bg-white size-8 lg:size-19';
                this.chessBoard.append(div);
                if (i === 1 || i === 6) {
                    this.board[j][i] = this.initPawns(i === 1 ? 'black' : 'white', j, div)
                }
                if (i === 0 || i === 7) {
                    this.board[j][i] = this.initSpecials(i === 0 ? 'black' : 'white', j, div);
                }
            }
        }
        console.log(this.board);
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
            moves: this.moveStrategies.pawn(this.board, {x: x, y: color === 'black' ? 1 : 6}, color),
        };
    }

    initSpecials(color: Color, x: number, div: HTMLDivElement) {
        const img = document.createElement('img');
        img.className = 'w-full aspect-square';
        const piece: Record<number, Piece> = {
            0: {type: 'rook', color, isMoved: false, isTaken: false, moves: this.moveStrategies.rook(this.board, {x, y: color === 'black' ? 0 : 7}, color)},
            1: {type: 'knight', color, isMoved: false, isTaken: false, moves: this.moveStrategies.knight(this.board, {x, y: color === 'black' ? 0 : 7}, color)},
            2: {type: 'bishop', color, isMoved: false, isTaken: false, moves: this.moveStrategies.bishop(this.board, {x, y: color === 'black' ? 0 : 7}, color)},
            3: {type: 'queen', color, isMoved: false, isTaken: false, moves: this.moveStrategies.queen(this.board, {x, y: color === 'black' ? 0 : 7}, color)},
            4: {type: 'king', color, isMoved: false, isTaken: false, moves: this.moveStrategies.king(this.board, {x, y: color === 'black' ? 0 : 7}, color)},
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
}