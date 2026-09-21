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

    replyTo: {
        id: number;

        author: {
            id: number;
            username: string;
            name: string;
        };
    } | null;

    _count: {
        likes: number;
        replies: number;
    };

    likes: Like[];

    bookmarks: Bookmark[];
};

export type Like = {
    id: number;
    userId: number;
    postId: number;
};

export type Bookmark = {
    id: number;
    userId: number;
    postId: number;
};