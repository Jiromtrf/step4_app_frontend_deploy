// frontend/src/app/home/study/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import BackButton from "../../components/BackButton";
import styles from "./study.module.css";

export default function StudyPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [mode, setMode] = useState<"select" | "study" | "break">("select");
  const [studyTime, setStudyTime] = useState<number>(0); 
  const [remaining, setRemaining] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loopActive, setLoopActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 全ループ合計勉強時間(秒)
  const [totalStudiedSeconds, setTotalStudiedSeconds] = useState(0);

  // プリセット
  const presets = {
    "まずは始める": 10 * 60,
    "スパっと集中！": 25 * 60,
    "じっくりやり込む": 60 * 60,
  };

  const breakTime = 3 * 60; // 3分休憩

  // 音声ファイル参照
  const successAudioRef = useRef<HTMLAudioElement>(null);
  const breathAudioRef = useRef<HTMLAudioElement>(null);
  const finishAudioRef = useRef<HTMLAudioElement>(null);

  const sendStudyLog = useCallback(async (minutes: number) => {
    if (!session?.accessToken) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${baseUrl}/api/study_logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ minutes }),
      });
      if (!res.ok) {
        console.error("Failed to send study log:", await res.text());
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error("Failed to send study log:", e.message);
      } else {
        console.error("Failed to send study log:", e);
      }
    }
  }, [session?.accessToken]);

  const handleTimerEnd = useCallback(async () => {
    if (mode === "study") {
      setTotalStudiedSeconds((prev) => prev + studyTime);
      if (successAudioRef.current) {
        successAudioRef.current.play().catch((error) => {
          console.error("success.mp3の再生に失敗しました:", error);
        });
      }
      alert("休憩しよう！");
      setMode("break");
      setRemaining(breakTime);
    } else if (mode === "break") {
      setMode("study");
      setRemaining(studyTime);
      if (breathAudioRef.current) {
        breathAudioRef.current.play().catch((error) => {
          console.error("もう一息です.mp3の再生に失敗しました:", error);
        });
      }
    }
  }, [mode, studyTime, breakTime]);

  useEffect(() => {
    if (loopActive && !isPaused && remaining > 0) {
      timerRef.current = setTimeout(() => {
        setRemaining((prev) => prev - 1);
      }, 1000);
    } else if (remaining === 0 && loopActive) {
      void handleTimerEnd();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loopActive, isPaused, remaining, handleTimerEnd]);

  const handleStart = (seconds: number) => {
    setStudyTime(seconds);
    setRemaining(seconds);
    setMode("study");
    setLoopActive(true);
    setIsPaused(false);
    setTotalStudiedSeconds(0);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleEnd = useCallback(async () => {
    setLoopActive(false);
    if (mode === "study" && remaining > 0 && remaining < studyTime) {
      const studiedThisCycle = studyTime - remaining;
      setTotalStudiedSeconds((prev) => prev + studiedThisCycle);
    }

    if (
      totalStudiedSeconds > 0 ||
      (mode === "study" && studyTime - remaining > 0)
    ) {
      const finalMinutes = Math.floor(
        (totalStudiedSeconds +
          (mode === "study" ? studyTime - remaining : 0)) /
          60
      );
      await sendStudyLog(finalMinutes);
    }

    if (finishAudioRef.current) {
      finishAudioRef.current.play().catch((error) => {
        console.error("頑張ったね.mp3の再生に失敗しました:", error);
      });
    }

    setMode("select");
    setStudyTime(0);
    setRemaining(0);
    setIsPaused(false);
    setTotalStudiedSeconds(0);
  }, [mode, remaining, studyTime, totalStudiedSeconds, sendStudyLog]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        minHeight:"100vh",
        backgroundColor:"#f5deb3",
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        justifyContent:"center",
        color:"#333",
        fontFamily:"Arial, sans-serif",
        padding:"20px",
        textAlign:"center",
        position:"relative"
      }}
    >
      <BackButton />

      <button
        className={styles.button}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
        }}
        onClick={() => router.push("/home/study/review")}
      >
        振り返る
      </button>

      {mode === "select" && (
        <div>
          <h1>今日も頑張ろう！</h1>
          <div className={styles.buttonContainer}>
            <button
              className={styles.button}
              onClick={() => handleStart(presets["まずは始める"])}
            >
              まずは始める (10分)
            </button>
            <button
              className={styles.button}
              onClick={() => handleStart(presets["スパっと集中！"])}
            >
              スパっと集中！ (25分)
            </button>
            <button
              className={styles.button}
              onClick={() => handleStart(presets["じっくりやり込む"])}
            >
              じっくりやり込む (60分)
            </button>
          </div>
        </div>
      )}

      {mode !== "select" && (
        <div>
          <h1>{mode === "study" ? "勉強中..." : "休憩中..."}</h1>
          <h2 style={{ fontSize: "3rem" }}>{formatTime(remaining)}</h2>
          <div style={{ marginTop: "20px" }}>
            <button
              className={styles.button}
              style={{ marginRight: "10px" }}
              onClick={handleEnd}
            >
              終了
            </button>
            <button className={styles.button} onClick={handlePause}>
              {isPaused ? "再開" : "一時停止"}
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          position:"absolute",
          bottom:"20px",
          backgroundColor:"#fff",
          border:"1px solid #ccc",
          borderRadius:"5px",
          padding:"10px",
          boxShadow:"0 2px 5px rgba(0,0,0,0.1)"
        }}
      >
        <ChallengeDisplay />
      </div>

      {/* 音声ファイル */}
      <audio ref={successAudioRef} src="/お疲れ様です.mp3" preload="auto"></audio>
      <audio ref={breathAudioRef} src="/もう一息です.mp3" preload="auto"></audio>
      <audio ref={finishAudioRef} src="/頑張ったね.mp3" preload="auto"></audio>
    </div>
  );
}

function ChallengeDisplay() {
  const { data: session } = useSession();
  const [remaining, setRemaining] = useState<string>("計算中...");

  useEffect(() => {
    const fetchLogs = async () => {
      if (!session?.accessToken) return;

      const now = new Date();
      const daysFromMonday = now.getDay() === 0 ? 6 : now.getDay() - 1;
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - daysFromMonday
      );
      const week_start = `${start.getFullYear()}-${String(
        start.getMonth() + 1
      ).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${baseUrl}/api/study_logs?week_start=${week_start}`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      if (!res.ok) {
        console.error("Failed to fetch logs:", await res.text());
        setRemaining("エラー");
        return;
      }

      const data = await res.json();
      const total = data.total_minutes || 0;
      const target = 100 * 60; 
      const diff = target - total;
      if (diff <= 0) {
        setRemaining("100時間達成おめでとう！");
      } else {
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        setRemaining(`残り ${h}h${m}min`);
      }
    };
    void fetchLogs();
  }, [session]);

  return <div>100時間チャレンジ: {remaining}</div>;
}
