import api from './api';

export interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    profilePhoto: string | null;
  };
}

export async function createPost(content: string): Promise<Post> {
  const response = await api.post('/posts', { content });
  return response.data;
}

export async function getPosts(): Promise<Post[]> {
  const response = await api.get('/posts');
  return response.data;
}
