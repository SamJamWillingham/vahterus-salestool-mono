import NextError from 'next/error';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from '~/pages/_app';
import { RouterOutput, trpc } from '~/utils/trpc';

type PostByIdOutput = RouterOutput['offer']['byId'];

function PostItem(props: { offer: PostByIdOutput }) {
  const { offer } = props;
  return (
    <>
      <h1>{offer.offerId}</h1>
      <em>Created {offer.createdAt.toLocaleDateString('en-us')}</em>

      <p>{offer.responsiblePerson}</p>

      <h2>Raw data:</h2>
      <pre>{JSON.stringify(offer, null, 4)}</pre>
    </>
  );
}

const PostViewPage: NextPageWithLayout = () => {
  const id = useRouter().query.id as string;
  const offerQuery = trpc.offer.byId.useQuery({ id });

  if (offerQuery.error) {
    return (
      <NextError
        title={offerQuery.error.message}
        statusCode={offerQuery.error.data?.httpStatus ?? 500}
      />
    );
  }

  if (offerQuery.status !== 'success') {
    return <>Loading...</>;
  }
  const { data } = offerQuery;
  return <PostItem offer={data} />;
};

export default PostViewPage;
