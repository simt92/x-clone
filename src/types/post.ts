export type Post = {
    id: number;
    content: string;
    createdAt: string | Date;
    authorId: number;

    author: {
        id: number;
        username: string;
        name: string;
    };

    _count: {
        likes: number;
    };

    likes: Like[];
};

export type Like = {
    id: number;
    userId: number;
    postId: number;
};