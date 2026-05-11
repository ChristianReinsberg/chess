export type Color = 'white' | 'black';

export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';

export interface Piece {
    type: PieceType;
    color: Color;
    isMoved: boolean;
    isTaken: boolean;
    moves: Move[];
    attacks: Move[];
};

export type Coord = {x: number, y: number};

export type Move = {x: number, y: number};

export type MoveCalculator = (board: Board, pos: Coord, color: Color) => {moves: Move[], attacks: Move[]};

export type Square = Piece | null;

export type Board = Square[][];

export interface GameState {
    lastMove: {from: Coord, to: Coord, pieceType: PieceType} | null;
    color: Color;
    removedPieces: {white: Piece[], black: Piece[]};
    promotions: {white: Piece[], black: Piece[]};
    enPassantTarget: Coord | null;
    winner: Color | null;
}