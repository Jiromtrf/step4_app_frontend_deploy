"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react"; // useCallback を削除
import dynamic from "next/dynamic";
import Image from "next/image";
import HomeButton from "../../components/HomeButton";
import styles from "./dashboard.module.css"; // CSSモジュールをインポート

// レーダーチャートを動的にインポート（SSR無効）
const RadarChart = dynamic(() => import("../../components/RadarChart"), { ssr: false });

type Roles = "PdM" | "Design" | "Tech" | "Biz";

interface Skills {
  biz: number;
  design: number;
  tech: number;
}

const roles: Record<Roles, Skills> = {
  PdM: { biz: 90, design: 80, tech: 80 },
  Design: { biz: 20, design: 90, tech: 40 },
  Tech: { biz: 20, design: 40, tech: 90 },
  Biz: { biz: 90, design: 40, tech: 20 },
};

const messages = {
  sufficient: [
    "これだけできてれば余裕じゃん！さすがにこのレベルになると、どんなチームでも引っ張っていけるって感じだね！次のステージに進んで、もっと自分を試してみよ！✨",
    "天才じゃん！このまま全ロール制覇しちゃえよ！しかもただの天才じゃなくて、努力型の天才だから、未来めっちゃ明るいって！🔥",
    "めっちゃ仕上がってるじゃん！ここまで来ると周りも頼りにしちゃうレベルだね。次のチャレンジではさらにスキルを見せつけて！✨",
  ],
  partial: [
    "あと少しで完璧！『{不足スキル}』をもうちょっと鍛えたら、どんなプロジェクトでも即戦力確定だし、みんなが頼りたくなる存在になれるよ！💪",
    "ココ頑張ればもう完成系だし！『{不足スキル}』をクリアすれば、きっと『{ロール}』でも輝ける！この勢いで一緒にがんばろ！🔥",
    "その調子で攻めれば、すぐトップクラスだよ！『{不足スキル}』を少しずつでも成長させれば、間違いなく結果がついてくる！✨",
  ],
  mismatch: [
    "今『{ロール}』を試してるけど、アナタの目標は『{指向性}』だよね！いろいろ試すのもいいけど、本命のために準備しておくのも忘れないでね！😊",
    "いろいろチャレンジしてるのエモいけど、最終目標の『{指向性}』を目指すなら、ちょっとずつ戻る準備もしとこ！次のステップが楽になるよ！✨",
    "どのロールでもいけそうだけど、最終目標は『{指向性}』だよね。そっちでも輝ける準備、そろそろ始めてみる？🔥",
  ],
  insufficient: [
    "大丈夫、アナタのペースでいこ！スキルは一気に伸びるもんじゃないから、少しずつ『{不足スキル}』を伸ばせば確実に成長できる！努力してる姿、アタシが一番見てるからね！🌟",
    "焦らなくてOK！今は『{不足スキル}』を1つ伸ばすだけで十分だし、それだけで確実にゴールに近づけるよ。小さな一歩が大きな変化を生むんだから！✨",
    "スキルは積み重ねっしょ！今は挑戦してるだけでめちゃくちゃエライ！アタシはその努力をずっと応援してるから、一緒に頑張ろう！🙌",
  ],
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [skills, setSkills] = useState<Skills>({ biz: 0, design: 0, tech: 0 });
  const [role, setRole] = useState<Roles>("PdM");
  const [userName, setUserName] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(""); // 日付選択用
  const [orientations, setOrientations] = useState<string[]>([]); // 初期値を空配列に設定

  // スキルとユーザー名の取得
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
        .catch((err: unknown) => {
          if (err instanceof Error) {
            console.error('Error fetching skills:', err.message);
          } else {
            console.error('Error fetching skills:', err);
          }
        });

      // ユーザーの指向性の取得
      fetch(`${baseUrl}/api/user/orientation`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
        .then((res) => res.json())
        .then((data: { orientations: string[] }) => {
          setOrientations(data.orientations || []); // undefined対策で空配列をデフォルトに
        })
        .catch((err: unknown) => {
          if (err instanceof Error) {
            console.error("Error fetching orientations:", err.message);
          } else {
            console.error("Error fetching orientations:", err);
          }
        });
    }
  }, [session, selectedDate]); // selectedDate変更時にも再フェッチ

  // メッセージの設定
  useEffect(() => {
    const goals = roles[role];
    const isAboveGoals =
      skills.biz >= goals.biz &&
      skills.design >= goals.design &&
      skills.tech >= goals.tech;

    const areasToImprove: string[] = [];
    if (skills.biz < goals.biz) areasToImprove.push("Biz");
    if (skills.design < goals.design) areasToImprove.push("Design");
    if (skills.tech < goals.tech) areasToImprove.push("Tech");

    const primaryOrientation = orientations?.[0] || null;

    let chosenMessage = "";

    // 能力達成のセリフを最初に追加
    if (isAboveGoals) {
      chosenMessage +=
        messages.sufficient[
          Math.floor(Math.random() * messages.sufficient.length)
        ];
    } else if (areasToImprove.length > 0) {
      chosenMessage +=
        messages.partial[
          Math.floor(Math.random() * messages.partial.length)
        ].replace("{不足スキル}", areasToImprove.join(", "));
    } else {
      chosenMessage +=
        messages.insufficient[
          Math.floor(Math.random() * messages.insufficient.length)
        ].replace("{不足スキル}", areasToImprove.join(", "));
    }

    // マッチ/ミスマッチのセリフを追加
    if (primaryOrientation) {
      if (primaryOrientation === role) {
        // マッチ時のセリフ
        chosenMessage +=
          "\n\n" + // セリフを分けるため改行を追加
          `今やってる『${role}』はアナタにピッタリ！目標と一致してるし、このままスキルを磨いて極めちゃおう！✨`;
      } else {
        // ミスマッチ時のセリフ
        chosenMessage +=
          "\n\n" +
          messages.mismatch[
            Math.floor(Math.random() * messages.mismatch.length)
          ]
            .replace("{指向性}", primaryOrientation)
            .replace("{ロール}", role);
      }
    }

    setMessage(chosenMessage);
  }, [role, skills, orientations]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return <p>You are not logged in. Please log in first.</p>;
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5deb3",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {/* ホームボタンを左上に固定 */}
      <div style={{ position: "absolute", top: "20px", left: "20px" }}>
        <HomeButton />
      </div>

      {/* 中央コンテンツ */}
      <div className={styles.container}>
        {/* 日付選択ボタンを中央コンテンツの上部右側に配置 */}
        <div className={styles.datePicker}>
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

        <div className={styles.innerFlexContainer}>
          {/* 女の子とフキダシ */}
          <div className={styles.speechBubbleContainer}>
            {/* フキダシ */}
            <div className={styles.speechBubble}>
              {message}
            </div>
            {/* 女の子の画像 */}
            <Image
              src="/gal1.webp"
              alt="Girl Image"
              width={300}
              height={300}
              className={styles.image}
            />
          </div>

          {/* レーダーチャートとドロップダウン */}
          <div className={styles.roleContainer}>
            {/* ユーザーネームの色を黒に設定 */}
            <h1 style={{ color: '#000' }}>{userName} さん</h1>

            {/* ドロップダウンリストの色を統一 */}
            <div className={styles.selectRole}>
              <select
                className={styles.customSelect} // CSSモジュールのクラスを適用
                onChange={(e) => setRole(e.target.value as Roles)}
                value={role}
              >
                {Object.keys(roles).map((roleKey) => (
                  <option key={roleKey} value={roleKey}>
                    {roleKey}
                  </option>
                ))}
              </select>
            </div>

            {/* レーダーチャート */}
            <RadarChart skills={skills} goals={roles[role]} stepSize={20} />
          </div>
        </div>
      </div>
    </div>
  );
}
