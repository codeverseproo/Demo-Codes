import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import cors from "cors";
import { router } from "./trpc"; // Changed from ../trpc to ./trpc
import { userRouter } from "./router/user";

const appRouter = router({
  user: userRouter,
});

export type AppRouter = typeof appRouter;

const app = express();
app.use(cors());

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
);

app.listen(3000, () => {
  console.log("tRPC server listening on http://localhost:3000");
});


