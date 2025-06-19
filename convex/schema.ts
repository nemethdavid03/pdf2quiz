import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable(
        v.object({
            clerkId: v.string(),
            credits: v.number(),
            lastCreditGrantDate: v.string(),
        })
    ).index("by_clerkId", ["clerkId"]),

    payments: defineTable(
        v.object({
            clerkId: v.string(),
            sessionId: v.string(),
            createdAt: v.string(),
        })
    ).index("by_sessionId", ["sessionId"]),
});
