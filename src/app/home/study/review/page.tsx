// frontend/src/app/home/study/review/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import 'chart.js/auto';
import BackButton from "../../../components/BackButton";
import styles from "./review.module.css";
import Image from "next/image";

export default function ReviewPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<{ [date: string]: number }>({});
  const [total, setTotal] = useState(0);
  // averageは使っていないため削除
  // const [average, setAverage] = useState(0);
  const [message, setMessage] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!session?.accessToken) {
        setLoading(false);
        return;
      }

      const now = new Date();
      const daysFromMonday = now.getDay() === 0 ? 6 : now.getDay() - 1;
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - daysFromMonday
      );
      const week_start = `${start.getFullYear()}-${String(
        start.getMonth()+1
      ).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${baseUrl}/api/study_logs?week_start=${week_start}`, {
        headers: {Authorization: `Bearer ${session.accessToken}`}
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch logs: ${text}`);
      }
      const data = await res.json();
      if (data && data.logs) {
        setLogs(data.logs);
        setTotal(data.total_minutes || 0);
        const calculatedAverage = (data.total_minutes || 0) / 7;
        if (calculatedAverage <= 100) {
          setMessage("勉強時間足りてなくない？もっとがんばろ！");
        } else {
          setMessage("いいペースだね！その調子！");
        }
      } else {
        setLogs({});
        setTotal(0);
        setMessage("勉強ログがありません");
      }
    };
    void fetchLogs().catch((e: unknown) => {
      if (e instanceof Error) {
        console.error(e.message);
        setError(e.message);
      } else {
        console.error(e);
        setError("不明なエラーが発生しました");
      }
    }).finally(() => {
      setLoading(false);
    });
  }, [session]);

  if (loading) {
    return (
      <div style={{
        minHeight:"100vh",
        backgroundColor:"#f5deb3",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        fontFamily:"Arial, sans-serif",
        color:"#333"
      }}>
        読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight:"100vh",
        backgroundColor:"#f5deb3",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        fontFamily:"Arial, sans-serif",
        color:"#333"
      }}>
        エラーが発生しました: {error}
      </div>
    );
  }

  const dates = Object.keys(logs).sort();
  const minutesData = dates.map(d => logs[d]);

  const chartData = {
    labels: dates,
    datasets: [
      {
        label: '勉強時間(分)',
        data: minutesData,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192,1)',
        borderWidth:1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "1週間の勉強時間",
      },
    },
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
        fontFamily:"Arial, sans-serif",
        color:"#333",
        padding:"20px",
        position: "relative"
      }}
    >
      <BackButton />

      <h1>1週間の振り返り</h1>
      <div className={styles.container}>
        <div className={styles.graphContainer}>
          {dates.length === 0 ? (
            <p>勉強ログがありません</p>
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
          <p style={{ marginTop: "20px" }}>合計勉強時間: {Math.floor(total/60)}h{total%60}min</p>
        </div>

        <div className={styles.imageContainer}>
          <div className={styles.speechBubble}>
            {dates.length === 0 ? "" : message}
          </div>
          {/* imgをImageに変更 */}
          <Image src="/girl1.webp" alt="Girl" className={styles.image} width={200} height={200} />
        </div>
      </div>
    </div>
  );
}
