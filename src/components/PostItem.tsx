import Link from "next/link";
import type { Post } from "@/types/post";
import LikeButton from "@/components/LikeButton";

type Props = {
    post: Post;
    currentUserId: number | null;
    onDelete: (postId: number) => void;
};

export default function PostItem({
    post,
    currentUserId,
    onDelete,
}: Props) {
    const isOwnPost = currentUserId === post.authorId;

    return (
        <div>
            <Link href={`/users/${post.author.username}`}>
                <p>{post.author.username}</p>
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
                <button onClick={() => onDelete(post.id)}>
                    削除
                </button>
            )}
        </div>
    );
}