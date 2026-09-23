"use client"

import Link from "next/link";
import type { Post } from "@/types/post";
import LikeButton from "@/components/LikeButton";
import BookmarkButton from "./BookmarkButton";
import RepostButton from "./RepostButton";
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
        <article className="post">
            <Link
                href={`/users/${post.author.username}`}
                className="post-author"
            >
                <span className="post-author-name">
                    {post.author.name}
                </span>

                <span className="post-username">
                    @{post.author.username}
                </span>
            </Link>

            {post.replyTo && (
                <p className="reply-label">
                    <Link href={`/users/${post.replyTo.author.username}`}>
                        @{post.replyTo.author.username}
                    </Link>
                    さんへの返信
                </p>
            )}

            <Link href={`/posts/${post.id}`}>
                <p className="post-content">
                    {post.content}
                </p>
            </Link>

            {post.image && (
                <img
                    className="post-image"
                    src={post.image}
                    alt="投稿画像"
                />
            )}

            <div className="post-actions">
                <LikeButton
                    postId={post.id}
                    initialIsLiked={(post.likes?.length ?? 0) > 0}
                    initialLikeCount={post._count.likes}
                />

                <Link href={`/posts/${post.id}`}>
                    💬 返信 {post._count.replies}
                </Link>

                <RepostButton
                    postId={post.id}
                    initialIsReposted={(post.reposts?.length ?? 0) > 0}
                    initialRepostCount={post._count.reposts}
                />

                <BookmarkButton
                    postId={post.id}
                    initialIsBookmarked={(post.bookmarks?.length ?? 0) > 0}
                />
            </div>

            {isOwnPost && (
                <button
                    onClick={handleDelete}
                    className="delete-button"
                >
                    削除
                </button>
            )}
        </article>
    );
}