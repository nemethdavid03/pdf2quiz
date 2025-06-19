import { mutation, query } from "@/convex/_generated/server";
import { v } from "convex/values";

export const createUserIfNotExists = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (existingUser) return existingUser;

        return await ctx.db.insert("users", {
            clerkId: identity.subject,
            credits: 0,
            lastCreditGrantDate: new Date(0).toISOString(),
        });
    },
});

export const getUserCredits = query({
    args: v.object({
        clerkId: v.optional(v.string()),
    }),
    handler: async (ctx, { clerkId }) => {
        if (!clerkId) {
            // Ha nincs clerkId, akkor vagy 0-t adsz vissza, vagy dobj hibát, vagy ahogy akarod kezelni
            return 0;
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
            .unique();

        return user?.credits ?? 0;
    },
});

export const processStripeSession = mutation({
    args: v.object({
        sessionId: v.string(),
    }),
    handler: async (ctx, { sessionId }) => {
        // Ellenőrizzük, hogy a session már feldolgozásra került-e
        const existingPayment = await ctx.db
            .query("payments")
            .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
            .unique();

        if (existingPayment) {
            // Már feldolgoztuk, nem adunk hozzá kreditet újra
            return { success: false, message: "Session already processed" };
        }

        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        // Kredit hozzáadás (fix 100)
        const creditsToAdd = 100;

        await ctx.db.patch(user._id, {
            credits: (user.credits ?? 0) + creditsToAdd,
        });

        await ctx.db.insert("payments", {
            clerkId: identity.subject,
            sessionId,
            createdAt: new Date().toISOString(),
        });

        return { success: true };
    },
});

export const deductTokens = mutation({
    args: v.object({
        amount: v.number(),
        clerkId: v.string(),
    }),
    handler: async (ctx, { amount, clerkId }) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
            .unique();

        if (!user) {
            return { success: false, creditsLeft: 0 };
        }

        if ((user.credits ?? 0) < amount) {
            return { success: false, creditsLeft: user.credits ?? 0 };
        }

        // Levonás
        await ctx.db.patch(user._id, {
            credits: user.credits - amount,
        });

        // Frissített user lekérése
        const updatedUser = await ctx.db.get(user._id);

        return { success: true, creditsLeft: updatedUser?.credits ?? 0 };
    },
});

