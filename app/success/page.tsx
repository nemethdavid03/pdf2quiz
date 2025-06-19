import ClientSuccess from "./components/ClientSuccess";

interface SuccessPageProps {
    searchParams?: Promise<{ session_id?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
    // Várd meg a Promise-t
    const params = searchParams ? await searchParams : {};
    const sessionId = params?.session_id ?? null;

    return <ClientSuccess sessionId={sessionId} />;
}