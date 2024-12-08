"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/auth/signin");
  };

  const handleSignUp = () => {
    router.push("/auth/signin"); // サインアップページが未実装の場合は仮でサインインページに遷移
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f5deb3", // 黄土色系の背景色
        color: "#333",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "rgba(255, 255, 255, 0.9)",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "20px", fontSize: "1.5em" }}>ようこそ！</h1>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <button
            onClick={handleSignIn}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#ffcc00",
              color: "#000",
              fontWeight: "bold",
              fontSize: "1em",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#e6b800")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#ffcc00")
            }
          >
            サインイン
          </button>
          <button
            onClick={handleSignUp}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#007BFF",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "1em",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#0056b3")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#007BFF")
            }
          >
            サインアップ
          </button>
        </div>
      </div>
    </div>
  );
}
