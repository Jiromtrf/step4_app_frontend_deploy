"use client";

export const dynamic = "force-dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function CategorySelection() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const date = searchParams.get("date") || "";

    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [error, /* setError */] = useState<string | null>(null); // setErrorをコメントアウト
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchedCategories = ["Tech", "Design", "Biz"];
        setCategories(fetchedCategories);
        setIsLoading(false);
    }, []);

    const handleStartQuiz = () => {
        if (selectedCategory) {
            router.push(`/home/checktest/questionPage?date=${date}&category=${selectedCategory}`);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-orange-100 text-black">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                <h1 className="text-xl font-bold mb-4">{date} - カテゴリ選択</h1>
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
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="mb-4 p-2 border rounded w-full"
                        >
                            <option value="">カテゴリを選択してください</option>
                            {categories.map((category, index) => (
                                <option key={index} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleStartQuiz}
                            disabled={!selectedCategory}
                            className={`bg-yellow-500 text-black py-2 px-4 rounded w-full hover:bg-yellow-600 ${
                                !selectedCategory ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                            クイズ開始
                        </button>
                    </>
                )}
                <button
                    onClick={() => router.back()}
                    className="mt-4 bg-gray-500 text-white py-2 px-4 rounded w-full hover:bg-gray-600"
                >
                    戻る
                </button>
            </div>
        </div>
    );
}
