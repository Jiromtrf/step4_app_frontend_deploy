"use client";

import Image from "next/image";
import HomeButton from "../../components/HomeButton"; // ホームボタンのコンポーネント

export default function MaintenancePage() {
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

      {/* ホームボタン */}
      <div style={styles.buttonContainer}>
        <HomeButton />
      </div>
    </div>
  );
}

const styles = {
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
    marginBottom: "20px", // 吹き出しとの間隔
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
};
