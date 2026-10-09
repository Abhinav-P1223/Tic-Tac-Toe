"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Mark = "X" | "O" | null;
type Result = "win" | "loss" | "draw" | null;

const WIN_STATES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(board: Mark[], player: Exclude<Mark, null>) {
  return WIN_STATES.find((line) => line.every((position) => board[position] === player)) ?? null;
}

function isFull(board: Mark[]) {
  return board.every((square) => square !== null);
}

function minimax(board: Mark[], depth: number, alpha: number, beta: number, maximizingPlayer: boolean): number {
  if (checkWinner(board, "O")) return 1;
  if (checkWinner(board, "X")) return -1;
  if (isFull(board)) return 0;

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = "O";
        const evaluation = minimax(board, depth + 1, alpha, beta, false);
        board[i] = null;
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
    }
    return maxEval;
  }

  let minEval = Infinity;
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = "X";
      const evaluation = minimax(board, depth + 1, alpha, beta, true);
      board[i] = null;
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
  }
  return minEval;
}

function bestMove(board: Mark[]) {
  let bestValue = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = "O";
      const moveValue = minimax(board, 0, -Infinity, Infinity, false);
      board[i] = null;
      if (moveValue > bestValue) {
        bestValue = moveValue;
        move = i;
      }
    }
  }
  return move;
}

function MarkGraphic({ mark }: { mark: Exclude<Mark, null> }) {
  return mark === "X" ? (
    <svg className="mark-svg x-svg" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M14 14 50 50M50 14 14 50" />
    </svg>
  ) : (
    <svg className="mark-svg o-svg" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="21" />
    </svg>
  );
}

export default function Home() {
  const [board, setBoard] = useState<Mark[]>(Array(9).fill(null));
  const [thinking, setThinking] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 });
  const [round, setRound] = useState(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const finishRound = useCallback((nextBoard: Mark[]) => {
    const humanWin = checkWinner(nextBoard, "X");
    if (humanWin) {
      setWinningLine(humanWin);
      setResult("win");
      setScore((current) => ({ ...current, wins: current.wins + 1 }));
      return true;
    }
    const aiWin = checkWinner(nextBoard, "O");
    if (aiWin) {
      setWinningLine(aiWin);
      setResult("loss");
      setScore((current) => ({ ...current, losses: current.losses + 1 }));
      return true;
    }
    if (isFull(nextBoard)) {
      setResult("draw");
      setScore((current) => ({ ...current, draws: current.draws + 1 }));
      return true;
    }
    return false;
  }, []);

  const play = (position: number) => {
    if (board[position] || thinking || result) return;

    const nextBoard = [...board];
    nextBoard[position] = "X";
    setBoard(nextBoard);
    if (finishRound(nextBoard)) return;

    setThinking(true);
    timer.current = setTimeout(() => {
      const aiBoard = [...nextBoard];
      const positionForAI = bestMove(aiBoard);
      if (positionForAI !== -1) aiBoard[positionForAI] = "O";
      setBoard(aiBoard);
      setThinking(false);
      finishRound(aiBoard);
    }, 520);
  };

  const restart = () => {
    if (timer.current) clearTimeout(timer.current);
    setBoard(Array(9).fill(null));
    setThinking(false);
    setResult(null);
    setWinningLine(null);
    setRound((current) => current + 1);
  };

  const status = result === "win"
    ? "YOU TOOK THE GRID"
    : result === "loss"
      ? "THE MACHINE WINS"
      : result === "draw"
        ? "A PERFECT STALEMATE"
        : thinking
          ? "CALCULATING YOUR FATE..."
          : "YOUR MOVE, HUMAN";

  return (
    <main className="page-shell">
      <div className="scanlines" />

      <header className="topbar">
        <a className="brand" href="#top" aria-label="Tic-Tac-Toe home">
          <span className="brand-icon"><span /><span /><span /><span /></span>
          <span><span className="brand-accent">X</span> <span className="brand-slash">/</span> O</span>
        </a>
        <div className="top-tag"><span className="live-dot" /> NEURAL ENGINE ONLINE</div>
      </header>

      <section className="game-layout" id="top">
        <div className="intro-column">
          <div className="eyebrow"><span>01</span><span className="eyebrow-line" /> THE CLASSIC, REWIRED</div>
          <h1>THINK<br />YOU CAN<br /><span>BEAT THE</span><br /><span className="machine-word">MACHINE?</span></h1>
          <p className="intro-copy">Nine squares. One merciless algorithm.<br />Make your move and see what happens.</p>
          <div className="difficulty-chip"><span className="chip-symbol">✳</span><span><b>IMPOSSIBLE</b><small>Minimax · Alpha-beta pruning</small></span></div>

          <div className="scoreboard">
            <div className="score-heading"><span>SESSION DATA</span><span>ROUND {String(round).padStart(2, "0")}</span></div>
            <div className="score-row">
              <div className="score-item"><span className="score-label"><i className="score-dot human-dot" /> YOU <b>X</b></span><strong>{String(score.wins).padStart(2, "0")}</strong></div>
              <div className="score-divider" />
              <div className="score-item"><span className="score-label"><i className="score-dot ai-dot" /> AI <b>O</b></span><strong>{String(score.losses).padStart(2, "0")}</strong></div>
              <div className="score-divider" />
              <div className="score-item draw-score"><span className="score-label">DRAW</span><strong>{String(score.draws).padStart(2, "0")}</strong></div>
            </div>
          </div>
        </div>

        <div className="board-column">
          <div className="board-topline"><span>PLAY ARENA <span className="topline-cross">✳</span></span><span>NO. {String(round).padStart(3, "0")}</span></div>
          <div className={`status-bar ${result ? `status-${result}` : ""}`} aria-live="polite">
            <span className={`status-light ${thinking ? "is-thinking" : ""}`} />
            <span>{status}</span>
            {!result && <span className="status-turn">{thinking ? "AI" : "X"}</span>}
          </div>

          <div className="board-frame">
            <div className="corner corner-tl" /><div className="corner corner-tr" />
            <div className="corner corner-bl" /><div className="corner corner-br" />
            <div className="board" role="grid" aria-label="Tic-Tac-Toe board">
              {board.map((mark, index) => {
                const isWinning = winningLine?.includes(index) ?? false;
                return (
                  <button
                    className={`square ${mark ? `square-${mark.toLowerCase()}` : ""} ${isWinning ? "square-winning" : ""}`}
                    key={index}
                    onClick={() => play(index)}
                    disabled={Boolean(mark) || thinking || Boolean(result)}
                    role="gridcell"
                    aria-label={`Square ${index + 1}${mark ? `, ${mark}` : ", empty"}`}
                  >
                    {mark ? <MarkGraphic mark={mark} /> : <span className="square-number">0{index + 1}</span>}
                    {isWinning && <span className="win-spark" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="board-footer">
            <div className="legend"><span><i className="legend-x">×</i> YOU</span><span><i className="legend-o" /> MACHINE</span></div>
            <button className="restart-button" onClick={restart}>
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 6V2m0 4h-4M4.3 7A6.5 6.5 0 1 1 3.5 11" /></svg>
              <span>NEW ROUND</span>
              <span className="button-arrow">↗</span>
            </button>
          </div>
          <div className="board-caption"><span>THE GRID NEVER FORGETS</span><span>EST. ∞</span></div>
        </div>
      </section>

      <footer className="footer"><span>BUILT FOR THE BOLD <i>✳</i></span><span>ONE GRID. ZERO MERCY.</span></footer>
    </main>
  );
}
