"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Quiz {
    id: number;
    question_text: string;
    options: string[];
    correct_index: number;
    explanation: string;
    category: string;
    date: string;
}

export default function QuestionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const date = searchParams.get("date") || "";
    const category = searchParams.get("category") || "";

    const [questions, setQuestions] = useState<Quiz[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showCorrectAnswer, setShowCorrectAnswer] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [score, setScore] = useState<number>(0);
    const [correctQuestions, setCorrectQuestions] = useState<number[]>([]);
    const [incorrectQuestions, setIncorrectQuestions] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (date && category) {
            setIsLoading(true);
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get_questions_by_date/${date}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("クイズデータの取得に失敗しました");
                    }
                    return response.json();
                })
                .then((data: Quiz[]) => {
                    const filteredQuestions = data.filter(q => q.category === category);
                    setQuestions(filteredQuestions);
                    setIsLoading(false);
                })
                .catch((err) => {
                    console.error("Error fetching questions:", err);
                    setError(err.message);
                    setIsLoading(false);
                });
        }
    }, [date, category]);

    const handleOptionClick = (index: number) => {
        setSelectedOption(index);
        setShowCorrectAnswer(true);

        const correctAudio = new Audio("/audio/OK.mp3");
        const incorrectAudio = new Audio("/audio/NG.mp3");

        if (index === questions[currentQuestionIndex].correct_index) {
            correctAudio.play();

            if (!correctQuestions.includes(questions[currentQuestionIndex].id)) {
                setScore(prevScore => prevScore + 1);
                setCorrectQuestions(prev => [...prev, questions[currentQuestionIndex].id]);
            }
        } else {

            incorrectAudio.play();

            if (!incorrectQuestions.includes(questions[currentQuestionIndex].id)) {
                setIncorrectQuestions(prev => [...prev, questions[currentQuestionIndex].id]);
            }
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowCorrectAnswer(false);
        } else {
            router.push(`/home/checktest/resultPage?score=${score}&total=${questions.length}`);
        }
    };

    const handleGoHome = () => {
        router.push("/home");
    };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">読み込み中...</div>;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-red-100 text-red-800 p-4 rounded">
                    エラー: {error}
                </div>
            </div>
        );
    }

    if (!questions.length) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-gray-100 text-gray-800 p-4 rounded">
                    選択したカテゴリに対応する質問がありません。
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-orange-100 text-black">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                <h1 className="text-xl font-bold mb-4">{currentQuestion.question_text}</h1>
                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleOptionClick(index)}
                            className={`w-full py-2 px-4 border rounded ${
                                showCorrectAnswer
                                    ? index === currentQuestion.correct_index
                                        ? "bg-green-500 text-white"
                                        : index === selectedOption
                                        ? "bg-red-500 text-white"
                                        : "bg-gray-100"
                                    : "bg-gray-100 hover:bg-blue-500 hover:text-white"
                            }`}
                            disabled={showCorrectAnswer}
                        >
                            {option}
                        </button>
                    ))}
                </div>
                {showCorrectAnswer && (
                    <div className="mt-4 p-4 bg-gray-100 text-gray-800 rounded">
                        {currentQuestion.explanation}
                    </div>
                )}
                <button
                    onClick={handleNext}
                    className="mt-4 bg-blue-500 text-white py-2 px-4 rounded w-full hover:bg-blue-600"
                >
                    {currentQuestionIndex < questions.length - 1 ? "次へ" : "結果を見る"}
                </button>
                <button
                    onClick={handleGoHome}
                    className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 mt-2 w-full"
                >
                    ホームに戻る
                </button>
            </div>
        </div>
    );
}
