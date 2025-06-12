import { publicProcedure, router } from "../trpc";
import { z } from "zod";

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


