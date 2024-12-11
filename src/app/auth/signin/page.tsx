"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  const [user_id, setUserId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
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

  const handleSignUp = () => {
    router.push("/auth/signup"); // サインアップページへの遷移
  };

  return (
    <div className="card">
      <h1 className="title">ちょベリTech！</h1>
      <p className="subtitle">さあ、はじめよう！</p>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSignIn} className="form">
        <input
          id="user_id"
          type="text"
          placeholder="IDを入力してください"
          value={user_id}
          onChange={(e) => setUserId(e.target.value)}
          required
          className="input"
        />
        <input
          id="password"
          type="password"
          placeholder="パスワードを入力してください"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input"
        />
        <button type="submit" className="button login-button">
          ログイン
        </button>
      </form>
      <button onClick={handleSignUp} className="button signup-button">
        新規登録
      </button>
    </div>
  );
}
