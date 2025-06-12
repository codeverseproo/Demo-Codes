# tRPC Example

This repository contains a simple example of a full-stack application using tRPC, demonstrating end-to-end type safety between the client and server.

## Project Structure

- `server/`: Contains the tRPC server implementation.
- `client/`: Contains a Node.js client that interacts with the tRPC server.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (or yarn/pnpm)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd trpc-example
    ```

2.  **Install server dependencies:**

    ```bash
    cd server
    npm install
    cd ..
    ```

3.  **Install client dependencies:**

    ```bash
    cd client
    npm install
    cd ..
    ```

### Running the Application

1.  **Start the tRPC server:**

    Open a new terminal, navigate to the `server` directory, and run:

    ```bash
    cd server
    npm run dev
    ```

    You should see a message indicating the server is listening on `http://localhost:3000`.

2.  **Run the tRPC client:**

    Open another terminal, navigate to the `client` directory, and run:

    ```bash
    cd client
    npm start
    ```

    The client will execute a `getById` query and a `create` mutation, logging the results to the console.

## Code Examples

### Server-side (`server/src/router/user.ts`)

Defines a `userRouter` with `getById` (query) and `create` (mutation) procedures. Input validation is handled using `zod`.

```typescript
// server/src/router/user.ts
import { publicProcedure, router } from "../trpc";
import { z } from "zod"; // For input validation

export const userRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // In a real app, this would fetch from a database
      const user = { id: input.id, name: `User ${input.id}`, email: `${input.id}@example.com` };
      return user;
    }),

  create: publicProcedure
    .input(z.object({ name: z.string(), email: z.string().email() }))
    .mutation(async ({ input }) => {
      // In a real app, this would save to a database
      const newUser = { id: `user-${Date.now()}`, name: input.name, email: input.email };
      return newUser;
    }),
});

export type AppRouter = typeof userRouter;
```

### Client-side (`client/src/index.ts`)

Demonstrates how to consume the tRPC API from the client, leveraging type inference for autocomplete and compile-time error checking.

```typescript
// client/src/index.ts
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
```

## Benefits Demonstrated

-   **End-to-End Type Safety:** Changes in server-side procedure definitions are immediately reflected as type errors on the client, preventing runtime bugs.
-   **Autocomplete and DX:** The client automatically infers types, providing excellent developer experience with autocomplete and compile-time validation.
-   **Minimal Boilerplate:** No code generation or separate schema definitions are required.

Feel free to explore the code and experiment with introducing type mismatches to see tRPC's error-catching capabilities in action!

