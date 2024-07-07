import * as webpush from 'web-push';
import { z } from "zod";

import { publicProcedure, router } from './trpc';
import { env } from "@/env";

const appRouter = router({
  push: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string(),
        permission: z.object({
          endpoint: z.string().url(),
          keys: z.object({
            auth: z.string(),
            p256dh: z.string(),
          }),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      webpush.setVapidDetails(
        "mailto:hi@6040.work",
        env.NEXT_PUBLIC_PUSH_API_KEY,
        env.PRIVATE_PUSH_API_KEY,
      );

      const response = await webpush.sendNotification(
        input.permission,
        JSON.stringify({ title: input.title, body: input.description }),
      );
      console.log("SENDNOTIFICATION RESPONSE", response);
      return { success: true, response };
    }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = appRouter.createCaller;

