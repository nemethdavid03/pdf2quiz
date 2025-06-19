import ClientSuccess from "./components/ClientSuccess";

interface SuccessPageProps {
    searchParams?: { session_id?: string };
}

export default function SuccessPage({ searchParams }: SuccessPageProps) {
    return <ClientSuccess sessionId={searchParams?.session_id ?? null} />;
}
