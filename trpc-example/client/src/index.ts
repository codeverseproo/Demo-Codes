import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../server/src"; // Adjust path as needed
import fetch from "node-fetch";

// Polyfill fetch for Node.js environment
// @ts-ignore
global.fetch = fetch;

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
    }),
  ],
});

async function main() {
  try {
    console.log("\n--- Fetching user by ID ---");
    const user = await trpc.user.getById.query({ id: "123" });
    console.log("Fetched user:", user);

    console.log("\n--- Creating a new user ---");
    const newUser = await trpc.user.create.mutate({
      name: "John Doe",
      email: "john.doe@example.com",
    });
    console.log("Created new user:", newUser);

    // Example of a type error (uncomment to see TypeScript error)
    // await trpc.user.getById.query({ userId: 456 });

    // Example of accessing a non-existent property (uncomment to see TypeScript error)
    // console.log(user.nonExistentProperty);

  } catch (error) {
    console.error("Error:", error);
  }
}

main();


