import { initTRPC } from '@trpc/server';

export const t = initTRPC.create();
export const publicProcedure = t.procedure;
export const router = t.router;


