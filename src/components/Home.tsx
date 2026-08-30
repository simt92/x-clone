"use client";

import { useEffect, useState } from "react";
import PostList from "@/components/PostList";
import PostComposer from "@/components/PostComposer";
import type { Post } from "@/types/post";

type Props = {
    currentUserId: number | null;
};

export default function Home({
    currentUserId,
}: Props) {
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        const fetchPosts = async () => {
            const response = await fetch("/api/posts");

            if(!response.ok) {
                return;
            }

            const data: Post[] = await response.json();

            setPosts(data);
        };

        fetchPosts();
        
    }, []);

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
        <main>
            {currentUserId && (
                <PostComposer
                    onCreate={handleCreate}
                />
            )}

            <PostList
                posts={posts}
                currentUserId={currentUserId}
                onDelete={handleDelete}
            />
        </main>
    );
}