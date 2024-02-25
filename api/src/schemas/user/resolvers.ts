import { User } from '@prisma/client';
import { Context } from '../../context';
import { QueryUserByIdArgs } from '../../__generated__/types';

const resolvers = {
  Query: {
    async allUsers(_: any, __: any, { prisma }: Context) {
      const allUsers = await prisma.user.findMany();

      return allUsers;
    },
    async userById(
      _: any,
      args: QueryUserByIdArgs,
      { prisma }: Context
    ) {
      return await prisma.user.findUnique({
        where: { id: args.id || undefined },
      });
    },
  },
  User: {
    async posts(parent: User, __: any, { prisma }: Context) {
      return await prisma.user
        .findUnique({
          where: { id: parent?.id },
        })
        .posts();
    },
  },
};

export default resolvers;
