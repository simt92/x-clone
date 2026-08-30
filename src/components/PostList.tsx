"use client"

import { useState } from "react";
import PostItem from "@/components/PostItem";
import type { Post } from "@/types/post";

type Props = {
    initialPosts: Post[];
    currentUserId: number | null;
};

export default function PostList({
    initialPosts,
    currentUserId,
}: Props) {
    const [posts, setPosts] = useState(initialPosts);

    const handleDelete = async (postId: number) => {
        const response = await fetch(`/api/posts/${postId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            return;
        }

        setPosts((currentPosts) =>
            currentPosts.filter((post) => post.id !== postId)
        );
    };

    return (
        <>
            {posts.map((post) => {
                <PostItem
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId}
                    onDelete={handleDelete}
                />
            })}
        </>
    );
}