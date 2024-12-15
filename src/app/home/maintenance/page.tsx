// maintenance/page.tsx
"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // 正しいインポート先に変更

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: "relative",
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    overflow: "hidden",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#f3f4f6",
    zIndex: 1,
  },
  imageContainer: {
    position: "relative",
    zIndex: 2,
    marginBottom: "20px",
    display: "flex",
    justifyContent: "center",
  },
  speechBubble: {
    zIndex: 3,
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "10px 15px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    marginBottom: "20px",
  },
  text: {
    margin: 0,
    color: "#333",
    fontSize: "1.2rem",
    fontWeight: "bold",
    fontFamily: "sans-serif",
  },
  buttonContainer: {
    zIndex: 3,
    marginTop: "10px",
  },
  backButton: { // ボタンのスタイル
    padding: "10px 20px",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "background-color 0.3s ease",
  },
};

export default function MaintenancePage() {
  const router = useRouter(); // useRouterフックを正しいパッケージからインポート

  const handleBack = () => {
    router.back(); // 直前のページに戻る
  };

  return (
    <div style={styles.container}>
      {/* 背景 */}
      <div style={styles.background} />

      {/* 女の子の画像 */}
      <div style={styles.imageContainer}>
        <Image
          src="/maintenance-girl.webp" // publicディレクトリの画像
          alt="Maintenance Girl"
          width={400} // 画面サイズに合わせて調整
          height={400}
          objectFit="contain"
          priority
        />
      </div>

      {/* 吹き出し */}
      <div style={styles.speechBubble}>
        <p style={styles.text}>ごめんなさい！メンテナンス中です</p>
      </div>

      {/* 戻るボタン */}
      <div style={styles.buttonContainer}>
        <button
          style={styles.backButton}
          onClick={handleBack}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4338ca";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4f46e5";
          }}
        >
          前のページに戻る
        </button>
      </div>
    </div>
  );
}
