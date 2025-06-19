"use client";

import { useState } from "react";
import { PDFDocument, PDFFont, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";

type QuizQuestion = {
    question: string;
    options: string[];
    correct: number;
};

type QuizListProps = {
    quiz: QuizQuestion[];
    answers: (string | null)[];
    onAnswer: (index: number, answer: string) => void;
    score: number | null;
    onEvaluate: () => void;
};

export default function QuizList({
    quiz,
    answers,
    onAnswer,
    score,
    onEvaluate,
}: QuizListProps) {
    const [current, setCurrent] = useState(0);
    const total = quiz.length;
    const currentQuestion = quiz[current];

    const goNext = () => {
        if (current < total - 1) setCurrent((prev) => prev + 1);
    };

    const goPrev = () => {
        if (current > 0) setCurrent((prev) => prev - 1);
    };

    const handleDownloadPDF = async () => {
        const fontBytes = await fetch("/fonts/roboto.ttf").then((res) =>
            res.arrayBuffer()
        );

        const pdfDoc = await PDFDocument.create();
        pdfDoc.registerFontkit(fontkit);
        const robotoFont = await pdfDoc.embedFont(fontBytes);

        let page = pdfDoc.addPage([595, 842]);
        const marginLeft = 50;
        const marginRight = 50;
        const marginBottom = 50;
        const maxWidth = 595 - marginLeft - marginRight;
        const fontSizeQuestion = 12;
        const fontSizeOption = 11;
        const lineHeight = 18;
        let y = 780;

        function wrapText(
            text: string,
            maxWidth: number,
            font: PDFFont,
            fontSize: number
        ) {
            const words = text.split(" ");
            const lines: string[] = [];
            let line = "";

            for (const word of words) {
                const testLine = line ? line + " " + word : word;
                const width = font.widthOfTextAtSize(testLine, fontSize);
                if (width > maxWidth) {
                    if (line) lines.push(line);
                    line = word;
                } else {
                    line = testLine;
                }
            }
            if (line) lines.push(line);
            return lines;
        }

        for (let i = 0; i < quiz.length; i++) {
            const q = quiz[i];

            const questionLines = wrapText(
                `${i + 1}. ${q.question}`,
                maxWidth,
                robotoFont,
                fontSizeQuestion
            );

            for (const line of questionLines) {
                if (y < marginBottom) {
                    page = pdfDoc.addPage([595, 842]);
                    y = 780;
                }
                page.drawText(line, {
                    x: marginLeft,
                    y,
                    size: fontSizeQuestion,
                    font: robotoFont,
                    color: rgb(0, 0, 0),
                });
                y -= lineHeight;
            }
            y -= 5;

            const boxSize = 12;
            for (const option of q.options) {
                if (y < marginBottom) {
                    page = pdfDoc.addPage([595, 842]);
                    y = 780;
                }

                page.drawRectangle({
                    x: marginLeft + 10,
                    y: y - 3,
                    width: boxSize,
                    height: boxSize,
                    borderColor: rgb(0, 0, 0),
                    borderWidth: 1,
                });

                const optionLines = wrapText(
                    option,
                    maxWidth - (boxSize + 15),
                    robotoFont,
                    fontSizeOption
                );
                optionLines.forEach((line, idx) => {
                    page.drawText(line, {
                        x: marginLeft + 10 + boxSize + 5,
                        y: y - idx * lineHeight,
                        size: fontSizeOption,
                        font: robotoFont,
                        color: rgb(0, 0, 0),
                    });
                });
                y -= lineHeight * optionLines.length;
            }

            y -= 15;
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        saveAs(blob, "quiz-form.pdf");
    };

    return (
        <section className="w-full max-w-2xl mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                    📘 Question {current + 1} / {total}
                </h2>
                {score !== null && (
                    <span className="text-sm bg-green-100 text-green-500 px-3 py-1 rounded-full font-medium">
                        Score: {score} / {quiz.length}
                    </span>
                )}
            </div>

            <div className="rounded-xl shadow-lg p-6">
                <div className="mb-4">
                    <h3 className="text-lg font-medium">
                        {currentQuestion.question}
                    </h3>
                    <ul className="mt-3 space-y-2">
                        {currentQuestion.options.map((option, i) => {
                            const selected = answers[current] === option;
                            const correctOptionIndex = currentQuestion.correct;
                            const isCorrectOption = correctOptionIndex === i;
                            const isAnswered = answers[current] !== null;

                            let btnClass = "w-full text-left px-4 py-2 rounded-lg border ";

                            if (score !== null && isAnswered) {
                                if (isCorrectOption) {
                                    btnClass += "border-green-600 bg-green-100 text-green-900";
                                } else if (selected && !isCorrectOption) {
                                    btnClass += "border-red-600 bg-red-100 text-red-900";
                                } else {
                                    btnClass += "border-gray-300";
                                }
                            } else {
                                // még nincs értékelve
                                if (selected) {
                                    btnClass += "border-blue-600";
                                } else {
                                    btnClass += "border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900";
                                }
                            }

                            return (
                                <li key={i}>
                                    <button
                                        onClick={() => onAnswer(current, option)}
                                        disabled={score !== null} // Ha értékelt, ne lehessen változtatni
                                        className={btnClass}
                                    >
                                        {option}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            <div className="flex justify-between items-center mt-6 space-x-2">
                <Button
                    onClick={goPrev}
                    disabled={current === 0}
                    className="px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                >
                    ⬅️ Previous
                </Button>

                {current === total - 1 && score === null ? (
                    <Button
                        onClick={onEvaluate}
                        className="ml-auto px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700 font-semibold"
                    >
                        Evaluate
                    </Button>
                ) : (
                    <Button
                        onClick={goNext}
                        disabled={current === total - 1}
                        className="ml-auto px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 font-medium"
                    >
                        Next ➡️
                    </Button>
                )}

                <Button
                    onClick={handleDownloadPDF}
                    className="px-4 py-2font-medium"
                >
                    📄Download PDF
                </Button>
            </div>
        </section>
    );
}
