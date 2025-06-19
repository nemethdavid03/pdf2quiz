import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

type QuizQuestion = {
    question: string;
    options: string[];
    correct: number;
};

type QuizQuestionCardProps = {
    question: QuizQuestion;
    index: number;
    selected: string | null;
    showResult: boolean;
    onSelect: (option: string) => void;
};

export default function QuizQuestionCard({
    question,
    index,
    selected,
    showResult,
    onSelect,
}: QuizQuestionCardProps) {
    const correctOption = question.options[question.correct];

    return (
        <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-5 select-none">
                {index + 1}. {question.question}
            </h3>

            <div className="grid gap-3">
                {question.options.map((option, idx) => {
                    const isSelected = selected === option;
                    const isCorrect = option === correctOption;

                    let baseStyle =
                        "relative cursor-pointer rounded-lg border px-5 py-3 font-medium transition flex items-center select-none";

                    let borderLeft = "";

                    if (showResult) {
                        if (isCorrect) {
                            baseStyle += " bg-green-50 border border-green-300 text-green-800";
                            borderLeft = "border-l-4 border-green-600";
                        } else if (isSelected && !isCorrect) {
                            baseStyle += " bg-red-50 border border-red-300 text-red-800 line-through";
                            borderLeft = "border-l-4 border-red-600";
                        } else {
                            baseStyle += " bg-gray-100 border border-gray-300 text-gray-600";
                            borderLeft = "border-l-4 border-transparent";
                        }
                    } else {
                        baseStyle += isSelected
                            ? " bg-indigo-600 border-indigo-600"
                            : " bg-white border-gray-300 text-gray-800 hover:bg-indigo-50";
                    }

                    return (
                        <label key={idx} className={`${baseStyle} ${borderLeft}`}>
                            <input
                                type="radio"
                                name={`question-${index}`}
                                value={option}
                                checked={isSelected}
                                disabled={showResult}
                                onChange={() => onSelect(option)}
                                className="sr-only"
                            />

                            {/* Ikon visszajelzéshez */}
                            <span className="flex items-center justify-center w-6 h-6 mr-4">
                                {showResult && isCorrect && (
                                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                                )}
                                {showResult && isSelected && !isCorrect && (
                                    <XCircleIcon className="w-6 h-6 text-red-600" />
                                )}
                                {!showResult && isSelected && (
                                    <span className="block w-3 h-3 rounded-full bg-white border-4 border-indigo-600" />
                                )}
                            </span>

                            <span className="text-sm">{option}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}
