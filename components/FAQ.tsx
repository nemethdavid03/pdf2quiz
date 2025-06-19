"use client";

import { useState } from "react";

type FAQItem = {
    question: string;
    answer: string;
};

const faqItems: FAQItem[] = [
    {
        question: "How does the PDF quiz generation work?",
        answer:
            "Upload your PDF, and our AI will analyze the content to generate 6-8 relevant quiz questions automatically.",
    },
    {
        question: "What formats are supported for upload?",
        answer: "Currently, only PDF files are supported for upload.",
    },
    {
        question: "Is there a limit to the number of PDFs I can upload?",
        answer:
            "Free users can upload up to 2 PDFs per month. Pro users have unlimited uploads.",
    },
    {
        question: "Can I export the quizzes?",
        answer: "Yes! Exporting quizzes is available in the Pro plan.",
    },
    {
        question: "How do I upgrade my plan?",
        answer:
            "You can upgrade anytime via the pricing section",
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (index: number) => {
        setOpenIndex((prev) => (prev === index ? null : index));
    };

    return (
        <section
            id="faq"
            className="max-w-3xl mx-auto px-4 py-12"
            aria-label="Frequently Asked Questions"
        >
            <h2 className="text-4xl font-extrabold text-center mb-12">
                Frequently Asked Questions
            </h2>
            <div className="space-y-6">
                {faqItems.map((item, i) => {
                    const isOpen = openIndex === i;
                    return (
                        <div
                            key={i}
                            className="border rounded-lg shadow-sm"
                        >
                            <button
                                id={`faq-header-${i}`}
                                aria-controls={`faq-content-${i}`}
                                aria-expanded={isOpen}
                                onClick={() => toggle(i)}
                                className="w-full text-left px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex justify-between items-center"
                            >
                                <span className="text-lg font-semibold">
                                    {item.question}
                                </span>
                                <svg
                                    className={`w-5 h-5 text-indigo-600 transform transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19 9l-7 7-7-7"
                                    ></path>
                                </svg>
                            </button>
                            {isOpen && (
                                <div
                                    id={`faq-content-${i}`}
                                    role="region"
                                    aria-labelledby={`faq-header-${i}`}
                                    className="px-6 py-4 dark:text-gray-400"
                                >
                                    <p className="leading-relaxed">{item.answer}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
