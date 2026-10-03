import { Request, Response } from 'express';
import * as postService from '../services/post.service';

export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const authorId = (req as any).user.userId;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ error: { message: 'Content is required' } });
      return;
    }

    const post = await postService.createPost(authorId, content);
    res.status(201).json(post);
  } catch (error) {
    console.error('[Create Post Error]:', error);
    res.status(500).json({ error: { message: 'Failed to create post' } });
  }
};

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await postService.getPosts();
    res.status(200).json(posts);
  } catch (error) {
    console.error('[Get Posts Error]:', error);
    res.status(500).json({ error: { message: 'Failed to fetch posts' } });
  }
};
