import {expect, it, describe, beforeEach} from 'vitest';
import {Controller} from '../src/controller.ts';

describe('Chess Board Logic', () => {
    let controller: Controller;
    beforeEach(() => {
        document.body.innerHTML = '<main id="chess-board" class="grid grid-cols-8 aspect-square border-8"></main>'
        controller = new Controller();
    })
    it ('should create a 8x8 board', () => {
        const board = controller.board;

        expect(board.length).toBe(8);
        expect(board[0].length).toBe(8);
    });

    it('should have a black rook at board[0][0]', () => {
        const board = controller.board;
        const cornerPiece = board[0][0];

        expect(cornerPiece?.type).toBe('rook');
        expect(cornerPiece?.color).toBe('black');
    });

    it('should not have a piece at the center', () => {
        const board = controller.board;
        
        expect(board[3][3]).toBeNull();
    });

    it('should load the correct svgs for each color', () => {
        const blackPawn = controller.board[0][1];
        const whitePawn = controller.board[0][6];

        expect(blackPawn?.color).toBe('black');
        expect(whitePawn?.color).toBe('white');

        const imgs = document.querySelectorAll('img');
        expect(imgs.length).toBe(32);
    });

    it('should have two initial moves for pawns', () => {
        const pawn = controller.board[0][1];

        expect(pawn?.moves.length).toBe(2);
    });

    it('should not have any initial moves for rooks', () => {
        const rook = controller.board[0][0];
        expect(rook?.moves.length).toBe(0);
    });

    it('should have moves for rooks, when the pawn in front is removed', () => {
        controller.board[0][1] = null;
        const rook = controller.board[0][0];
        if (rook) {
        rook.moves = controller.moveStrategies['rook'](controller.board, {x: 0, y: 0}, 'black');
        }
        expect(rook?.moves.length).toBeGreaterThan(0)
    });

    it('should have two initial moves for knights', () => {
        const knight = controller.board[1][0];
        expect(knight?.moves.length).toBe(2);
    })
});