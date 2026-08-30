"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PostItem from "@/components/PostItem";
import PostComposer from "@/components/PostComposer";
import type { Like, Post } from "@/types/post";

type Props = {
    currentUserId: number | null;
};

export default function Home({ currentUserId }: Props) {
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        const fetchPosts = async () => {
            const response = await fetch("/api/posts");
            const data: Post[] = await response.json();

            setPosts(data);
        };

        fetchPosts();
    }, []);

    const handlePost = async (content: string) => {
        const response = await fetch("/api/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: content,
            }),
        });

        const newPost: Post = await response.json();

        setPosts([newPost, ...posts]);
    };

    const handleDelete = async (id: number) => {
        const response = await fetch(`/api/posts/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            console.error("削除に失敗しました");
            return;
        }

        const newPosts = posts.filter((post) => post.id !== id);

        setPosts(newPosts);
    };

    return (
        <main>
            <h1>HOME</h1>

            {currentUserId ? (
                <PostComposer onPost={handlePost} />
            ) : (
                <div>
                    <p>投稿するにはログインしてください</p>

                    <Link href="/login">
                        ログイン
                    </Link>
                </div>
            )}

            {posts.map((post) => (
                <PostItem
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId}
                    onDelete={() => handleDelete(post.id)}
                />
            ))}
        </main>
    );
}