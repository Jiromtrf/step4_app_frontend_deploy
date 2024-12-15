// src/app/home/breather/page.tsx
"use client";

import React, { useState, useEffect } from "react";

type Cell = "empty" | "black" | "white";
type Board = Cell[][];

const initialBoard: Board = Array(8)
  .fill(null)
  .map(() =>
    Array(8)
      .fill(null)
      .map(() => "empty")
  );

// 初期配置をセット
initialBoard[3][3] = "white";
initialBoard[3][4] = "black";
initialBoard[4][3] = "black";
initialBoard[4][4] = "white";

export default function Page() {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  // 方向ベクトル（8方向）
  const directions = [
    [-1, 0], // 上
    [1, 0], // 下
    [0, -1], // 左
    [0, 1], // 右
    [-1, -1], // 左上
    [-1, 1], // 右上
    [1, -1], // 左下
    [1, 1], // 右下
  ];

  // 駒をひっくり返す関数
  const flipPieces = (
    row: number,
    col: number,
    newBoard: Board,
    player: "black" | "white"
  ): boolean => {
    let flipped = false;

    directions.forEach(([dx, dy]) => {
      const toFlip: [number, number][] = [];
      let x = row + dx;
      let y = col + dy;

      while (
        x >= 0 &&
        x < 8 &&
        y >= 0 &&
        y < 8 &&
        newBoard[x][y] !== "empty" &&
        newBoard[x][y] !== player
      ) {
        toFlip.push([x, y]);
        x += dx;
        y += dy;
      }

      if (
        x >= 0 &&
        x < 8 &&
        y >= 0 &&
        y < 8 &&
        newBoard[x][y] === player
      ) {
        flipped = true;
        toFlip.forEach(([fx, fy]) => {
          newBoard[fx][fy] = player;
        });
      }
    });

    return flipped;
  };

  // プレイヤーが置けるか確認
  const canPlacePiece = (
    row: number,
    col: number,
    player: "black" | "white"
  ): boolean => {
    if (board[row][col] !== "empty") return false;

    const newBoard = board.map((row) => row.slice());
    return flipPieces(row, col, newBoard, player);
  };

  // 白（AI）のターン
  const whiteAI = () => {
    if (gameOver) return;

    const newBoard = board.map((row) => row.slice());

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (canPlacePiece(row, col, "white")) {
          flipPieces(row, col, newBoard, "white");
          newBoard[row][col] = "white";
          setBoard(newBoard);
          return;
        }
      }
    }
  };

  // クリック時の処理（黒プレイヤー）
  const handleCellClick = (row: number, col: number) => {
    if (board[row][col] !== "empty" || gameOver) return;

    const newBoard = board.map((row) => row.slice());

    if (flipPieces(row, col, newBoard, "black")) {
      newBoard[row][col] = "black";
      setBoard(newBoard);
    }
  };

  // 勝敗判定
  const checkWinner = () => {
    const blackCount = board.flat().filter((cell) => cell === "black").length;
    const whiteCount = board.flat().filter((cell) => cell === "white").length;

    if (blackCount + whiteCount === 64) {
      setGameOver(true);
      setWinner(blackCount > whiteCount ? "Black Wins!" : "White Wins!");
    }
  };

  // 白（AI）のターンを0.7秒ごとに実行
  useEffect(() => {
    const interval = setInterval(() => {
      whiteAI();
    }, 700);

    return () => clearInterval(interval);
  }, [board]);

  // 勝敗判定のトリガー
  useEffect(() => {
    checkWinner();
  }, [board]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1>Fast Othello</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(8, 50px)`,
          gap: "5px",
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              style={{
                width: "50px",
                height: "50px",
                backgroundColor: "#228B22",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #000",
                cursor: "pointer",
              }}
            >
              {cell === "black" && (
                <div
                  style={{
                    width: "80%",
                    height: "80%",
                    borderRadius: "50%",
                    backgroundColor: "black",
                  }}
                />
              )}
              {cell === "white" && (
                <div
                  style={{
                    width: "80%",
                    height: "80%",
                    borderRadius: "50%",
                    backgroundColor: "white",
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>

      {gameOver && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2em",
          }}
        >
          <p>{winner}</p>
          <button
            onClick={() => {
              setBoard(initialBoard);
              setGameOver(false);
              setWinner(null);
            }}
            style={{
              padding: "10px 20px",
              fontSize: "1em",
              backgroundColor: "white",
              color: "black",
              border: "none",
              cursor: "pointer",
              borderRadius: "5px",
              marginTop: "20px",
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  ); // ← ここまでが return 文

} // ← ここに閉じ括弧を追加

