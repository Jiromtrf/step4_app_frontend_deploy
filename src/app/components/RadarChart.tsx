import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface Skills {
  biz: number;
  design: number;
  tech: number;
}

interface RadarChartProps {
  skills?: Skills;
  goals?: Skills;
  mode?: "individual" | "team";
  stepSize?: number;
  labels?: { goals: string; skills: string }; // 凡例を指定するプロパティ
}

export default function RadarChart({
  skills,
  goals,
  mode = "individual",
  stepSize = 20,
  labels = { goals: "目標値", skills: "あなたの能力値" }, // デフォルト値を設定
}: RadarChartProps) {
  const defaultSkills = { biz: 0, design: 0, tech: 0 };
  const defaultGoals = { biz: 50, design: 50, tech: 50 };

  const maxScale = mode === "team" 
    ? Math.max(
        skills?.biz || 0,
        skills?.design || 0,
        skills?.tech || 0
      ) + stepSize // 余白を持たせる
    : 100;

  const data = {
    labels: ["Biz", "Design", "Tech"],
    datasets: [
      {
        label: labels.goals, // 目標値の凡例
        data: [
          goals?.biz ?? defaultGoals.biz,
          goals?.design ?? defaultGoals.design,
          goals?.tech ?? defaultGoals.tech,
        ],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
      {
        label: labels.skills, // 能力値の凡例
        data: [
          skills?.biz ?? defaultSkills.biz,
          skills?.design ?? defaultSkills.design,
          skills?.tech ?? defaultSkills.tech,
        ],
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: maxScale,
        ticks: {
          stepSize: stepSize,
          color: "#333333",
          backdropColor: "#ffffff",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        pointLabels: {
          color: "#333333",
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "#333333",
        },
      },
    },
  };

  return (
    <div style={{ width: "400px", height: "400px" }}>
      <Radar data={data} options={options} />
    </div>
  );
}
