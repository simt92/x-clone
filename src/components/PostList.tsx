"use client";

import { useEffect, useState } from "react";
import PostComposer from "@/components/PostComposer";
import PostItem from "@/components/PostItem";
import type { Post } from "@/types/post";
import { useRouter } from "next/navigation";

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
    const [feed, setFeed] = useState<"recommended" | "following">("recommended");
    const [posts, setPosts] = useState<Post[]>(
        initialPosts ?? []
    );

    const router = useRouter();

    useEffect(() => {
        if (initialPosts !== undefined) {
            return;
        }

        const fetchPosts = async () => {
            const response = await fetch(`/api/posts?feed=${feed}`);

            if (!response.ok) {
                return;
            }

            const data: Post[] = await response.json();

            setPosts(data);
        };

        fetchPosts();
    }, [initialPosts, feed]);

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

    const handleFollowingFeed = () => {
        if (currentUserId === null) {
            router.push(
                `/login?callbackUrl=${encodeURIComponent("/")}`
            );

            return;
        }

        setFeed("following");
    };

    return (
        <>
            {initialPosts === undefined && (
                <div>
                    <button onClick={() => setFeed("recommended")}>
                        おすすめ
                    </button>

                    <button onClick={handleFollowingFeed}>
                        フォロー中
                    </button>
                </div>
            )}

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