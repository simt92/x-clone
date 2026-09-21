"use client"

import Link from "next/link";
import type { Post } from "@/types/post";
import LikeButton from "@/components/LikeButton";
import BookmarkButton from "./BookmarkButton";
import { usePathname, useRouter } from "next/navigation";

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

    const pathname = usePathname();

    const isBookmarksPage = pathname === "/bookmarks";

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

            {post.replyTo && (
                <p>
                    <Link href={`/users/${post.replyTo.author.username}`}>
                        @{post.replyTo.author.username}
                    </Link>
                    さんへの返信
                </p>
            )}

            <Link href={`/posts/${post.id}`}>
                <p>{post.content}</p>
            </Link>

            <LikeButton
                postId={post.id}
                initialIsLiked={(post.likes?.length ?? 0) > 0}
                initialLikeCount={post._count.likes}
            />

            <Link href={`/posts/${post.id}`}>
                💬 返信 {post._count.replies}
            </Link>

            <BookmarkButton
                postId={post.id}
                initialIsBookmarked={(post.bookmarks?.length ?? 0) > 0}
                refreshAfterChage={isBookmarksPage}
            />

            {isOwnPost && (
                <button onClick={handleDelete}>
                    削除
                </button>
            )}
        </article>
    );
}