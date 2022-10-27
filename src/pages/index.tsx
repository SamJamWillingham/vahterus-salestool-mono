import { trpc } from '../utils/trpc';
import { NextPageWithLayout } from './_app';
import { inferProcedureInput } from '@trpc/server';
import Link from 'next/link';
import { Fragment } from 'react';
import type { AppRouter } from '~/server/routers/_app';

const IndexPage: NextPageWithLayout = () => {
  const utils = trpc.useContext();
  const offerQuery = trpc.offer.list.useInfiniteQuery(
    {
      limit: 5,
    },
    {
      getPreviousPageParam(lastPage) {
        return lastPage.nextCursor;
      },
    },
  );

  const addOffer = trpc.offer.add.useMutation({
    async onSuccess() {
      // refetches posts after an offer is added
      await utils.offer.list.invalidate();
    },
  });

  // prefetch all posts for instant navigation
  // useEffect(() => {
  //   const allPosts = postsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  //   for (const { id } of allPosts) {
  //     void utils.offer.byId.prefetch({ id });
  //   }
  // }, [postsQuery.data, utils]);

  return (
    <>
      <h1>Vahterus Salestool with NextJS + Prisma + tRPC</h1>

      <h2>
        Latest Offer
        {offerQuery.status === 'loading' && '(loading)'}
      </h2>

      <button
        onClick={() => offerQuery.fetchPreviousPage()}
        disabled={
          !offerQuery.hasPreviousPage || offerQuery.isFetchingPreviousPage
        }
      >
        {offerQuery.isFetchingPreviousPage
          ? 'Loading more...'
          : offerQuery.hasPreviousPage
          ? 'Load More'
          : 'Nothing more to load'}
      </button>

      {offerQuery.data?.pages.map((page: { items: any[] }, index: any) => (
        <Fragment key={page.items[0]?.id || index}>
          {page.items.map((item) => (
            <article key={item.id}>
              <h3>{item.offerId}</h3>
              <Link href={`/offer/${item.id}`}>
                <a>View more</a>
              </Link>
            </article>
          ))}
        </Fragment>
      ))}

      <hr />

      <h3>Add an Offer</h3>

      <form
        onSubmit={async (e) => {
          /**
           * In a real app you probably don't want to use this manually
           * Checkout React Hook Form - it works great with tRPC
           * @see https://react-hook-form.com/
           * @see https://kitchen-sink.trpc.io/react-hook-form
           */
          e.preventDefault();
          const $form = e.currentTarget;
          const values = Object.fromEntries(new FormData($form));
          type Input = inferProcedureInput<AppRouter['offer']['add']>;
          //    ^?
          const input: Input = {
            offerId: values.offerId as string,
            responsiblePerson: values.responsiblePerson as string,
          };
          try {
            await addOffer.mutateAsync(input);

            $form.reset();
          } catch (cause) {
            console.error({ cause }, 'Failed to add offer');
          }
        }}
      >
        <label htmlFor="offerId">OfferId:</label>
        <br />
        <input
          id="offerId"
          name="offerId"
          type="text"
          disabled={addOffer.isLoading}
        />

        <br />
        <label htmlFor="responsiblePerson">responsible person:</label>
        <br />
        <input
          id="responsiblePerson"
          name="responsiblePerson"
          disabled={addOffer.isLoading}
        />
        <br />
        <input type="submit" disabled={addOffer.isLoading} />
        {addOffer.error && (
          <p style={{ color: 'red' }}>{addOffer.error.message}</p>
        )}
      </form>
    </>
  );
};

export default IndexPage;
