import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LikeButton from "@/components/LikeButton";
import ReplyComposer from "@/components/ReplyComposer";
import PostItem from "@/components/PostItem";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function PostDetail({ params }: Props) {
    const session = await auth();

    const currentUserId = session?.user?.id
        ? Number(session.user.id)
        : null;

    const { id } = await params;

    const post = await prisma.post.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                },
            },

            _count: {
                select: {
                    likes: true,
                },
            },

            likes: currentUserId
                ? {
                    where: {
                        userId: currentUserId,
                    },
                }
                : false,

            replies: {
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                        },
                    },

                    _count: {
                        select: {
                            likes: true,
                        },
                    },

                    likes: currentUserId
                        ? {
                            where: {
                                userId: currentUserId
                            },
                        }
                        : false,
                },

                orderBy: {
                    createdAt: "asc",
                },
            },
        },
    });

    if (!post) {
        notFound();
    }

    return (
        <main>
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

                <p>{post.content}</p>

                <LikeButton
                    postId={post.id}
                    initialIsLiked={(post.likes?.length ?? 0) > 0}
                    initialLikeCount={post._count.likes}
                />
            </article>

            <ReplyComposer
                replyToId={post.id}
            />

            <section>
                <h2>返信</h2>

                {post.replies.length === 0 ? (
                    <p>まだ返信はありません</p>
                ) : (
                    post.replies.map((reply) => (
                        <PostItem
                            key={reply.id}
                            post={reply}
                            currentUserId={currentUserId}
                        />
                    ))
                )}
            </section>        </main>
    );
}