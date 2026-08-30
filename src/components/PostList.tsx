"use client";

import PostItem from "@/components/PostItem";
import type { Post } from "@/types/post";

type Props = {
    posts: Post[];
    currentUserId: number | null;
    onDelete: (postId: number) => void;
};

export default function PostList({
    posts,
    currentUserId,
    onDelete,
}: Props) {
    return (
        <>
            {posts.map((post) => (
                <PostItem
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId}
                    onDelete={onDelete}
                />
            ))}
        </>
    );
}