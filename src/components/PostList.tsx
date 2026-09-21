import { prisma } from "@/lib/prisma";
import PostComposer from "@/components/PostComposer";
import PostItem from "@/components/PostItem";
import type { Post } from "@/types/post";
import Link from "next/link";


type Props = {
    initialPosts?: Post[];
    currentUserId: number | null;
    showComposer?: boolean;
    feed?: "recommended" | "following";
};

export default async function PostList({
    initialPosts,
    currentUserId,
    showComposer = false,
    feed = "recommended",
}: Props) {
    let posts: Post[];

    if (initialPosts !== undefined) {
        posts = initialPosts;
    } else {
        let timelineUserIds: number[] = [];

        if (feed === "following" &&
            currentUserId !== null
        ) {
            const following = await prisma.follow.findMany({
                where: {
                    followerId: currentUserId,
                },

                select: {
                    followingId: true,
                },
            });

            const followingIds = following.map(
                (follow) => follow.followingId
            );

            timelineUserIds = [currentUserId, ...followingIds,];
        }

        posts = await prisma.post.findMany({
            where: feed === "following" && currentUserId !== null
                ? {
                    authorId: {
                        in: timelineUserIds,
                    },
                }
                : undefined,

            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                    },
                },

                replyTo: {
                    select: {
                        id: true,

                        author: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                            },
                        },
                    },
                },

                _count: {
                    select: {
                        likes: true,
                        replies: true,
                    },
                },

                likes: currentUserId !== null
                    ? {
                        where: {
                            userId: currentUserId,
                        },
                    }
                    : false,

                bookmarks: currentUserId !== null
                    ? {
                        where: {
                            userId: currentUserId,
                        },
                    }
                    : false,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    return (
        <>
            {initialPosts === undefined && (
                <nav>
                    <Link href="/?feed=recommended">
                        おすすめ
                    </Link>

                    {currentUserId !== null ? (
                        <Link href="/?feed=following">
                            フォロー中
                        </Link>
                    ) : (
                        <Link href={`/login?callbackUrl=${encodeURIComponent("/?feed=following")}`}
                        >
                            フォロー中
                        </Link>
                    )}
                </nav>
            )}

            {showComposer && currentUserId && (
                <PostComposer />
            )}

            {posts.map((post) => (
                <PostItem
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId}
                />
            ))}
        </>
    );
}