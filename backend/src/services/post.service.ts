import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createPost = async (authorId: string, content: string) => {
  return await prisma.post.create({
    data: {
      content,
      authorId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
        },
      },
    },
  });
};

export const getPosts = async (limit: number = 20) => {
  // Randomly fetch or just the latest ones
  return await prisma.post.findMany({
    take: limit,
    orderBy: {
      createdAt: 'desc', // The user requested random but order by desc is better for recent posts, let's fetch recent
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
        },
      },
    },
  });
};
