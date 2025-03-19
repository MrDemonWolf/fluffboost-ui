"use client";

import { api } from "~/trpc/react";

export function Guild() {
  const [guilds] = api.guild.getAll.useSuspenseQuery();

  let id = 0;
  return (
    <div className="w-full max-w-xs">
      {guilds ? (
        <div className="flex flex-col gap-4">
          {guilds.map((guild) => (
            <div
              key={guild.id}
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
            >
              <h3 className="text-2xl font-bold">
                {(id += 1)}. {guild.id}
              </h3>
              <div className="text-lg">{guild.name}</div>
            </div>
          ))}
        </div>
      ) : (
        <p>You have no posts yet.</p>
      )}
    </div>
  );
}
