// frontend/src/app/home/checktest/growthAnimation/page.tsx
"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import HomeButton from "../../../components/HomeButton";

const RadarChart = dynamic(() => import("../../../components/RadarChart"), { ssr: false });

// SkillsData型は以前設定した型例
interface SkillsData {
  name: string;
  biz: number;
  design: number;
  tech: number;
}

// ラップ用コンポーネント
function GrowthAnimationContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const testTime = searchParams.get("test_time");
  const [preSkills, setPreSkills] = useState<SkillsData | null>(null);
  const [postSkills, setPostSkills] = useState<SkillsData | null>(null);

  const parseAndAdjustTime = (testTime: string): { preTime: string; postTime: string } => {
    const t = new Date(testTime);
    const preT = new Date(t.getTime() - 1000); // 1秒前
    const preDateStr = preT.toISOString().split("T")[0]; // YYYY-MM-DD形式
    const postDateStr = t.toISOString().split("T")[0];   // 当日の日付取得
    return { preTime: preDateStr, postTime: postDateStr };
  };

  useEffect(() => {
    if (session && testTime) {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const { preTime } = parseAndAdjustTime(testTime);

      fetch(`${baseUrl}/api/user/skills?date=${preTime}`, {
        headers: { Authorization: `Bearer ${session.accessToken}` }
      })
        .then((res) => res.json())
        .then((data: SkillsData) => setPreSkills(data))
        .catch((err) => console.error(err));

      fetch(`${baseUrl}/api/user/skills`, {
        headers: { Authorization: `Bearer ${session.accessToken}` }
      })
        .then((res) => res.json())
        .then((data: SkillsData) => setPostSkills(data))
        .catch((err) => console.error(err));
    }
  }, [session, testTime]);

  if (!preSkills || !postSkills) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#f5deb3",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#333",
        fontFamily: "Arial, sans-serif"
      }}>
        読み込み中...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f5deb3",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#333",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ marginBottom: "1rem" }}>今日の成長</h1>
      <div style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        maxWidth: "600px",
        width: "80%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "auto"
        }}>
          <RadarChart
            datasets={[
              {
                label: "昨日までの自分",
                data: [preSkills.biz, preSkills.design, preSkills.tech],
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgba(54, 162, 235, 1)"
              },
              {
                label: "今日の自分",
                data: [postSkills.biz, postSkills.design, postSkills.tech],
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)"
              }
            ]}
          />
        </div>
      </div>
      <div style={{ marginTop: "2rem" }}>
        <HomeButton />
      </div>
    </div>
  );
}

export default function GrowthAnimationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GrowthAnimationContent />
    </Suspense>
  );
}
