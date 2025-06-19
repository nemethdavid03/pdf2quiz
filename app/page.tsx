"use client";

import React, { useState, useRef, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import PdfUploader from "./components/PdfUploader";
import QuizList from "./components/QuizList";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type QuizQuestion = {
  question: string;
  options: string[];
  correct: number;
};

export default function HomePage() {
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(true);
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fileRef = useRef<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFileName(file.name);
    fileRef.current = file;
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setQuiz(null);
    setAnswers([]);
    setScore(null);

    const file = fileRef.current;
    if (!file || file.type !== "application/pdf") {
      setError("Please select a valid PDF file.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("numQuestions", numQuestions.toString());

      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }

      const json = await res.json();
      setQuiz(json.quiz);
      setAnswers(new Array(json.quiz.length).fill(null));
      setShowUploader(false);
      setIsDialogOpen(true); // automatikusan nyitjuk a dialógot
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Network error.");
      }
    }
    finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index: number, answer: string) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[index] = answer;
      return updated;
    });
  };

  const evaluate = () => {
    if (!quiz) return;
    const correctCount = quiz.reduce((acc, q, i) => {
      return acc + (answers[i] === q.options[q.correct] ? 1 : 0);
    }, 0);
    setScore(correctCount);
  };

  // Csak a feltöltési állapot reset, quiz megmarad
  const resetUploader = () => {
    setShowUploader(true);
    setScore(null);
    setAnswers([]);
    setError(null);
    fileRef.current = null;
    setSelectedFileName(null);
  };

  // Teljes reset: quiz törlése + uploader visszaállítás + dialóg zárása
  const resetAll = () => {
    setQuiz(null);
    resetUploader();
    setIsDialogOpen(false);
  };

  return (
    <main className="min-h-screen py-24 px-6">
      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div className="max-w-xl mx-auto md:mx-0 text-center md:text-left">
          <h1 className="text-6xl font-extrabold tracking-tight drop-shadow-md leading-[1.1]">
            Turn your PDFs into engaging AI-powered quizzes
          </h1>
          <p className="mt-6 text-lg text-gray-500 leading-relaxed max-w-lg drop-shadow-sm">
            Upload any PDF document and instantly generate quizzes that help
            reinforce learning and measure knowledge retention, powered by
            advanced AI technology.
          </p>

          {/* Gomb a dialóg újbóli megnyitásához, ha quiz készen van és dialóg zárva */}
          {quiz && !isDialogOpen && (
            <div className="mt-6 flex space-x-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                Show Quiz
              </Button>
              <Button variant="destructive" onClick={resetAll}>
                Reset All
              </Button>
            </div>
          )}
        </div>

        <div className="relative rounded-3xl p-12 w-full mx-auto border">
          <div className="absolute inset-0 rounded-3xl pointer-events-none" />
          {showUploader ? (
            <form onSubmit={handleUpload} className="space-y-8 relative z-10">
              <PdfUploader onFileSelect={handleFileSelect} selectedFileName={selectedFileName} />

              <div className="flex flex-col space-y-2">
                <label htmlFor="numQuestions" className="text-sm font-medium text-gray-500">
                  Number of questions
                </label>
                <Input
                  id="numQuestions"
                  type="number"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  min={1}
                  max={20}
                  required
                />
              </div>

              <Button
                type="submit"
                variant={"default"}
                size={"lg"}
                disabled={loading}
                className="w-full bg-green-400 text-gray-900 hover:bg-green-500
                  font-semibold
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Generating Quiz..." : "Generate Quiz"}
              </Button>
              {error && (
                <p className="mt-4 text-red-600 font-semibold drop-shadow-sm">
                  {error}
                </p>
              )}
            </form>
          ) : (
            <div className="flex flex-col space-y-6 relative z-10">
              <div className="flex items-center space-x-5 pb-5">
                <span className="text-6xl select-none">📄</span>
                <p className="text-lg font-semibold truncate dark:text-gray-100">{selectedFileName}</p>
              </div>
              <button
                onClick={resetUploader}
                className="self-start text-green-400 font-semibold hover:underline transition"
              >
                Upload Another PDF
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Quiz Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Quiz</DialogTitle>
            <DialogDescription>Answer the questions generated from your PDF</DialogDescription>
            <DialogClose className="absolute top-4 right-4" />
          </DialogHeader>

          {quiz && (
            <QuizList
              quiz={quiz}
              answers={answers}
              onAnswer={handleAnswer}
              onEvaluate={evaluate}
              score={score}
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
