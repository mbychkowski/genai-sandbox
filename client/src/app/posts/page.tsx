import { getClient } from '@/lib/apolloClient';
import { TypedDocumentNode, gql } from '@apollo/client';
import { QueryResolvers } from '@/__generated__/types';

const GET_POSTS = gql`
  query GET_POSTS {
    allUsers {
      posts {
        content
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
  const data: any = await getClient().query({
    query: GET_POSTS,
  });

  return (
    <div>
      <p>Getting data...</p>
      {data.data.allUsers.map((user: any, index: number) => (
        <p key={index}>{user.email}</p>
      ))}
    </div>
  );
}
