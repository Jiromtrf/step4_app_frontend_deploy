// frontend/src/types/next-auth.d.ts

import { DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      /** The user's name. */
      name?: string | null;
      /** The user's email address. */
      email?: string | null;
      /** The user's image. */
      image?: string | null;
      /** The user's ID (added from JWT token). */
      id?: string | null;
      // 他に必要なユーザープロパティがあればここに追加
    };
  }

  interface User extends DefaultUser {
    // 必要に応じてUserインターフェースも拡張
    accessToken?: string;
  }
}
