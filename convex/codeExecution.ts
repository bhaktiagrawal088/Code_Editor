import { ConvexError } from "convex/values";
import { mutation } from "./_generated/server";
import {v} from "convex/values"

export const saveExecution = mutation({
    args:{
        language : v.string(),
        code : v.string(),
        // we could have either one of them, or both of the same time
        output : v.optional(v.string()),
        error : v.optional(v.string())

    },
    handler: async (ctx,args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) throw new ConvexError("Not Authenticated");


        // check pro status
        const user = await ctx.db
        .query("users")
        .withIndex("by_user_id")
        .filter((q)=>q.eq(q.field("userId"),identity.subject))
        .first();


        if (!user) {
            throw new ConvexError("User not found. Please log in.");
        }

        const allowedLanguages = ["javascript", "typescript", "cpp", "python", "java"];
        if (!user?.isPro && !allowedLanguages.includes(args.language)) {
                throw new ConvexError("Pro subscription is required to use this language.");
        }

        await ctx.db.insert("codeExecution",{
            ...args,
            userId : identity.subject
        });

    },

})