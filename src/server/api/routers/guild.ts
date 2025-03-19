import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

import { env } from "~/env";

const DISCORD_API_BASE = "https://discord.com/api/v10";

// Discord API response interfaces
interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  owner_id: string;
  owner?: boolean;
  features: string[];
  approximate_member_count?: number;
  approximate_presence_count?: number;
  verification_level: number;
}

export const guildRouter = createTRPCRouter({
  count: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ ctx }) => {
      return {
        greeting: `Hello ${ctx.auth.userId}!`,
      };
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      const guilds = await ctx.db.guild.findMany({
        orderBy: {
          joinedAt: "desc",
        },
        take: 1,
      });

      if (guilds.length === 0) {
        return null;
      }

      const guildDataPromises = guilds.map(async (guild) => {
        const response = await fetch(
          `${DISCORD_API_BASE}/guilds/${guild.guildId}`,
          {
            headers: {
              "User-Agent": `DiscordBot (1.0)`,
              Authorization: `Bot ${env.DISCORD_APPLICATION_BOT_TOKEN}`,
              "Content-Type": "application/json",
            },
          },
        );
        console.log("response", response);
        if (!response.ok) {
          console.error(
            `Failed to fetch guild ${guild.guildId}: ${response.status}`,
          );
          return null;
        }

        return response.json() as Promise<DiscordGuild>;
      });

      const results = await Promise.all(guildDataPromises);

      return results
        .filter((guild): guild is DiscordGuild => Boolean(guild))
        .map((guild) => ({
          id: guild.id,
          name: guild.name,
          icon: guild.icon,
          iconUrl: guild.icon
            ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
            : null,
          memberCount: guild.approximate_member_count,
          onlineCount: guild.approximate_presence_count,
          description: guild.description || null,
          features: guild.features,
          verificationLevel: guild.verification_level,
          ownerId: guild.owner_id,
          owner: guild.owner,
        }));
    } catch (error) {
      console.error("Error fetching guilds in batch:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch guild information",
        cause: error,
      });
    }
  }),
});
