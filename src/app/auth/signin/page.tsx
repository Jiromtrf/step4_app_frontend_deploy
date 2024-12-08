"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  const [user_id, setUserId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = await signIn("credentials", {
      redirect: false,
      username: user_id,
      password,
    });

    if (result?.ok) {
      router.push("/home");
    } else {
      setError("ログインに失敗しました。ユーザーIDまたはパスワードを確認してください。");
    }
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
        {error && (
          <p style={{ color: "red", marginBottom: "15px" }}>{error}</p>
        )}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <input
            id="user_id"
            type="text"
            placeholder="IDを入力してください"
            value={user_id}
            onChange={(e) => setUserId(e.target.value)}
            required
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              backgroundColor: "#fff",
              color: "#333",
              fontSize: "1em",
            }}
          />
          <input
            id="password"
            type="password"
            placeholder="パスワードを入力してください"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              backgroundColor: "#fff",
              color: "#333",
              fontSize: "1em",
            }}
          />
          <button
            type="submit"
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
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
}
