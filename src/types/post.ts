export type Post = {
    id: number;
    content: string;
    createdAt: string | Date;
    image: string | null;
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
        reposts: number;
    };

    likes: Like[];
    bookmarks: Bookmark[];
    reposts: Repost[];
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

export type Repost = {
    id: number;
    userId: number;
    postId: number;
    createdAt: string | Date;
};

export type TimelineItem =
    | {
        type: "post";
        post: Post;
        createdAt: string | Date;
    }
    | {
        type: "repost";
        post: Post;

        repostedBy: {
            id: number;
            username: string;
            name: string;
        };

        createdAt: string | Date;
    };