/**
 * This file contains the root router of your tRPC-backend
 */
import { publicProcedure, router } from '../trpc';
import { offerRouter } from './offer';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),

  offer: offerRouter,
});

export type AppRouter = typeof appRouter;
