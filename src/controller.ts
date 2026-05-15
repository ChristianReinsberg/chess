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

const pieceImg: Record<string, string> = {
    'white-pawn': WhitePawn,
    'black-pawn': BlackPawn,
    'white-bishop': WhiteBishop,
    'black-bishop': BlackBishop,
    'white-king': WhiteKing,
    'black-king': BlackKing,
    'white-knight': WhiteKnight,
    'black-knight': BlackKnight,
    'white-rook': WhiteRook,
    'black-rook': BlackRook,
    'white-queen': WhiteQueen,
    'black-queen': BlackQueen
};

const typeList: Record<number, PieceType> = {
    0: 'rook',
    1: 'knight',
    2: 'bishop',
    3: 'queen',
    4: 'king',
    5: 'bishop',
    6: 'knight',
    7: 'rook',
    8: 'pawn',
};

export class Controller {
    board: Board = Array.from({length: 8}, () => new Array(8).fill(null));
    chessBoard = document.querySelector('#chess-board') as HTMLElement;
    activePieces: {piece: Square, coord: Coord}[] = [];
    x_letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    y_numbers = [8, 7, 6, 5, 4, 3, 2, 1];
    selectedPiece: HTMLElement | null = null;
    gameState: GameState = {lastMove: null, color: 'white', removedPieces: {black: [], white: []}, promotions: {black: [], white: []}, enPassantTarget: null, winner: null};
    moveStrategies: Record<PieceType, MoveCalculator> = {
        'pawn': (board, pos, color) => {
            const moves: Move[] = [];
            const attacks: Move[] = [];
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
                div.addEventListener('click', () => {
                    if (this.selectedPiece) {
                        this.movePiece(this.selectedPiece, {x: j, y: i});
                    }
                });
                div.className = (i + j) % 2 ? 'bg-black size-8 lg:size-19' : 'bg-white size-8 lg:size-19';
                this.chessBoard.append(div);
                const color = i === 0 || i === 1 ? 'black' : 'white'
                if (i === 0 || i === 1 || i === 6 || i === 7) {
                    this.initPiece(color, j, i, div);
                    this.board[j][i] = this.createPiece(typeList[i === 1 || i === 6 ? 8 : j], color);
                }
            }
        }
        this.refreshAllMoves();
    }

    createPiece(type: PieceType, color: Color) {
        return {type, color, isMoved: false, isTaken: false, moves: [], attacks: []}
    }

    initPiece(color: Color, x: number, y: number, div: HTMLDivElement) {
        const img = document.createElement('img');
        img.className = 'w-full aspect-square';
        img.dataset.xcoord = x.toString();
        img.dataset.ycoord = y.toString();
        img.dataset.color = color;
        img.src = pieceImg[`${color}-${typeList[y === 1 || y === 6 ? 8 : x]}`];
        img.id = `${color}-${typeList[y === 1 || y === 6 ? 8 : x]}-${x}`;
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.selectedPiece && this.selectedPiece.dataset.color !== color) {
                this.movePiece(this.selectedPiece, {x: parseInt(img.dataset.xcoord!), y: parseInt(img.dataset.ycoord!)});
            } else if (this.gameState.color === img.dataset.color) {
                this.selectPiece(img);
            }
        });
        div.append(img);
    }

    isEmpty(board: Board, posX: number, posY: number) {
        return board[posX][posY] === null;
    }

    canStrike(board: Board, posX: number, posY: number, color: Color) {
        return (board[posX][posY] !== null && board[posX][posY]?.color !== color) || (posX === this.gameState.enPassantTarget?.x && posY === this.gameState.enPassantTarget?.y);
    }

    refreshAllMoves() {
        this.activePieces = [];
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = this.board[x][y];
                if (piece) {
                    const {moves, attacks} = this.moveStrategies[piece.type](this.board, {x, y}, piece.color)
                    piece.moves = moves;
                    piece.attacks = attacks;
                    this.activePieces.push({piece, coord: {x, y}});
                }
            }
        }
    }

    selectPiece(piece: HTMLElement) {
        if (this.selectedPiece) {
            const x = parseInt(this.selectedPiece.dataset.xcoord!);
            const y = parseInt(this.selectedPiece.dataset.ycoord!);
            this.clearHighlights(this.board[x][y]!.moves);
        }
        this.selectedPiece = piece;
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

    executeMove(from: Coord, to: Coord, pieceData: Piece, direction: number) {
        this.updateFromTo(pieceData, from, to);
        this.updatePieceMoves(pieceData, to);
        pieceData.isMoved = true;
        if (pieceData.type === 'king' && Math.abs(to.x - from.x) === 2) {
            const rookFromX = to.x === 6 ? 7 : 0;
            const rookToX = to.x === 6 ? 5 : 3;
            this.castleRookExecuteMove({x: rookFromX, y: from.y}, {x: rookToX, y: to.y});
        }
        this.gameState.color = this.gameState.color === 'white' ? 'black' : 'white';
        this.gameState.lastMove = {from, to, pieceType: pieceData.type};
        
        this.throwPieceLogic(to, direction);
        if (pieceData.type === 'pawn' && Math.abs(to.y - from.y) === 2) {
            this.gameState.enPassantTarget = {x: to.x, y: to.y + direction};
        } else {
            this.gameState.enPassantTarget = null;
        }
        this.refreshAllMoves();
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
        const prevMoves = pieceData.moves;
        const direction = pieceData.color === 'white' ? 1 : -1;
        this.executeMove(from, target, pieceData, direction);
        this.clearHighlights(prevMoves);
        if (pieceData.type === 'king' && Math.abs(target.x - from.x) === 2) {
            const rookFromX = target.x === 6 ? 7 : 0;
            const rookToX = target.x === 6 ? 5 : 3;
            this.castleRookMove({x: rookFromX, y: from.y}, {x: rookToX, y: target.y});
        }
        piece.dataset.xcoord = target.x.toString();
        piece.dataset.ycoord = target.y.toString();
        const to = {x: target.x, y: this.gameState.enPassantTarget !== null ? target.y + direction : target.y};
        const square = this.board[to.x][to.y];
        if (square) {
            this.removeTargetElement(to)
        }
        this.updateElementPosition(piece, target);
        this.selectedPiece = null;
        if (((target.y === 7 && pieceData.color === 'black') || (target.y === 0 && pieceData.color === 'white')) && pieceData.type === 'pawn') {
            this.displayPromotionModal(piece as HTMLImageElement);
        }
        if (this.isChess()) {
            this.displayWinnerModal();
        }
    }

    private clearHighlights(moves: Move[]) {
        moves.forEach(move => {
            const el = document.querySelector(`div[data-xcoord="${move.x}"][data-ycoord="${move.y}"]`);
            el?.classList.remove('bg-red-300!', 'bg-yellow-300!');
        });
    }

    updateElementPosition(piece: HTMLElement, target: Coord) {
        const tile = document.querySelector(`div[data-xcoord="${target.x}"][data-ycoord="${target.y}"]`);
        tile?.append(piece);
    }

    removeTargetElement(target: Coord) {
        const square = document.querySelector(`div[data-xcoord="${target.x}"][data-ycoord="${target.y}"]`);
        if (square) {
            square.firstChild?.remove();
        }
    }

    isSquareAttacked(coord: Coord) {
        return this.activePieces
            .filter(piece => piece.piece!.color !== this.gameState.color)
            .some(piece => piece.piece!.attacks.some(attack => attack.x === coord.x && attack.y === coord.y));
    }

    canCastle(color: Color, side: 'king' | 'queen') {
        const y = color === 'black' ? 0 : 7;
        const king = this.board[4][y];
        const rookX = side === 'king' ? 7 : 0;
        const rook = this.board[rookX][y];

        if (!king || king.type !== 'king' || king.isMoved) {
            return false;
        }
        if (!rook || rook.type !== 'rook' || rook.isMoved || rook?.color !== color) {
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

    castleRookExecuteMove(from: Coord, to: Coord) {
        const rookFrom = this.board[from.x][from.y];
        this.updateFromTo(rookFrom!, from, to);
        this.activePieces[this.activePieces.indexOf(this.activePieces.find(active => active.coord.x === from.x && active.coord.y === from.y)!)] = {piece: rookFrom, coord: to};
    }

    castleRookMove(from: Coord, to: Coord) {
        const piece = document.querySelector(`img[data-xcoord="${from.x}"][data-ycoord="${from.y}"]`) as HTMLElement;
        this.updateElementPosition(piece, to);
    }

    isChess() {
        let attackedMoves = 0;
        const {moves} = this.activePieces.find(king => king.piece?.type === 'king' && king.piece.color === this.gameState.color)?.piece!;
        for (const move of moves) {
            if (this.isSquareAttacked(move)) {
                attackedMoves++;
            }
        }
        return moves.length === attackedMoves;
    }

    displayWinnerModal() {
        this.gameState.winner = this.gameState.color;
        const dialog = document.createElement('dialog');
        dialog.id = 'winnerModal';
        dialog.classList.add('p-4');
        const heading = document.createElement('h2');
        heading.classList.add('text-4xl', 'text-center');
        heading.textContent = 'Checkmate';
        dialog.append(heading);
        const paragraph = document.createElement('p');
        paragraph.classList.add('text-center');
        paragraph.textContent = `The winner is ${this.gameState.color}`;
        dialog.append(paragraph);
        const button = document.createElement('button');
        button.classList.add('inline-block', 'mx-auto', 'rounded-lg', 'shadow', 'hover:bg-gray-100');
        button.textContent = 'play again';
        button.id = 'resetGame';
        button.addEventListener('click', () => {
            this.resetGame();
        });
        dialog.append(button);
        this.chessBoard.append(dialog);
    }

    resetGame() {
        this.board = Array.from({length: 8}, () => new Array(8).fill(null));
        this.chessBoard.innerHTML = '';
        this.gameState = {
            lastMove: null,
            color: 'white',
            removedPieces: {white: [], black: []},
            promotions: {white: [], black: []},
            enPassantTarget: null,
            winner: null,
        };
        this.activePieces = [];
        this.selectedPiece = null;
        this.initBoard();
    }

    promotionLogic(piece: Piece, coord: Coord, pieceType: PieceType) {
                const {moves, attacks} = this.moveStrategies[piece.type](this.board, {x: coord.x, y: coord.y}, this.gameState.color);
                piece!.attacks = attacks;
                piece!.moves = moves;
                piece!.type = pieceType;
                this.board[coord.x][coord.y] = piece;
    }

    displayPromotionModal(piece: HTMLImageElement) {
        const dialog = document.createElement('dialog');
        dialog.classList.add('p-4', 'absolute', 'top-1/2', 'left-1/2', '-translate-x-1/2', '-translate-y-1/2', 'rounded-lg', 'shadow-lg');
        dialog.id = 'promotionModal';
        const heading = document.createElement('h2');
        heading.classList.add('text-4xl', 'mb-4');
        heading.textContent = 'Please choose the piecetype you want to promote to';
        const pieceList = document.createElement('div');
        pieceList.classList.add('flex', 'gap-4', 'mb-4', 'justify-between');
        const pieces = ['queen', 'rook', 'bishop', 'knight'];
        for (const pieceType of pieces) {
            const button = document.createElement('button');
            button.id = `select-${pieceType}`;
            button.classList.add('border', 'border-black', 'p-4');
            const img = document.createElement('img');
            img.src = pieceImg[`${piece.dataset.color}-${pieceType}`];
            img.alt = pieceType;
            button.classList.add('rounded-lg', 'shadow', 'hover:bg-gray-100', 'p-4');
            button.addEventListener('click', () => {
                piece.src = pieceImg[`${piece.dataset.color}-${pieceType}`];
                piece.id = `${this.gameState.color}-${pieceType}${piece.id.substring(piece.id.lastIndexOf('-'))}`;
                const coord = {x: parseInt(piece.dataset.xcoord!), y: parseInt(piece.dataset.ycoord!)};
                this.promotionLogic(this.board[coord.x][coord.y]!, coord, pieceType as PieceType);
            });
            button.append(img);
            pieceList.append(button);
        }
        const button = document.createElement('button');
        button.id = 'confirmPromotion';
        button.classList.add('block', 'mx-auto', 'rounded-lg', 'shadow-lg', 'hover:bg-gray-100', 'p-2');
        button.textContent = 'Confirm Selection'
        button.addEventListener('click', () => {
            dialog.remove();
        });
        dialog.append(...[heading, pieceList, button]);
        this.chessBoard.append(dialog);
        dialog.showModal();
    }

    throwPieceLogic(target: Move, direction: number) {
        const targetPiece = this.board[target.x][target.y];
        let enPassantTarget: Square = null;
        if (this.gameState.enPassantTarget !== null) {
            if (target.x === this.gameState.enPassantTarget?.x && target.y === this.gameState.enPassantTarget?.y) {
                enPassantTarget = this.board[target.x][target.y + direction];
            }
        }
        if ((targetPiece && targetPiece.color === this.gameState.color) || (enPassantTarget && enPassantTarget.color === this.gameState.color)) {
            enPassantTarget !== null ? this.gameState.removedPieces[this.gameState.color].push(enPassantTarget as Piece) : this.gameState.removedPieces[this.gameState.color].push(targetPiece as Piece);
            const to = {x: target.x, y: this.gameState.enPassantTarget !== null ? target.y + direction : target.y};
            if (enPassantTarget) {
                this.board[to.x][to.y] = null;
            }
            this.activePieces.splice(this.activePieces.indexOf(this.activePieces.find(active => active.coord.x === target.x && active.coord.y === to.y)!), 1);
        }
    }

    updatePieceMoves(pieceData: Piece, target: Move) {
        const {moves, attacks} = this.moveStrategies[pieceData.type](this.board, target, pieceData.color);
        pieceData.attacks = attacks;
        pieceData.moves = moves;
    }

    updateFromTo(pieceData: Piece, from: Coord, to: Coord) {
        this.board[to.x][to.y] = pieceData;
        this.board[from.x][from.y] = null;
        pieceData!.isMoved = true;
    }
}