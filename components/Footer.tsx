import { SiteName } from "@/lib/config";

// components/Footer.tsx
const Footer = () => {
    return (
        <footer className="w-full py-6 text-center text-sm border">
            © {new Date().getFullYear()} {SiteName}. All rights reserved.
        </footer>
    );
};

export default Footer;
