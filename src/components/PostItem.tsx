"use client"

import Link from "next/link";
import type { Post } from "@/types/post";
import LikeButton from "@/components/LikeButton";
import { useRouter } from "next/navigation";

type Props = {
    post: Post;
    currentUserId: number | null;
};

export default function PostItem({
    post,
    currentUserId,
}: Props) {
    const isOwnPost = currentUserId === post.authorId;

    const router = useRouter();

    const handleDelete = async () => {
        const response = await fetch(
            `/api/posts/${post.id}`,
            {
                method: "DELETE",
            }
        );

        if (!response.ok) {
            return;
        }

        router.refresh();
    };

    return (
        <article>
            <Link
                href={`/users/${post.author.username}`}
            >
                <strong>
                    {post.author.name}
                </strong>

                <span>
                    @{post.author.username}
                </span>
            </Link>

            <Link href={`/posts/${post.id}`}>
                <p>{post.content}</p>
            </Link>

            <LikeButton
                postId={post.id}
                initialIsLiked={(post.likes?.length ?? 0) > 0}
                initialLikeCount={post._count.likes}
            />

            {isOwnPost && (
                <button onClick={handleDelete}>
                    削除
                </button>
            )}
        </article>
    );
}