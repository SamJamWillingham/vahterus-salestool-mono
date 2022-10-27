/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { router, publicProcedure } from '../trpc';
import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '~/server/prisma';

/**
 * Default selector for Offer.
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 */
const defaultOfferSelect = Prisma.validator<Prisma.OfferSelect>()({
  id: true,
  offerId: true,
  responsiblePerson: true,
  createdAt: true,
  lastEditedAt: true,
});

export const offerRouter = router({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ input }) => {
      /**
       * For pagination docs you can have a look here
       * @see https://trpc.io/docs/useInfiniteQuery
       * @see https://www.prisma.io/docs/concepts/components/prisma-client/pagination
       */

      const limit = input.limit ?? 50;
      const { cursor } = input;

      const items = await prisma.offer.findMany({
        select: defaultOfferSelect,
        take: limit + 1,
        where: {},
        cursor: cursor
          ? {
              id: cursor,
            }
          : undefined,
        orderBy: {
          createdAt: 'desc',
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        // Remove the last item and use it as next cursor

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const nextItem = items.pop()!;
        nextCursor = nextItem.id;
      }

      return {
        items: items.reverse(),
        nextCursor,
      };
    }),
  byId: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { id } = input;
      const offer = await prisma.offer.findUnique({
        where: { id },
        select: defaultOfferSelect,
      });
      if (!offer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No offer with id '${id}'`,
        });
      }
      return offer;
    }),
  add: publicProcedure
    .input(
      z.object({
        id: z.string().uuid().optional(),
        offerId: z.string().min(1).max(32),
        responsiblePerson: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const offer = await prisma.offer.create({
        data: input,
        select: defaultOfferSelect,
      });
      return offer;
    }),
});
