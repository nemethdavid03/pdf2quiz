"use client";

import { useEffect, useRef, useState } from "react";

export default function VideoShowcase() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.5 }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    const handlePlay = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setHasStarted(true);
        }
    };

    return (
        <section className="py-20 px-6">
            <div className="max-w-5xl mx-auto text-center">
                <h2 className="text-4xl font-bold mb-4">Watch It in Action</h2>
                <p className="dark:text-gray-200 mb-10">
                    Scroll down and press play to see how it works — with sound!
                </p>

                <div className="relative w-full max-w-4xl mx-auto">
                    <video
                        ref={videoRef}
                        className="w-full h-auto rounded-xl shadow-xl"
                        controls
                        playsInline
                    >
                        <source src="/vid.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    {!hasStarted && isVisible && (
                        <button
                            onClick={handlePlay}
                            className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-lg font-semibold rounded-xl transition hover:bg-black/70"
                        >
                            ▶️ Click to Play with Sound
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
