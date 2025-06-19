"use client";

import { useRef } from "react";

type PdfUploaderProps = {
    onFileSelect: (file: File) => void;
    selectedFileName: string | null;
};

export default function PdfUploader({ onFileSelect, selectedFileName }: PdfUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
                Upload a PDF to generate quiz
            </label>

            <div className="relative w-full">
                <input
                    type="file"
                    accept="application/pdf"
                    ref={fileInputRef}
                    onChange={() => {
                        const file = fileInputRef.current?.files?.[0];
                        if (file && file.type === "application/pdf") {
                            onFileSelect(file);
                        }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                />

                <div className={`flex items-center justify-center h-28 border-2 border-dashed rounded-lg px-4 transition-all
          ${selectedFileName ? 'border-green-500 bg-green-50 text-green-800' : 'border-green-400 bg-green-200 text-green-700 hover:border-green-600 hover:bg-green-100'}
        `}>
                    <span className="text-sm font-medium">
                        {selectedFileName
                            ? `✅ Selected file: ${selectedFileName}`
                            : "Click or drag a PDF file"}
                    </span>
                </div>
            </div>
        </div>
    );
}
