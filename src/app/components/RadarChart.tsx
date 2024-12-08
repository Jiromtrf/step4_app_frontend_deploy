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
  skills?: Skills; // オプショナルに変更
  goals?: Skills;  // オプショナルに変更
}

export default function RadarChart({ skills, goals }: RadarChartProps) {
  // デフォルト値を設定
  const defaultSkills = { biz: 0, design: 0, tech: 0 };
  const defaultGoals = { biz: 50, design: 50, tech: 50 }; // デフォルト目標値

  const data = {
    labels: ["Biz", "Design", "Tech"],
    datasets: [
      {
        label: "目標値",
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
        label: "あなたの能力値",
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
        max: 100,
        ticks: {
          stepSize: 20,
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
