export interface User {
    id: string;
    name: string;
    username: string;
    email?: string;
    avatar?: string;
    bio?: string;
    role: 'USER' | 'AUTHOR' | 'ADMIN';
    isFollowing?: boolean;
    createdAt: string;
    _count?: {
        posts: number;
        followers: number;
        following: number;
    };
} 

export interface Post {
    id: string;
    title: string;
    slug: string;
    content: string;
    thumbnail?: string;
    published: boolean;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
    author: Pick<User, 'id' | 'name' | 'username' | 'avatar'>;
    tags: Tag[];
    _count?: {
        likes: number;
        comments: number;
    };
}

export interface Tag {
    id: string;
    name: string;
    slug: string;
}

export interface Comment {
    id: string;
    content: string;
    createdAt: string;
    author: Pick<User, 'id' | 'name' | 'username' | 'avatar'>;
    replies?: Comment[];
}

export interface Notification {
    id: string;
    type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'REPLY';
    message: string;
    refId: string;
    isRead: boolean;
    createdAt: string;
}

export interface PaginatedResponse<T> {
    data: {
        posts: T[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
};

export interface ApiResponse<T> {
    status: 'success' | 'error';
    message: string;
    data: T;
}