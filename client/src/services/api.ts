import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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

export const authApi = {
  register: (data: { fullName: string; email: string; password: string; confirmPassword?: string; username?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () =>
    api.get('/auth/logout'),
  isAuth: () =>
    api.get<{ authenticated: boolean; user?: User }>('/auth/isauth'),
};

export interface SearchResult {
  blogs: BlogItem[];
  users: User[];
  topics: string[];
  pagination?: PaginationMeta;
}

export const blogApi = {
  getAll: (page = 1, limit = 10) =>
    api.get<{ blogs: BlogItem[]; pagination: PaginationMeta }>(`/blog?page=${page}&limit=${limit}`),
  getById: (id: string | number) =>
    api.get<BlogItem>(`/blog/${id}`),
  search: (query: string, tag?: string, page = 1, limit = 12) =>
    api.get<SearchResult>('/blog/search', { params: { q: query, tag, page, limit } }),
  create: (data: { title: string; subtitle?: string; content: BlogContentItem[]; tags?: string[]; author?: string | number }) =>
    api.post<{ message: string; blog: BlogItem }>('/blog/create', data),
  update: (id: string | number, data: Partial<BlogItem>) =>
    api.put(`/blog/${id}`, data),
  delete: (id: string | number) =>
    api.delete(`/blog/${id}`),
  getByUser: (userId: string | number, page = 1, limit = 10) =>
    api.get<{ blogs: BlogItem[]; pagination: PaginationMeta }>(`/blog/user/${userId}?page=${page}&limit=${limit}`),
  getSaved: (userId: string | number, page = 1, limit = 10) =>
    api.get<{ blogs: BlogItem[]; pagination: PaginationMeta }>(`/blog/saved/${userId}?page=${page}&limit=${limit}`),
  getLiked: (userId: string | number, page = 1, limit = 10) =>
    api.get<{ blogs: BlogItem[]; pagination: PaginationMeta }>(`/blog/liked/${userId}?page=${page}&limit=${limit}`),
  toggleLike: (id: string | number, userId: string | number) =>
    api.put<{ liked: boolean; likesCount: number; likes: string[] | number[] }>(`/blog/${id}/like`, { userId }),
  toggleSave: (id: string | number, userId: string | number) =>
    api.put<{ saved: boolean; savedPosts: string[] | number[] }>(`/blog/${id}/save`, { userId }),
  addComment: (id: string | number, data: { content: string; userId: string | number }) =>
    api.post<{ message: string; comment: any }>(`/blog/${id}/comment`, data),
  getComments: (id: string | number, page = 1, limit = 20) =>
    api.get<{ comments: any[]; pagination: PaginationMeta }>(`/blog/${id}/comments?page=${page}&limit=${limit}`),
  deleteComment: (blogId: string | number, commentId: string | number) =>
    api.delete(`/blog/${blogId}/comment/${commentId}`),
  uploadImage: (file: File, blogId?: string | number) =>
    s3Api.upload(file, blogId),
};

export const s3Api = {
  upload: (file: File, blogId?: string | number) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<string>('/api/s3/upload', formData, {
      params: blogId ? { blogId } : undefined,
      headers: { 'Content-Type': undefined },
    });
  },
};

export const userApi = {
  updateName: (id: string | number, name: string) =>
    api.put('/user/update-name', { id, name }),
  updateUsername: (id: string | number, username: string) =>
    api.put('/user/update-username', { id, username }),
  updateAbout: (id: string | number, about: string) =>
    api.put('/user/update-about', { id, about }),
  updateProfileVisibility: (id: string | number, visibility: 'PUBLIC' | 'PRIVATE' | string) =>
    api.put('/user/update-profile-visibility', { id, visibility }),
  updateProfilePic: (data: FormData | { id: string | number; profilePic: string }) => {
    if (data instanceof FormData) {
      return api.put('/user/update-profile-pic', data, {
        headers: { 'Content-Type': undefined },
      });
    }
    return api.put('/user/update-profile-pic', data);
  },
  updateBannerPic: (data: FormData | { id: string | number; bannerPic: string }) => {
    if (data instanceof FormData) {
      return api.put('/user/update-banner-pic', data, {
        headers: { 'Content-Type': undefined },
      });
    }
    return api.put('/user/update-banner-pic', data);
  },
  updateProfile: (id: string | number, data: Partial<User>) =>
    api.put('/user/update-profile', { id, ...data }),
  updatePassword: (id: string | number, data: { oldPassword: string; newPassword: string }) =>
    api.put('/user/update-password', { id, ...data }),
  updateSettings: (id: string | number, data: { visibility?: 'PUBLIC' | 'PRIVATE' | string; theme?: 'LIGHT' | 'DARK' | 'SYSTEM' | string }) =>
    api.put('/user/update-settings', { id, ...data }),
  deleteAccount: (id: string | number, password: string) =>
    api.delete('/user/delete-account', { data: { id, password } }),
  getProfile: (username: string | number, page = 1, limit = 10) =>
    api.get<{ user: User; blogs: BlogItem[]; pagination: PaginationMeta }>(`/user/profile/${username}?page=${page}&limit=${limit}`),
  getFollowers: (id: string | number, page = 1, limit = 20) =>
    api.get<{ followers: User[]; pagination: PaginationMeta }>(`/user/${id}/followers?page=${page}&limit=${limit}`),
  getFollowing: (id: string | number, page = 1, limit = 20) =>
    api.get<{ following: User[]; pagination: PaginationMeta }>(`/user/${id}/following?page=${page}&limit=${limit}`),
  toggleFollow: (authorId: string | number, currentUserId: string | number) =>
    api.put<{ following: boolean; followersCount: number; followingCount: number }>(`/user/follow/${authorId}`, { currentUserId }),
};


export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}


export interface NotificationItem {
  id: string | number;
  _id?: string | number;
  recipient: string | number;
  sender: {
    id?: string | number;
    _id?: string | number;
    fullName: string;
    username: string;
    profilePic?: string;
  };
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'STORY' | string;
  blog?: {
    id: string | number;
    _id?: string | number;
    title: string;
  };
  comment?: {
    id?: string | number;
    _id?: string | number;
    content?: string;
  } | string;
  message?: string;
  read: boolean;
  isRead?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const notificationApi = {
  getAll: (userId?: string | number) =>
    userId != null ? api.get<{ notifications: NotificationItem[] }>(`/notification/${userId}`) : api.get<{ notifications: NotificationItem[] }>('/notification'),
  getUnreadCount: (userId?: string | number) =>
    userId != null ? api.get<{ unreadCount: number }>(`/notification/unread-count/${userId}`) : api.get<{ unreadCount: number }>('/notification/unread-count'),
  markAsRead: (id: string | number) =>
    api.put<{ message: string; notification: NotificationItem }>(`/notification/read/${id}`),
  markAllAsRead: (userId?: string | number) =>
    userId != null ? api.put<{ message: string }>(`/notification/read-all/${userId}`) : api.put<{ message: string }>('/notification/read-all'),
  delete: (id: string | number) =>
    api.delete<{ message: string }>(`/notification/${id}`),
  clearAll: (userId?: string | number) =>
    userId != null ? api.delete<{ message: string }>(`/notification/clear-all/${userId}`) : api.delete<{ message: string }>('/notification/clear-all'),
};


