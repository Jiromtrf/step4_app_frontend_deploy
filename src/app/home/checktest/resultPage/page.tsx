// frontend/src/app/home/checktest/resultPage/page.tsx
"use client";

export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ResultPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const scoreParam = searchParams.get("score");
    const totalParam = searchParams.get("total");

    const score = scoreParam ? parseInt(scoreParam, 10) : 0;
    const total = totalParam ? parseInt(totalParam, 10) : 0;

    const handleReturnHome = () => {
        router.push("/home");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-orange-100 text-black">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md text-center">
                <h1 className="text-2xl font-bold mb-4">テスト完了！🎉</h1>
                <p className="text-lg text-gray-700 mb-4">
                    正解数: {score} / {total}
                </p>
                <p className="text-gray-700 mb-6">
                    お疲れさまでした！このテストで学びを深められたことを願っています。
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

export default function ResultPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResultPageContent />
        </Suspense>
    );
}
