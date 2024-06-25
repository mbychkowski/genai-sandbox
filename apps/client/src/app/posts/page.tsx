import { getClient } from '@/lib/apolloClient';
import { TypedDocumentNode, gql } from '@apollo/client';
import { Maybe, Query, User } from '@/__generated__/types';

const GET_POSTS: TypedDocumentNode<Query> = gql`
  query GET_POSTS {
    allUsers {
      posts {
        title
        author {
          id
        }
        id
      }
      email
      id
    }
  }
`;

export default async function Page() {
  const { data } = await getClient().query({
    query: GET_POSTS,
  });

  return (
    <>
      {data.allUsers?.map((user: Maybe<User>, index: number) => (
        <div key={index}>
          <p>{user?.email}</p>
          <p>{user?.posts[0]?.title}</p>
        </div>
      ))}
    </>
  );
}
