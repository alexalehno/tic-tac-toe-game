"use strict";

class TicTacToe {
  constructor() {
    this.winner = null;
    this.step = true;
    this.noTurns = false;
    this.winNums = [];
    this.newGame = false;

    this.history = [];
    this.historyLength = 0;

    this.field = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];

    this.winComb = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
  }

  view = null;


  start(view) {
    this.view = view;
  }

  updateView() {
    if (this.view) {
      this.view.update();
    }
  }

  moveHistory(i) {
    if (this.winner || this.isDraw()) {
      return;
    }

    this.historyLength = i + 1;

    for (let i = 0; i < this.field.length; i++) {
      for (let j = 0; j < this.field[i].length; j++) {
        this.field[i][j] = null;
      }
    }

    for (let i = 0; i < this.historyLength; i++) {
      let el = this.history[i];

      this.field[el.row][el.col] = el.step ? "x" : "o";
      this.step = !el.step;
    }

    this.updateView();
  }

  reset() {
    this.winner = null;
    this.step = true;
    this.noTurns = false;
    this.newGame = true;
    this.history = [];


    for (let i = 0; i < this.field.length; i++) {
      for (let j = 0; j < this.field[i].length; j++) {
        this.field[i][j] = null;
      }
    }

    this.updateView();

    this.newGame = false;
  }

  nextTurn(rowIndex, columnIndex) {
    if (this.winner || this.isDraw()) {
      return;
    }

    if (this.field[rowIndex][columnIndex] === null) {
      this.field[rowIndex][columnIndex] = this.step ? "x" : "o";

      //.......................
      let hist = {
        step: this.step,
        row: rowIndex,
        col: columnIndex,
      }

      this.history = this.history.slice(0, this.historyLength);
      this.history.push(hist);
      this.historyLength = this.history.length;
      this.step = !this.step;
    }

    //................................
    const field = this.field.flat();

    for (let i = 0; i < this.winComb.length; i++) {
      const [a, b, c] = this.winComb[i];

      if (field[a] && field[a] === field[b] && field[a] === field[c]) {
        this.winner = field[a];
        this.winNums = [a, b, c];
      }
    }

    this.noTurns = this.field.every((el) => !el.includes(null));
    this.updateView();
  }

  getCurrentPlayerSymbol() {
    return this.step ? 'x' : 'o';
  }

  getWinner() {
    return this.winner;
  }

  getFieldValue(rowIndex, colIndex) {
    return this.field[rowIndex][colIndex];
  }

  isFinished() {
    return this.winner || this.noTurns ? true : false;
  }

  isDraw() {
    return !this.winner && this.noTurns ? true : false;
  }

  noMoreTurns() {
    return this.noTurns;
  }
}


class View {
  model = null;
  table = null;
  cells = null;


  start(model, table) {
    this.model = model;
    this.table = table;
    this.cells = table.querySelectorAll('td');
    this.historyEl = document.querySelector('.history-list');
  }

  update() {
    //............history........................
    let historyStr = '';

    this.model.history.forEach(el => {
      historyStr += `<li class="history-item">${el.step ? "x" : "o"}: (${el.row}, ${el.col})</li>`;
    })

    this.historyEl.innerHTML = historyStr;

    if (this.historyEl.childNodes.length) {
      this.historyEl.childNodes[this.model.historyLength - 1].classList.add('history-move');
    }

    //...................................................................
    this.model.field.flat().forEach((el, i) => {
      this.cells[i].textContent = el;
    })

    //............
    if (this.model.newGame) {
      for (let i = 0; i < this.model.winNums.length; i++) {
        this.cells[this.model.winNums[i]].classList.remove('win');
      }

      const resultEl = document.querySelector('.result');

      if (resultEl) {
        resultEl.remove();
      }
    }

    //............
    if (this.model.winner) {
      paintCells(this.cells, this.model.winNums, this.sleep)
        .then(() => this.sleep(1000))
        .then(() => animation(this.table, this.cells, 6000, 'Congratulation!!!', 'congrat'))
        .then(() => this.sleep(500))
        .then(() => createText(`Winner - ${this.model.getWinner()}`, 'result'))
    }

    //............
    if (this.model.isDraw()) {
      this.sleep(1000)
        .then(() => animation(this.table, this.cells, 6000, 'Draw', 'draw'))
        .then(() => this.sleep(500))
        .then(() => createText('Draw', 'result'))
    }

    // .........................................................
    async function paintCells(cells, winN, func) {
      for (let i = 0; i < winN.length; i++) {
        await func(500);
        cells[winN[i]].classList.add('win');
      }
    }

    function createText(t, cl) {
      const text = document.createElement('p');
      text.textContent = t;
      text.classList.add(cl);

      document.querySelector('.game').append(text);
    }

    function animation(table, td, sec, t, cl) {
      function tableAnim() {
        table.classList.add('table-animation');
        td.forEach(el => el.classList.add('td-animation'));
      }

      function removeAnim() {
        table.classList.remove('table-animation');
        td.forEach(el => el.classList.remove('td-animation'));

        document.querySelector(`.${cl}`).remove();
      }

      return new Promise(resolve => {
        if (document.documentElement.clientWidth >= 560) {
          tableAnim();
        }

        createText(t, cl);

        setTimeout(() => {
          removeAnim();
          resolve();
        }, sec);
      })
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}


class Controller {
  model = null;
  table = null;

  start(model, table) {
    this.model = model;
    this.table = table;

    this.table.addEventListener('click', (e) => {
      let td = e.target.closest('td');
      if (!td) return;

      let x = td.parentNode.rowIndex;
      let y = td.cellIndex;

      this.model.nextTurn(x, y);
    });

    document.querySelector('.history-list').addEventListener('click', (e) => {
      let li = e.target.closest('li');
      if (!li) return;

      let i = [...li.parentNode.children].indexOf(li);

      this.model.moveHistory(i);
    });

    document.querySelector('.new-game').addEventListener('click', () => this.model.reset());
  }
}


const table = document.querySelector('table');
const game = new TicTacToe();
const view = new View();
const controller = new Controller()

game.start(view);
view.start(game, table)
controller.start(game, table);
game.updateView();
