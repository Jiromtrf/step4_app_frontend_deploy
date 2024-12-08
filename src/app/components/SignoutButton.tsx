"use client";

import { signOut } from "next-auth/react";

export default function SignoutButton() {
    const handleSignout = () => {
        alert("You have been signout.");
        signOut({ callbackUrl: "/auth/signin" });
      };      

  return (
    <button onClick={handleSignout} style={{ margin: "10px", padding: "10px", backgroundColor: "#f44336", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
      サインアウト
    </button>
  );
}
