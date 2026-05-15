import {expect, it, describe, beforeEach} from 'vitest';
import {Controller} from '../src/controller.ts';

describe('Chess Board Logic', () => {
    let controller: Controller;
    beforeEach(() => {
        document.body.innerHTML = '<main id="chess-board" class="grid grid-cols-8 aspect-square border-8"></main>'
        controller = new Controller();
    });
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

    it('should have 14 moves for a rook at D4, when the board is empty', () => {
        controller.board = Array.from({length: 8}, () => new Array(8).fill(null));
        const rook = controller.moveStrategies['rook'](controller.board, {x: 3, y: 4}, 'black');
        expect(rook?.moves.length).toBe(14);
    });

    it('should have two initial moves for knights', () => {
        const knight = controller.board[1][0];
        expect(knight?.moves.length).toBe(2);
    });

    it('should have five moves for a white knight on C3', () => {
        controller.board[1][7] = null;
        let knight = controller.board[2][5];
        knight = {type: 'knight', color: 'white', isMoved: true, isTaken: false, moves: [], attacks: []};
        const result = controller.moveStrategies['knight'](controller.board, {x: 2, y: 5}, 'white');
        knight.moves = result.moves;
        knight.attacks = result.attacks;
        expect(knight.moves.length).toBe(5);
    })

    it('should not have any initial moves for bishops', () => {
        const bishop = controller.board[2][0];
        expect(bishop?.moves.length).toBe(0);
    });

    it('should have six moves for white bishop on G4', () => {
        let bishop = controller.board[6][4];
        bishop = {type: 'bishop', color: 'white', isMoved: true, isTaken: false, moves: [], attacks: []};
        const result = controller.moveStrategies['bishop'](controller.board, {x: 6, y: 4}, 'white');
        bishop.moves = result.moves;
        bishop.attacks = result.attacks;
        expect(bishop.moves.length).toBe(6);
    });

    it('should not have any initial moves for queens', () => {
        const queen = controller.board[3][0];
        expect(queen?.moves.length).toBe(0);
    });

    it('should have 19 moves for a white queen on D4', () => {
        let queen = controller.board[3][4];
        queen = {type: 'queen', color: 'white', isMoved: true, isTaken: false, moves: [], attacks: []};
        const result = controller.moveStrategies['queen'](controller.board, {x: 3, y: 4}, 'white')
        queen.moves = result.moves;
        queen.attacks = result.attacks;
        expect(queen.moves.length).toBe(19);
    });

    it('should not have any initial moves for kings', () => {
        const king = controller.board[4][0];
        expect(king?.moves.length).toBe(0);
    });

    it('should have eight moves for a white king on E4', () => {
        let king = controller.board[4][4];
        king = {type: 'king', color: 'white', isMoved: true, isTaken: false, moves: [], attacks: []};
        const result = controller.moveStrategies['king'](controller.board, {x: 4, y: 4}, 'white');
        king.moves = result.moves;
        king.attacks = result.attacks;
        expect(king.moves.length).toBe(8);
    });

    it('should reset game when resetGame is called', () => {
        const square = {x: 0, y: 0};
        const index = controller.activePieces.indexOf(controller.activePieces.find(piece => piece.coord.x === square.x && piece.coord.y === square.y)!);
        controller.activePieces.splice(index, 1);
        controller.board[square.x][square.y] = null;
        expect(controller.board[0][0]).toBeNull();
        controller.board[3][3] = controller.board[0][1];
        expect(controller.board[3][3]).not.toBeNull();
        controller.displayWinnerModal();
        expect(controller.gameState.winner).toBe(controller.gameState.color);
        expect(document.querySelector('#winnerModal')).not.toBeNull();
        expect(document.querySelector('#resetGame')).not.toBeNull();
        document.getElementById('resetGame')?.click();
        expect(controller.board[0][0]).not.toBeNull();
        expect(controller.board[3][3]).toBeNull();
        expect(controller.activePieces.length).toBe(32);
        expect(controller.gameState.color).toBe('white');
        expect(controller.gameState.removedPieces.black.length).toBe(0);
        expect(controller.gameState.removedPieces.white.length).toBe(0);
        expect(controller.gameState.winner).toBeNull();
        expect(controller.selectedPiece).toBeNull();
    });

    it('should clear selection when another piece is selected', () => {
        const pawn1 = document.querySelector('#white-pawn-0') as HTMLElement;
        const pawn2 = document.querySelector('#white-pawn-1') as HTMLElement;
        const pawn1Square = document.querySelector('#A3');
        const pawn2Square = document.querySelector('#B3');
        controller.selectPiece(pawn1);
        expect(pawn1Square?.classList).toContain('bg-yellow-300!');
        controller.selectPiece(pawn2);
        expect(pawn1Square?.classList).not.toContain('bg-yellow-300!');
        expect(pawn2Square?.classList).toContain('bg-yellow-300!');
    })
});

describe('Movement Logic', () => {
    let controller: Controller;
    beforeEach(() => {
        document.body.innerHTML = '<main id="chess-board" class="grid grid-cols-8 aspect-square border-8"></main>'
        controller = new Controller();
        controller.gameState = {lastMove: null, color: 'white', removedPieces: {black: [], white: []}, promotions: {black: [], white: []}, enPassantTarget: null, winner: null};
    });

    it('should move black pawn from A7 to A6', () => {
        const pawn = document.querySelector('#black-pawn-0') as HTMLElement;
        controller.selectPiece(pawn);
        expect(controller.board[0][1]?.moves.length).toBe(2);
        controller.movePiece(pawn, {x: 0, y: 2});
        expect(controller.board[0][2]).not.toBeNull();
        expect(controller.board[0][1]).toBeNull();
        expect(controller.board[0][2]?.type).toBe('pawn');
        expect(controller.board[0][2]?.moves.length).toBe(1);
    });

    it('should allow a pawn on A4 to beat a pawn on B5', () => {
        const pawnW = document.querySelector('#white-pawn-0') as HTMLElement;
        const pawnB = document.querySelector('#black-pawn-1') as HTMLElement;
        controller.selectPiece(pawnW);
        expect(controller.board[0][6]?.moves.length).toBe(2);
        controller.movePiece(pawnW, {x: 0, y: 4});
        expect(controller.board[0][6]).toBeNull();
        expect(controller.board[0][4]).not.toBeNull();
        expect(controller.board[0][4]?.type).toBe('pawn');
        expect(controller.board[0][4]?.moves.length).toBe(1);
        controller.selectPiece(pawnB);
        expect(controller.board[1][1]?.moves.length).toBe(2);
        controller.movePiece(pawnB, {x: 1, y: 3});
        expect(controller.board[1][1]).toBeNull();
        expect(controller.board[1][3]).not.toBeNull();
        expect(controller.board[1][3]?.type).toBe('pawn');
        expect(controller.board[1][3]?.moves.length).toBe(2);
        expect(controller.board[0][4]?.attacks).toMatchObject([{x: 1, y: 3}]);
        controller.selectPiece(pawnW);
        expect(document.querySelector('#B5')?.classList).toContain('bg-red-300!');
    });

    it('should move black pawn from B7 to B6 and black bishop from C8 to A6', () => {
        const pawn = document.querySelector('#black-pawn-1') as HTMLElement;
        const bishop = document.querySelector('#black-bishop-2') as HTMLElement;
        controller.selectPiece(pawn);
        expect(controller.board[1][1]?.moves.length).toBe(2);
        controller.movePiece(pawn, {x: 1, y: 2});
        expect(controller.board[1][2]).not.toBeNull();
        expect(controller.board[1][1]).toBeNull();
        expect(controller.board[1][2]?.type).toBe('pawn');
        expect(controller.board[1][2]?.moves.length).toBe(1);
        controller.selectPiece(bishop);
        expect(controller.board[2][0]?.moves.length).toBe(2);
        controller.movePiece(bishop, {x: 0, y: 2});
        expect(controller.board[0][2]).not.toBeNull();
        expect(controller.board[2][0]).toBeNull();
        expect(controller.board[0][2]?.type).toBe('bishop');
        expect(controller.board[0][2]?.moves.length).toBe(6);
    });

    it('should move white pawn from D2 to D4 and white queen from D1 to D3', () => {
        const pawn = document.querySelector('#white-pawn-3') as HTMLElement;
        const queen = document.querySelector('#white-queen-3') as HTMLElement;
        controller.selectPiece(pawn);
        expect(controller.board[3][6]?.moves.length).toBe(2);
        controller.movePiece(pawn, {x: 3, y: 4});
        expect(controller.board[3][6]).toBeNull();
        expect(controller.board[3][4]?.type).toBe('pawn');
        expect(controller.board[3][4]?.moves.length).toBe(1);
        controller.selectPiece(queen);
        expect(controller.board[3][7]?.moves.length).toBe(2);
        controller.movePiece(queen, {x: 3, y: 5});
        expect(controller.board[3][5]).not.toBeNull();
        expect(controller.board[3][7]).toBeNull();
        expect(controller.board[3][5]?.type).toBe('queen');
        expect(controller.board[3][5]?.moves.length).toBe(16);
    });

    it('should move white knight from B1 to C3 and from C3 to E4', () => {
        const knight = document.querySelector('#white-knight-1') as HTMLElement;
        controller.selectPiece(knight);
        expect(controller.board[1][7]?.moves.length).toBe(2);
        expect(document.querySelector(`[data-xcoord="2"][data-ycoord="5"]`)?.classList).toContain('bg-yellow-300!');
        controller.movePiece(knight, {x: 2, y: 5});
        expect(controller.board[2][5]).not.toBeNull();
        expect(controller.board[1][7]).toBeNull();
        expect(controller.board[2][5]?.type).toBe('knight');
        expect(controller.board[2][5]?.moves.length).toBe(5);
        controller.selectPiece(knight);
        expect(controller.board[2][5]?.moves.length).toBe(5);
        expect(document.querySelector(`[data-xcoord="4"][data-ycoord="4"]`)?.classList).toContain('bg-yellow-300!');
        controller.movePiece(knight, {x: 4, y: 4});
        expect(controller.board[4][4]).not.toBeNull();
        expect(controller.board[4][4]?.type).toBe('knight');
        expect(controller.board[4][4]?.moves.length).toBe(6);
        expect(controller.board[2][5]).toBeNull();
    });

    it('should let a white rook on D4 beat a black pawn on D7', () => {
        const pawn = document.querySelector('#white-pawn-0') as HTMLElement;
        const rook = document.querySelector('#white-rook-0') as HTMLElement;
        controller.selectPiece(pawn);
        expect(controller.board[0][6]?.moves.length).toBe(2);
        controller.movePiece(pawn, {x: 0, y: 4});
        expect(controller.board[0][6]).toBeNull();
        expect(controller.board[0][4]).not.toBeNull();
        expect(controller.board[0][4]?.type).toBe('pawn');
        expect(controller.board[0][4]?.moves.length).toBe(1);
        expect(controller.board[0][7]?.moves.length).toBe(2);
        controller.selectPiece(pawn);
        expect(controller.board[0][4]?.moves.length).toBe(1);
        controller.movePiece(pawn, {x: 0, y: 3});
        expect(controller.board[0][4]).toBeNull();
        expect(controller.board[0][3]).not.toBeNull();
        expect(controller.board[0][3]?.type).toBe('pawn');
        expect(controller.board[0][3]?.moves.length).toBe(1);
        expect(controller.board[0][7]?.moves.length).toBe(3);
        controller.selectPiece(rook);
        expect(controller.board[0][7]?.moves.length).toBe(3);
        controller.movePiece(rook, {x: 0, y: 4});
        expect(controller.board[0][7]).toBeNull();
        expect(controller.board[0][4]).not.toBeNull();
        expect(controller.board[0][4]?.type).toBe('rook');
        expect(controller.board[0][4]?.moves.length).toBe(10);
        controller.selectPiece(rook);
        expect(controller.board[0][4]?.moves.length).toBe(10);
        controller.movePiece(rook, {x: 3, y: 4});
        expect(controller.board[0][4]).toBeNull();
        expect(controller.board[3][4]).not.toBeNull();
        expect(controller.board[3][4]?.type).toBe('rook');
        expect(controller.board[3][4]?.moves.length).toBe(11);
        controller.selectPiece(rook);
        expect(controller.board[3][4]?.moves.length).toBe(11);
        controller.movePiece(rook, {x: 3, y: 1});
        expect(controller.board[3][4]).toBeNull();
        expect(controller.board[3][1]).not.toBeNull();
        expect(controller.board[3][1]?.type).toBe('rook');
        expect(controller.board[3][1]?.moves.length).toBe(7);
    });

    it('should not allow pawn to move diagonally', () => {
        const pawn = document.querySelector('#white-pawn-0') as HTMLElement;
        controller.selectPiece(pawn);
        expect(controller.board[0][6]?.moves.length).toBe(2);
        controller.movePiece(pawn, {x: 1, y: 4});
        expect(controller.board[0][6]).not.toBeNull();
        expect(controller.board[0][6]?.moves.length).toBe(2);
        expect(controller.board[1][4]).toBeNull();
    });

    it('should not allow empty squares to move', () => {
        const empty = document.querySelector('div[data-xcoord="4"][data-ycoord="4"]') as HTMLElement;
        controller.selectPiece(empty);
        expect(controller.board[4][4]).toBeNull();
        controller.movePiece(empty, {x: 3, y: 3});
        expect(controller.board[4][4]).toBeNull();
        expect(controller.board[3][3]).toBeNull();
    });

    it('should check if king is under attack', () => {
        controller.board = Array.from({length: 8}, () => new Array(8).fill(null));
        controller.board[0][0] = {
            type: 'king', color: 'white', isMoved: false, isTaken: false, moves: [], attacks: []
        };
        controller.board[0][7] = {
            type: 'rook', color: 'black', isMoved: false, isTaken: false, moves: [], attacks: []
        };
        const rookMovesAttacks = controller.moveStrategies['rook'](controller.board, {x: 0, y: 7}, 'black');
        controller.board[0][7].attacks = rookMovesAttacks.attacks;
        controller.board[0][7].moves = rookMovesAttacks.moves;
        const kingMovesAttacks = controller.moveStrategies['king'](controller.board, {x: 0, y: 0}, 'white');
        controller.board[0][0].attacks = kingMovesAttacks.attacks;
        controller.board[0][0].moves = kingMovesAttacks.moves;
        controller.activePieces.push(...[{piece: controller.board[0][0], coord: {x: 0, y: 0}}, {piece: controller.board[0][7], coord: {x: 0, y: 7}}]);
        expect(controller.isSquareAttacked({x: 0, y: 0})).toBe(true);
    });

    it('should allow castle if king and rook have not been moved, squares between them are empty and not attacked', () => {
        const removeSquares = [{x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 5, y: 7}, {x: 6, y: 7}];
        removeSquares.forEach(square => {
            const index = controller.activePieces.indexOf(controller.activePieces.find(piece => piece.coord.x === square.x && piece.coord.y === square.y)!);
            controller.activePieces.splice(index, 1);
            controller.board[square.x][square.y] = null;
        });
        const king = document.querySelector('#white-king-4') as HTMLElement;
        controller.selectPiece(king);
        expect(controller.board[4][7]?.moves.length).toBe(4);
        expect(controller.board[4][7]?.moves).toMatchObject([{x:5, y: 7}, {x: 3, y: 7}, {x: 6, y: 7}, {x: 2, y: 7}]);
        controller.movePiece(king, {x: 2, y: 7});
        expect(controller.board[3][7]?.type).toBe('rook');
        expect(controller.board[2][7]?.type).toBe('king');
        expect(controller.board[0][7]).toBeNull();
        expect(controller.board[4][7]).toBeNull();
    });

    it('should not allow castle if king is attacked', () => {
        const removeSquares = [{x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 5, y: 7}, {x: 6, y: 7}];
        removeSquares.forEach(square => {
            const index = controller.activePieces.indexOf(controller.activePieces.find(piece => piece.coord.x === square.x && piece.coord.y === square.y)!);
            controller.activePieces.splice(index, 1);
            controller.board[square.x][square.y] = null;
        });
        controller.activePieces.find(piece => piece.coord.x === 3 && piece.coord.y === 6)!.piece!.color = 'black';
        controller.board[3][6]!.color = 'black';
        controller.board[3][6]!.attacks = controller.moveStrategies['pawn'](controller.board, {x: 3, y: 6}, 'black').attacks;
        const king = document.querySelector('#white-king-4') as HTMLElement;
        controller.selectPiece(king);
        expect(controller.board[4][7]?.moves.length).toBe(3);
    })

    it('should allow En Passant attacks', () => {
        const wPawn = document.querySelector('#white-pawn-0') as HTMLElement;
        controller.selectPiece(wPawn);
        controller.movePiece(wPawn, {x: 0, y: 4});
        const pDraw = document.querySelector('#black-pawn-7') as HTMLElement;
        controller.selectPiece(pDraw);
        controller.movePiece(pDraw, {x: 7, y: 3});
        controller.selectPiece(wPawn);
        controller.movePiece(wPawn, {x: 0, y: 3});
        const bPawn = document.querySelector('#black-pawn-1') as HTMLElement;
        controller.selectPiece(bPawn);
        controller.movePiece(bPawn, {x: 1, y: 3});
        controller.selectPiece(wPawn);
        controller.movePiece(wPawn, {x: 1, y: 2});
        expect(controller.board[1][2]?.type).toBe('pawn');
        expect(controller.board[1][3]).toBeNull();
        expect(controller.gameState.removedPieces.black.length).toBe(1);
    });

    it('should check for checked king', () => {
        const removeSquares = [{x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 5, y: 7}, {x: 6, y: 7}];
        removeSquares.forEach(square => {
            const index = controller.activePieces.indexOf(controller.activePieces.find(piece => piece.coord.x === square.x && piece.coord.y === square.y)!);
            controller.activePieces.splice(index, 1);
            controller.board[square.x][square.y] = null;
        });
        controller.activePieces.find(piece => piece.coord.x === 3 && piece.coord.y === 6)!.piece!.color = 'black';
        controller.board[3][6]!.color = 'black';
        controller.board[3][6]!.attacks = controller.moveStrategies['pawn'](controller.board, {x: 3, y: 6}, 'black').attacks;
        controller.activePieces.find(piece => piece.coord.x === 5 && piece.coord.y === 6)!.piece!.color = 'black';
        controller.board[5][6]!.color = 'black';
        controller.board[5][6]!.attacks = controller.moveStrategies['pawn'](controller.board, {x: 3, y: 6}, 'black').attacks;
        controller.activePieces.find(piece => piece.coord.x === 0 && piece.coord.y === 7)!.piece!.color = 'black';
        controller.board[0][7]!.color = 'black';
        controller.board[0][7]!.attacks = controller.moveStrategies['rook'](controller.board, {x: 0, y: 6}, 'black').attacks;
        controller.activePieces.find(piece => piece.coord.x === 7 && piece.coord.y === 7)!.piece!.color = 'black';
        controller.board[7][7]!.color = 'black';
        controller.board[7][7]!.attacks = controller.moveStrategies['rook'](controller.board, {x: 7, y: 7}, 'black').attacks;
        controller.activePieces.find(piece => piece.coord.x === 0 && piece.coord.y === 7)!.piece!.color = 'black';
        controller.board[0][7]!.color = 'black';
        controller.board[0][7]!.attacks = controller.moveStrategies['rook'](controller.board, {x: 0, y: 6}, 'black').attacks;
        controller.activePieces.find(piece => piece.coord.x === 7 && piece.coord.y === 7)!.piece!.color = 'black';
        controller.board[5][5] = controller.board[0][7];
        controller.board[5][5]!.attacks = controller.moveStrategies['rook'](controller.board, {x: 5, y: 5}, 'black').attacks;
        controller.board[3][5] = controller.board[0][7];
        controller.board[3][5]!.attacks = controller.moveStrategies['rook'](controller.board, {x: 3, y: 5}, 'black').attacks;
        controller.activePieces.push({piece: controller.board[5][5], coord: {x: 5, y: 5}}, {piece: controller.board[3][5], coord: {x: 3, y: 5}})
        const pawn = document.querySelector(`#white-pawn-0`) as HTMLElement
        controller.selectPiece(pawn);
        controller.movePiece(pawn, {x: 0, y: 5});
        expect(controller.gameState.winner).toBe('black');
    });

    it('should select a piece and move it via eventlisteners', () => {
        const pawn = document.querySelector('#white-pawn-0') as HTMLElement;
        const square = document.querySelector('div[data-xcoord="0"][data-ycoord="4"]') as HTMLElement;
        pawn.click();
        expect(square.classList).toContain('bg-yellow-300!');
        square.click();
        expect(pawn.dataset.xcoord).toBe('0');
        expect(pawn.dataset.ycoord).toBe('4');
    });

    it('should let black rook throw white pawn if black pawn at A7 is gone and white rook to throw black rook', () => {
        const index = controller.activePieces.indexOf(controller.activePieces.find(piece => piece.coord.x === 0 && piece.coord.y === 1)!);
        controller.activePieces.splice(index, 1);
        controller.board[0][1] = null;
        expect(controller.board[0][1]).toBeNull();
        expect(controller.activePieces.length).toBe(31);
        const rook = document.querySelector('#black-rook-0') as HTMLElement;
        const pawn = document.querySelector('#white-pawn-0') as HTMLElement;
        const square = document.querySelector('div[data-xcoord="0"][data-ycoord="4"]') as HTMLElement;
        const wRook = document.querySelector('#white-rook-0') as HTMLElement;
        pawn.click();
        expect(square.classList).toContain('bg-yellow-300!');
        square.click();
        rook.click();
        expect(square.classList).toContain('bg-red-300!');
        pawn.click();
        expect(rook.dataset.xcoord).toBe('0');
        expect(rook.dataset.ycoord).toBe('4');
        expect(square.firstChild).toBe(rook);
        wRook.click();
        expect(square.classList).toContain('bg-red-300!');
        rook.click();
        expect(wRook.dataset.xcoord).toBe('0');
        expect(wRook.dataset.ycoord).toBe('4');
        expect(square.firstChild).toBe(wRook);
    });

    it('should open promotion dialog when white pawn is on A8', () => {
        const index = controller.activePieces.indexOf(controller.activePieces.find(piece => piece.coord.x === 0 && piece.coord.y === 0)!);
        controller.activePieces.splice(index, 1);
        controller.board[0][0] = null;
        controller.board[0][1]!.color = 'white';
        controller.board[0][1]!.moves = controller.moveStrategies['pawn'](controller.board, {x: 0, y: 1}, 'white').moves;
        const pawn = document.querySelector('#black-pawn-0') as HTMLElement;
        controller.selectPiece(pawn);
        controller.movePiece(pawn, {x: 0, y: 0});
        const dialog = document.querySelector('#promotionModal');
        expect(dialog).not.toBeNull();
        const rook = document.querySelector('#select-rook') as HTMLElement;
        rook.click();
        expect(controller.board[0][0]!.type).toBe('rook');
        const confirm = document.querySelector('#confirmPromotion') as HTMLButtonElement;
        confirm.click();
        expect(document.querySelector('#promotionModal')).toBeNull();
    });
});