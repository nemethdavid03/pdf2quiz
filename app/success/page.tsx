
import dynamic from "next/dynamic";

const ClientSuccess = dynamic(() => import("./components/ClientSuccess"), { ssr: false });

export default function SuccessPage() {
    return <ClientSuccess />;
}
