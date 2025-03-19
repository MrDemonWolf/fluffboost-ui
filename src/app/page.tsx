import { SignedIn, SignedOut } from "@clerk/nextjs";

import { api, HydrateClient } from "~/trpc/server";
import { Guild } from "./_components/Guild";

export default async function Home() {
  void api.guild.getAll.prefetch();

  return (
    <HydrateClient>
      <SignedOut>
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Welcome to Fluffboost UI 🚀
        </h1>
      </SignedOut>
      <SignedIn>
        <Guild />
      </SignedIn>
    </HydrateClient>
  );
}
