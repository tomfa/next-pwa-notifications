import * as webpush from "web-push";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { env } from "@/env";

export const notificationRouter = createTRPCRouter({
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
