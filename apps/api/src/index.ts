import 'graphql-import-node';
import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { schema } from './schemas/schema';
import { context } from './context';

// Create a Yoga instance with a GraphQL schema.
const yoga = createYoga({ graphqlEndpoint: '/gql', context, schema });

// Pass it into a server to hook into request handlers.
const server = createServer(yoga);

// Start the server and you're done!
server.listen(4000, () => {
  console.log(`\
    🚀  Server is running on http://localhost:4000/gql
  `);
});
