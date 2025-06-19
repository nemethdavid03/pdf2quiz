"use client";

import { useEffect, useState } from "react";
import {
    useUser,
    UserButton,
    SignInButton,
    SignedIn,
    SignedOut,
} from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { SiteName } from "@/lib/config";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ui/ModeToogle";

export default function Navbar() {
    const { user, isSignedIn } = useUser();
    const [menuOpen, setMenuOpen] = useState(false);

    // Kreditek lekérése
    const credits = useQuery(
        api.users.getUserCredits,
        user ? { clerkId: user.id } : "skip"
    );
    const creditCount = credits ?? 0;

    const createUserIfNotExists = useMutation(api.users.createUserIfNotExists);

    useEffect(() => {
        if (isSignedIn) {
            createUserIfNotExists().catch(console.error);
        }
    }, [isSignedIn, createUserIfNotExists]);

    // Dialog nyitottság
    const [dialogOpen, setDialogOpen] = useState(false);

    // Stripe árak (ezeket a backend Stripe áraid alapján kell beállítani)
    const prices = [
        { id: "price_1RbhlFKCoI8upLTCUkpyTI2A", name: "Mega Pack", credits: 100, price: "$30" },
        { id: "price_1Example1", name: "Small Pack", credits: 10, price: "$5" },
        { id: "price_1Example2", name: "Medium Pack", credits: 25, price: "$12" },
        { id: "price_1Example3", name: "Large Pack", credits: 60, price: "$25" },
    ];

    const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

    const handleCheckout = async (priceId: string) => {
        setLoadingPriceId(priceId);
        try {
            const res = await fetch("/api/stripe/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId }),
            });

            const data = await res.json();

            if (data.url) {
                window.location.href = data.url; // Redirect Stripe Checkout
            } else {
                alert("Hiba történt: " + data.error);
            }
        } catch {
            alert("Hiba történt a fizetés indításakor.");
        } finally {
            setLoadingPriceId(null);
        }
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-black shadow-sm">
                <div className="flex items-center justify-between px-6 py-4">
                    {/* Logo and Beta badge */}
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-green-400">{SiteName}</span>
                        <Badge
                            variant={"outline"}
                            className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full"
                        >
                            Beta
                        </Badge>
                    </div>

                    {/* Hamburger for mobile */}
                    <button
                        className="md:hidden flex flex-col justify-between w-6 h-5 focus:outline-none"
                        onClick={() => setMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <span className="w-full h-0.5 bg-gray-700 dark:bg-gray-300 rounded"></span>
                        <span className="w-full h-0.5 bg-gray-700 dark:bg-gray-300 rounded"></span>
                        <span className="w-full h-0.5 bg-gray-700 dark:bg-gray-300 rounded"></span>
                    </button>

                    {/* Desktop Menu */}
                    <nav className="hidden md:flex items-center space-x-4">
                        {/* Credits badge with DialogTrigger */}
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <div className="relative cursor-pointer group">
                                    <Badge
                                        variant={"outline"}
                                        className="py-2.5 select-none"
                                        aria-label="Click to buy tokens"
                                    >
                                        💳 {creditCount} credits
                                    </Badge>
                                </div>
                            </DialogTrigger>

                            <DialogContent className="max-w-md w-full">
                                <DialogHeader>
                                    <DialogTitle>Buy Tokens</DialogTitle>
                                    <DialogDescription>
                                        Select a package to purchase tokens for using the service.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="mt-6 grid grid-cols-2 gap-4">
                                    {prices.map((pack) => (
                                        <div
                                            key={pack.id}
                                            className="border justify-between aspect-square w-full h-full flex flex-col p-4 text-center rounded-md shadow hover:shadow-lg transition cursor-pointer"
                                        >
                                            <span className="mt-4 text-sm">{pack.name}</span>
                                            <span className="font-semibold text-xl my-2">
                                                {pack.credits} tokens
                                            </span>
                                            <span className="text-lg font-bold">{pack.price}</span>
                                            <Button
                                                disabled={loadingPriceId === pack.id}
                                                onClick={() => handleCheckout(pack.id)}
                                                className="mt-auto"
                                            >
                                                {loadingPriceId === pack.id ? "Betöltés..." : "Vásárlás"}
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="ghost" className="mt-4 w-full">
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <ModeToggle />
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton />
                        </SignedOut>
                    </nav>
                </div>

                {/* Mobile Drawer */}
                <div
                    className={`fixed top-0 right-0 h-full w-64 bg-white dark:bg-black shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${menuOpen ? "translate-x-0" : "translate-x-full"
                        } md:hidden`}
                >
                    <div className="flex items-center justify-between px-4 py-4 border-b">
                        <span className="text-xl font-bold text-green-600">{SiteName}</span>
                        <button
                            className="text-gray-600 dark:text-gray-300 text-lg font-bold"
                            onClick={() => setMenuOpen(false)}
                            aria-label="Close menu"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="flex flex-col items-center p-4 space-y-4">
                        <div
                            className="cursor-pointer w-full"
                            onClick={() => setDialogOpen(true)}
                            aria-label="Open buy tokens dialog"
                        >
                            <Badge variant={"outline"} className="py-4 w-full text-center">
                                💳 {creditCount} credits
                            </Badge>
                        </div>
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton />
                        </SignedOut>
                    </div>
                </div>

                {/* Overlay */}
                {menuOpen && (
                    <div
                        onClick={() => setMenuOpen(false)}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </header>
        </>
    );
}
