import ClientSuccess from "./components/ClientSuccess";


interface SuccessPageProps {
    searchParams: { session_id?: string };
}

export default function SuccessPage({ searchParams }: SuccessPageProps) {
    const sessionId = searchParams?.session_id ?? null;

    return <ClientSuccess sessionId={sessionId} />;
}