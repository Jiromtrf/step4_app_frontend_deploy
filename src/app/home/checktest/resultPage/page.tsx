// frontend/src/app/home/checktest/resultPage/page.tsx
"use client";

export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function ResultPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const scoreParam = searchParams.get("score");
    const totalParam = searchParams.get("total");

    const score = scoreParam ? parseInt(scoreParam, 10) : 0;
    const total = totalParam ? parseInt(totalParam, 10) : 0;
    const percentage = total > 0 ? (score / total) * 100 : 0;

    const handleReturnHome = () => {
        router.push("/home");
    };

    useEffect(() => {
        // 初回ロード時に音声を準備
        let audioSrc = "";
        if (percentage >= 80) {
            audioSrc = "/success.mp3"; // 高得点用
        } else if (percentage >= 50) {
            audioSrc = "/improve.mp3"; // 中間点用
        } else {
            audioSrc = "/try_again.mp3"; // 低得点用
        }

        // Audio オブジェクトを作成
        audioRef.current = new Audio(audioSrc);
        audioRef.current.load();

        // 結果表示時に自動再生
        audioRef.current
            .play()
            .catch((err) => console.error("自動再生エラー:", err));
    }, [percentage]);

    // Determine message based on percentage
    const getMessage = () => {
        if (percentage >= 80) {
            return "素晴らしい！高得点おめでとうございます！🎉";
        } else if (percentage >= 50) {
            return "いい感じです！次回も頑張りましょう！💪";
        } else {
            return "もう一度チャレンジしてみましょう！✨";
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-orange-100 text-black">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md text-center">
                <h1 className="text-2xl font-bold mb-4">テスト完了！🎉</h1>
                <p className="text-lg text-gray-700 mb-4">
                    正解数: {score} / {total}
                </p>
                <p className="text-lg text-gray-700 mb-4">
                    正解率: {percentage.toFixed(2)}%
                </p>
                <p className="text-gray-700 mb-6">
                    {getMessage()}
                </p>
                <button
                    onClick={handleReturnHome}
                    className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600"
                >
                    ホームに戻る
                </button>
            </div>
        </div>
    );
}
