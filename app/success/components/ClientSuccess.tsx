"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface ClientSuccessProps {
    sessionId: string | null;
}

export default function ClientSuccess({ sessionId }: ClientSuccessProps) {
    const router = useRouter();

    const [message, setMessage] = useState("Processing your purchase...");
    const [status, setStatus] = useState<"loading" | "success" | "error" | "info">("loading");

    const processStripeSession = useMutation(api.users.processStripeSession);

    useEffect(() => {
        if (!sessionId) {
            setMessage("Invalid session ID.");
            setStatus("error");
            return;
        }

        (async () => {
            try {
                const res = await processStripeSession({ sessionId });
                if (res.success) {
                    setMessage("🎉 Credits added successfully! Thank you for your purchase.");
                    setStatus("success");
                } else {
                    setMessage(res.message || "⚠️ This purchase has already been processed.");
                    setStatus("info");
                }
            } catch {
                setMessage("❌ An error occurred while processing your purchase.");
                setStatus("error");
            }
        })();
    }, [sessionId, processStripeSession]);

    const statusStyles = {
        loading: "text-blue-500 animate-pulse",
        success: "text-green-500",
        error: "text-red-500",
        info: "text-yellow-500",
    };

    const statusIcons = {
        loading: (
            <svg
                className="animate-spin h-10 w-10 mx-auto mb-6 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                ></circle>
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
            </svg>
        ),
        success: (
            <svg
                className="h-12 w-12 mx-auto mb-6 text-green-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
            </svg>
        ),
        error: (
            <svg
                className="h-12 w-12 mx-auto mb-6 text-red-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                ></path>
            </svg>
        ),
        info: (
            <svg
                className="h-12 w-12 mx-auto mb-6 text-yellow-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1010 10A10 10 0 0012 2z"
                ></path>
            </svg>
        ),
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 px-6">
            <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl p-10 text-center">
                <h1 className="text-4xl font-extrabold mb-8 text-gray-900 dark:text-white">
                    Payment Status
                </h1>

                {statusIcons[status]}

                <p className={`text-lg font-medium mb-8 ${statusStyles[status]}`}>{message}</p>

                <button
                    onClick={() => router.push("/")}
                    className="inline-block px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-green-400"
                    aria-label="Go back to homepage"
                >
                    ← Back to Home
                </button>

                <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
                    You can now continue exploring the app or make another purchase.
                </p>
            </div>
        </main>
    );
}
