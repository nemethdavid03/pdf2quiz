// app/cancel/page.tsx
import Link from "next/link";

export default function CancelPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
            <div className="max-w-md w-full dark:bg-black border shadow-md rounded-lg p-8">
                <h1 className="text-3xl font-bold text-red-600 dark:text-red-500 mb-4">Payment Cancelled</h1>
                <p className="mb-6">
                    Your transaction was canceled. You can return to the dashboard or try again later.
                </p>
                <Link
                    href="/"
                    className="inline-block px-6 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
