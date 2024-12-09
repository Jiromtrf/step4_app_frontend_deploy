// frontend/src/app/layout.tsx

"use client";

import "./globals.css";
import { GeistProvider } from "@geist-ui/core";
import SessionProviderWrapper from "./SessionProviderWrapper";

export const dynamic = "force-dynamic"; // 追加

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <SessionProviderWrapper>
          <GeistProvider>
            {children}
          </GeistProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
