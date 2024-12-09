"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function QuizHome() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [dates, setDates] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.push("/auth/signin");
        }
    }, [session, status, router]);

    useEffect(() => {
        if (session) {
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get_all_dates`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("日付一覧の取得に失敗しました");
                    }
                    return response.json();
                })
                .then((data: string[]) => {
                    setDates(data);
                    setIsLoading(false);
                })
                .catch((err) => {
                    console.error("Error fetching dates:", err);
                    setError(err.message);
                    setIsLoading(false);
                });
        }
    }, [session]);

    const handleStart = () => {
        if (selectedDate) {
            router.push(`/home/checktest/categorySelection?date=${selectedDate}`);
        }
    };

    if (status === "loading" || !session) {
        return <div className="flex items-center justify-center min-h-screen">読み込み中...</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-orange-100 text-black">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                <h1 className="text-xl font-bold mb-4">受講後理解度テスト</h1>
                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-800 rounded text-center">
                        {error}
                    </div>
                )}
                {isLoading ? (
                    <div>読み込み中...</div>
                ) : (
                    <>
                        <select
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="mb-4 p-2 border rounded w-full"
                        >
                            <option value="">日付を選択してください</option>
                            {dates.map((date, index) => (
                                <option key={index} value={date}>
                                    {date}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleStart}
                            disabled={!selectedDate}
                            className={`bg-yellow-500 text-black py-2 px-4 rounded w-full hover:bg-yellow-600 ${
                                !selectedDate ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                            スタート
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
