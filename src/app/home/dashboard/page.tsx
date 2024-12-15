// frontend/src/app/dashboard/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import HomeButton from "../../components/HomeButton";

const RadarChart = dynamic(() => import("../../components/RadarChart"), { ssr: false });

type Roles = "PdM" | "Design" | "Tech" | "Biz";

interface Skills {
  biz: number;
  design: number;
  tech: number;
}

const roles: Record<Roles, Skills> = {
  PdM: { biz: 90, design: 60, tech: 80 },
  Design: { biz: 20, design: 90, tech: 40 },
  Tech: { biz: 20, design: 20, tech: 90 },
  Biz: { biz: 50, design: 20, tech: 20 },
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [skills, setSkills] = useState<Skills>({ biz: 0, design: 0, tech: 0 });
  const [role, setRole] = useState<Roles>("PdM");
  const [userName, setUserName] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(""); // 日付選択用

  useEffect(() => {
    if (session && session.accessToken) {
      console.log("Fetching skills for current user");

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      console.log("API Base URL:", baseUrl); // デバッグ用
      const url = `${baseUrl}/api/user/skills${selectedDate ? `?date=${selectedDate}` : ""}`;

      fetch(url, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            return res.json().then((errorData) => {
              throw new Error(`Failed to fetch skills data: ${errorData.detail || res.statusText}`);
            });
          }
          return res.json();
        })
        .then((data: { biz: number; design: number; tech: number; name: string }) => {
          console.log('Received data:', data);
          setSkills({ biz: data.biz, design: data.design, tech: data.tech });
          setUserName(data.name);
        })
        .catch((err) => console.error('Error fetching skills:', err.message));
    }
  }, [session, selectedDate]); // selectedDate変更時にも再フェッチ

  useEffect(() => {
    const goals = roles[role];
    const isAboveGoals =
      skills.biz >= goals.biz &&
      skills.design >= goals.design &&
      skills.tech >= goals.tech;

    if (isAboveGoals) {
      setMessage(`今の能力なら十分、${role}の役割をやれるよ！`);
    } else {
      const areasToImprove = [];
      if (skills.biz < goals.biz) areasToImprove.push("Biz");
      if (skills.design < goals.design) areasToImprove.push("Design");
      if (skills.tech < goals.tech) areasToImprove.push("Tech");
      setMessage(`${areasToImprove.join("と")}をもう少し頑張ろう！`);
    }
  }, [role, skills]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return <p>You are not logged in. Please log in first.</p>;
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f5deb3", minHeight: "100vh" }}>
      {/* 日付選択 */}
      <div style={{ position: "absolute", top: "60px", left: "20px" }}>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: "0.5rem",
            borderRadius: "4px",
            background: "#f5f5f5",
            border: "1px solid #cccccc",
            color: "#333",
          }}
        />
      </div>
      {/* ホームボタンを左上に配置 */}
      <div style={{ position: "absolute", top: "20px", left: "20px" }}>
        <HomeButton />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#fff",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          padding: "2rem",
          gap: "2rem",
        }}
      >
        {/* 女の子とフキダシ */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* フキダシ */}
          <div
            style={{
              position: "relative",
              marginBottom: "1rem",
            }}
          >
            <p
              style={{
                backgroundColor: "#fff",
                borderRadius: "10px",
                padding: "1rem",
                fontSize: "1.2rem",
                color: "#333",
                textAlign: "center",
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
                maxWidth: "300px",
              }}
            >
              {message}
            </p>
            <div
              style={{
                position: "absolute",
                bottom: "-10px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "0",
                height: "0",
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: "10px solid #fff",
              }}
            ></div>
          </div>
          {/* 女の子の画像 */}
          <Image
            src="/gal1.webp"
            alt="Girl Image"
            width={300}
            height={300}
            style={{
              borderRadius: "50%",
              border: "4px solid white",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          />
        </div>

        {/* レーダーチャート */}
        <div>
          <h1 style={{ color: "#333", marginBottom: "1rem", textAlign: "center" }}>
            {userName} さん
          </h1>

          {/* ドロップダウンリスト */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <select
              onChange={(e) => setRole(e.target.value as Roles)}
              value={role}
              style={{
                padding: "0.5rem",
                borderRadius: "4px",
                background: "#f5f5f5",
                border: "1px solid #cccccc",
                color: "#333",
              }}
            >
              {Object.keys(roles).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <RadarChart skills={skills} goals={roles[role]} stepSize={20} />
        </div>
      </div>
    </div>
  );
}
