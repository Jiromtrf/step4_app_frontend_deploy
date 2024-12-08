// frontend/src/lib/authOptions.ts

import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "User ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Credentials are missing");
        }

        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
          const response = await axios.post(`${baseUrl}/api/auth/login`, {
            user_id: credentials.username,
            password: credentials.password,
          });

          if (response.status === 200 && response.data) {
            // バックエンドから `access_token` を含むレスポンスを受け取る
            return {
              id: response.data.user_id,
              name: response.data.name, // バックエンドからの name を設定
              accessToken: response.data.access_token, // access_token を accessToken として設定
            };
          } else {
            throw new Error("Authentication failed");
          }
        } catch (error: unknown) {
          console.error("Authorization error:", error);

          if (axios.isAxiosError(error)) {
            // AxiosError の場合、詳細なエラーメッセージを取得
            throw new Error(error.response?.data?.detail || "Authentication failed");
          } else {
            // その他のエラー
            throw new Error("Authentication failed");
          }
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt", // セッションの方式はJWT
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken; // JWTトークンに accessToken を追加
        token.id = user.id; // ユーザーIDを追加
        token.name = user.name; // ユーザー名を追加
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string; // セッションに accessToken を追加
      if (token.id) {
        session.user = {
          ...session.user,
          id: token.id,
          name: token.name,
        };
      }
      return session;
    },
  },
};
