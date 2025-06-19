import { NextResponse } from "next/server";
import Stripe from "stripe";
import { currentUser } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-05-28.basil",
});

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        if (!user || !user.emailAddresses.length) {
            return NextResponse.json(
                { error: "User not authenticated or no email found" },
                { status: 401 }
            );
        }
        const email = user.emailAddresses[0].emailAddress;

        const { priceId } = await req.json();
        if (!priceId) {
            return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [{ price: priceId, quantity: 1 }],
            customer_email: email,
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Stripe Checkout Session error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
