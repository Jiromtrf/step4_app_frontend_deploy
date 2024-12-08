"use client";

import { useRouter } from "next/navigation";

const HomeButton: React.FC = () => {
  const router = useRouter();

  const handleHome = () => {
    router.push("/home"); // ホームに遷移
  };

  return (
    <button
      onClick={handleHome}
      style={{
        padding: "10px 20px",
        fontSize: "16px",
        color: "#fff",
        backgroundColor: "#007BFF",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#007BFF")}
    >
      ホームに戻る
    </button>
  );
};

export default HomeButton;
