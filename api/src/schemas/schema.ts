import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeResolvers } from '@graphql-tools/merge';
import Typedef from './schema.graphql';
import { resolvers as postResolvers, typeDefs as Post } from './post';
import { resolvers as userResolvers, typeDefs as User } from './user';

export const schema = makeExecutableSchema({
  typeDefs: [Typedef, User, Post],
  resolvers: mergeResolvers([userResolvers, postResolvers]),
});
