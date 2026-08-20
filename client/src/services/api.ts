import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id?: string | number;
  _id?: string | number;
  fullName: string;
  email: string;
  username: string;
  about?: string;
  headline?: string;
  location?: string;
  website?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
  profilePic?: string;
  bannerPic?: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
  theme?: 'LIGHT' | 'DARK' | 'SYSTEM';
  topics?: string[];
  following?: string[];
  followers?: string[];
  blogs?: string[];
  savedPosts?: string[];
  likedPosts?: string[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface BlogContentItem {
  type: string;
  content: string;
  caption?: string;
}

export interface BlogItem {
  id: string | number;
  _id?: string | number;
  title: string;
  subtitle?: string;
  content: BlogContentItem[];
  tags?: string[];
  author: {
    id: string | number;
    _id?: string | number;
    fullName?: string;
    name?: string;
    username?: string;
    email?: string;
    profilePic?: string;
  } | string;
  likes?: string[] | number[];
  comments?: any[];
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}
