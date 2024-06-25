import { Post } from '@prisma/client';
import { QueryPostByIdArgs } from '../../__generated__/types';
import { Context } from '../../context';

const resolvers = {
  Query: {
    async postById(
      _: any,
      args: QueryPostByIdArgs,
      { prisma }: Context
    ) {
      return await prisma.post.findUnique({
        where: { id: args.id || undefined },
      });
    },
  },
  Post: {
    async author(parent: Post, __: any, { prisma }: Context) {
      return await prisma.post
        .findUnique({
          where: { id: parent?.id },
        })
        .author();
    },
  },
};

export default resolvers;
