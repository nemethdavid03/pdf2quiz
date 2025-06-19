"use client";

import Image from "next/image";
import { useState } from "react";

const screenshots = [
    {
        src: "/bio.jpg",
        alt: "Biology Test",
    },
    {
        src: "/chem.jpg",
        alt: "Chemistry Test",
    },
    {
        src: "/eye.jpg",
        alt: "Eye Test",
    },
];

export default function QuizShowcase() {
    const [hovered, setHovered] = useState(false);

    const angles = hovered ? [-20, 0, 20] : [-8, 0, 8];
    const xOffsets = hovered ? [-180, 0, 180] : [-60, 0, 60];
    const scales = hovered ? [1, 1.1, 1] : [0.95, 1, 0.95];

    return (
        <section className="py-20 px-6 dark:bg-zinc-900">
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-4xl font-bold mb-6">Generated Quizzes</h2>
                <p className="text-gray-600 mb-12">
                    Hover over the cards to see how your quizzes unfold.
                </p>

                <div className="relative h-[420px]">
                    {screenshots.map((shot, index) => {
                        const z = index === 1 ? 10 : 5;

                        return (
                            <div
                                key={index}
                                className="absolute w-[280px] h-[420px] top-0 left-1/2 rounded-xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out"
                                style={{
                                    transform: `
                    translateX(-50%)
                    translateX(${xOffsets[index]}px)
                    rotate(${angles[index]}deg)
                    scale(${scales[index]})
                  `,
                                    zIndex: z,
                                }}
                                onMouseEnter={() => setHovered(true)}
                                onMouseLeave={() => setHovered(false)}
                            >
                                <Image
                                    src={shot.src}
                                    alt={shot.alt}
                                    layout="fill"
                                    objectFit="cover"
                                    className="object-cover"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
