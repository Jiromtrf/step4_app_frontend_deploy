// frontend/src/app/home/checktest/resultPage/page.tsx

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";

function ResultPageContent() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const scoreParam = searchParams.get("score");
    const totalParam = searchParams.get("total");
    const categoryParam = searchParams.get("category"); // カテゴリをクエリから取得（必要に応じて実装）
    
    const score = scoreParam ? parseInt(scoreParam, 10) : 0;
    const total = totalParam ? parseInt(totalParam, 10) : 0;
    const percentage = total > 0 ? (score / total) * 100 : 0;

    // **ここから追加**
    // ページ表示時に一度だけテスト結果をPOSTで送信するuseEffect
    useEffect(() => {
        if (session && categoryParam) {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
            fetch(`${baseUrl}/api/test_results/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.accessToken}`
                },
                body: JSON.stringify({
                    category: categoryParam,
                    correct_answers: score
                })
            })
            .then((res) => {
                if (!res.ok) {
                    return res.json().then(errorData => { 
                        throw new Error(errorData.detail || 'Failed to save test result'); 
                    });
                }
                return res.json();
            })
            .then(data => {
                console.log('Test result saved:', data);
                const testTime = data.created_at; // 取得した日時をtest_timeとして使用
                // 3秒後の遷移時にtest_timeパラメータを付与
                const timer = setTimeout(() => {
                    router.push(`/home/checktest/growthAnimation?test_time=${testTime}`);
                }, 3000);
                return () => clearTimeout(timer);
            })
            .catch(err => console.error(err));
        }
    }, [session, categoryParam, score]);
    // **ここまで追加**

    useEffect(() => {
        let audioSrc = "";
        if (percentage >= 80) {
            audioSrc = "/success.mp3";
        } else if (percentage >= 50) {
            audioSrc = "/improve.mp3";
        } else {
            audioSrc = "/try_again.mp3";
        }

        const audio = new Audio(audioSrc);
        audio.play();
    }, [percentage]);

    useEffect(() => {
        const testDate = new Date().toISOString().split("T")[0];
        const timer = setTimeout(() => {
            router.push(`/home/checktest/growthAnimation?date=${testDate}`);
        }, 3000);
        return () => clearTimeout(timer);
    }, [router]);

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
                <p className="text-lg text-gray-700 mb-4">正解数: {score} / {total}</p>
                <p className="text-lg text-gray-700 mb-4">正解率: {percentage.toFixed(2)}%</p>
                <p className="text-gray-700 mb-6">{getMessage()}</p>
                <p className="text-gray-700">3秒後に成長アニメーションページへ移動します…</p>
            </div>
        </div>
    );
}

export const dynamic = "force-dynamic";

export default function ResultPage() {
    return (
        <Suspense fallback={<div>読み込み中...</div>}>
            <ResultPageContent />
        </Suspense>
    );
}
