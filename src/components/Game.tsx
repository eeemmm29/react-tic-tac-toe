import { useState } from "react";

interface SquareProps {
  value: string | null;
  onSquareClick: () => void;
  isHighlighted: boolean;
}

interface BoardProps {
  xIsNext: boolean;
  squares: Array<string | null>;
  onPlay: (arr: Array<string | null>, position: number) => void;
  winningSquares: number[] | null;
}

interface HistoryEntry {
  squares: (string | null)[];
  position: number | null;
}

const Square = ({ value, onSquareClick, isHighlighted }: SquareProps) => {
  return (
    <button
      className={`square ${isHighlighted ? "highlight" : ""}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
};

const calculateWinner = (squares: Array<string | null>) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return null;
};

const Board = ({ xIsNext, squares, onPlay, winningSquares }: BoardProps) => {
  const handleClick = (i: number) => {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }

    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }

    onPlay(nextSquares, i);
  };

  const winnerInfo = calculateWinner(squares);
  const winner = winnerInfo ? winnerInfo.winner : null;
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else if (squares.every(Boolean)) {
    status = "It's a draw!";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  return (
    <>
      <div className="status">{status}</div>
      {[0, 1, 2].map((row) => (
        <div className="board-row" key={row}>
          {[0, 1, 2].map((col) => {
            const index = row * 3 + col;
            const isHighlighted = winningSquares?.includes(index) || false;
            return (
              <Square
                key={index}
                value={squares[index]}
                onSquareClick={() => handleClick(index)}
                isHighlighted={isHighlighted}
              />
            );
          })}
        </div>
      ))}
    </>
  );
};

const Game = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { squares: Array(9).fill(null), position: null },
  ]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  function handlePlay(nextSquares: Array<string | null>, position: number) {
    const nextHistory = [
      ...history.slice(0, currentMove + 1),
      { squares: nextSquares, position },
    ];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
  }

  const winnerInfo = calculateWinner(currentSquares);
  const winningSquares = winnerInfo ? winnerInfo.line : null;

  const moves = history.map((step, move) => {
    const { position } = step;
    const row = Math.floor((position ?? 0) / 3) + 1;
    const col = ((position ?? 0) % 3) + 1;
    const player = move % 2 === 0 ? "O" : "X"; // Since move is made before incrementing, reverse the logic
    let description;
    if (move > 0) {
      description = `Go to move #${move} (${player} at ${row}, ${col})`;
      if (move === currentMove) {
        description = `You are at move #${move} (${player} at ${row}, ${col})`;
      }
    } else {
      description =
        currentMove === 0 ? "You are at game start" : "Go to game start";
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  if (!isAscending) {
    moves.reverse();
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
          winningSquares={winningSquares}
        />
      </div>
      <div className="game-info">
        <button onClick={() => setIsAscending(!isAscending)}>
          {isAscending ? "Sort Descending" : "Sort Ascending"}
        </button>
        <ol>{moves}</ol>
      </div>
    </div>
  );
};

export default Game;
