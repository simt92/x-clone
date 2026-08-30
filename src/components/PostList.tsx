"use client";

import { useEffect, useState } from "react";
import PostComposer from "@/components/PostComposer";
import PostItem from "@/components/PostItem";
import type { Post } from "@/types/post";

type Props = {
    initialPosts?: Post[];
    currentUserId: number | null;
    showComposer?: boolean;
};

export default function PostList({
    initialPosts,
    currentUserId,
    showComposer = false,
}: Props) {
    const [posts, setPosts] = useState<Post[]>(
        initialPosts ?? []
    );

    useEffect(() => {
        if (initialPosts !== undefined) {
            return;
        }

        const fetchPosts = async () => {
            const response = await fetch("/api/posts");

            if (!response.ok) {
                return;
            }

            const data: Post[] = await response.json();

            setPosts(data);
        };

        fetchPosts();
    }, [initialPosts]);

    const handleCreate = (newPost: Post) => {
        setPosts((currentPosts) => [
            newPost,
            ...currentPosts,
        ]);
    };

    const handleDelete = async (postId: number) => {
        const response = await fetch(
            `/api/posts/${postId}`,
            {
                method: "DELETE",
            }
        );

        if (!response.ok) {
            return;
        }

        setPosts((currentPosts) =>
            currentPosts.filter(
                (post) => post.id !== postId
            )
        );
    };

    return (
        <>
            {showComposer && currentUserId && (
                <PostComposer onCreate={handleCreate} />
            )}

            {posts.map((post) => (
                <PostItem
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId}
                    onDelete={handleDelete}
                />
            ))}
        </>
    );
}