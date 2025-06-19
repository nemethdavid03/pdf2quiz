import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const config = {
    api: {
        bodyParser: false,
    },
};

// Segédfüggvény a JSON tömb kiszedésére a Gemini válaszból
function extractJsonArray(text: string): string | null {
    let cleaned = text.trim();
    cleaned = cleaned.replace(/```json/g, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start === -1 || end === -1 || end <= start) return null;
    return cleaned.substring(start, end + 1);
}

export async function POST(req: Request) {
    try {
        // Bejelentkezett user ellenőrzése és userId kinyerése
        const { userId } = await auth();
        console.log("DEBUG: userId from auth() =", userId);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Content-Type ellenőrzése (multipart/form-data kell)
        const contentType = req.headers.get("content-type") || "";
        if (!contentType.startsWith("multipart/form-data")) {
            return NextResponse.json(
                { error: "Csak multipart/form-data kérés támogatott" },
                { status: 400 }
            );
        }

        // FormData kinyerése
        const formData = await req.formData();
        const pdfFile = formData.get("pdf");
        if (!pdfFile || !(pdfFile instanceof Blob)) {
            return NextResponse.json(
                { error: "PDF fájl nem található a kérésben" },
                { status: 400 }
            );
        }

        // PDF méret korlátozása 20MB-ra
        if (pdfFile.size > 20 * 1024 * 1024) {
            return NextResponse.json(
                { error: "The PDF too big (max 20MB)." },
                { status: 400 }
            );
        }

        // PDF base64 konvertálás
        const arrayBuffer = await pdfFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64PDF = buffer.toString("base64");

        // Kérdésszám max 20
        const numQuestions = Math.min(Number(formData.get("numQuestions")) || 5, 20);

        // API kulcs ellenőrzése
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Nincs beállítva Gemini API kulcs" },
                { status: 500 }
            );
        }

        // Jelenlegi kreditek lekérdezése clerkId-val
        const currentCredits = await convex.query(api.users.getUserCredits, {
            clerkId: userId,
        });

        const cost = 5; // kredit ár

        if (currentCredits < cost) {
            return NextResponse.json(
                { error: "You don't have enough credit" },
                { status: 400 }
            );
        }

        // AI példány létrehozása
        const ai = new GoogleGenAI({ apiKey });

        const contents = [
            {
                text: `
The uploaded PDF is in English. Please generate exactly ${numQuestions} quiz questions in English, matching the PDF content.

IMPORTANT:
- Return ONLY a valid parseable JSON array, a single array with no explanations, markdown, or extra text.
- The quiz questions must be in English.
- The format must be exactly like this:

[
  {
    "type": "multiple",
    "question": "What is the meaning of X?",
    "options": ["Correct answer", "Wrong1", "Wrong2", "Wrong3"],
    "correct": 0
  },
  {
    "type": "truefalse",
    "question": "True or False: X is Y?",
    "options": ["true", "false"],
    "correct": 1
  }
]

Thank you!
    `.trim(),
            },
            {
                inlineData: {
                    mimeType: "application/pdf",
                    data: base64PDF,
                },
            },
        ];



        // AI hívás
        const result = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents,
        });

        if (!result.text || typeof result.text !== "string") {
            return NextResponse.json(
                { error: "Az AI nem adott vissza érvényes választ." },
                { status: 500 }
            );
        }

        // JSON parse tisztítással
        let quiz;
        try {
            quiz = JSON.parse(result.text);
        } catch {
            const jsonStr = extractJsonArray(result.text);
            if (!jsonStr) {
                return NextResponse.json(
                    { error: "Nem sikerült értelmezni az AI válaszát." },
                    { status: 500 }
                );
            }
            try {
                quiz = JSON.parse(jsonStr);
            } catch {
                return NextResponse.json(
                    { error: "Nem sikerült feldolgozni a JSON-t." },
                    { status: 500 }
                );
            }
        }

        // Kredit levonása clerkId-val
        const deductTokens = await convex.mutation(api.users.deductTokens, {
            amount: cost,
            clerkId: userId,
        });

        if (!deductTokens.success) {
            return NextResponse.json(
                { error: "Nincs elég kredit a token levonáshoz." },
                { status: 400 }
            );
        }

        return NextResponse.json({ quiz, tokensLeft: deductTokens.creditsLeft });
    } catch (e: any) {
        return NextResponse.json(
            { error: "Belső szerver hiba: " + (e.message || e.toString()) },
            { status: 500 }
        );
    }
}
