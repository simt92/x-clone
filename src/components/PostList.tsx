import { prisma } from "@/lib/prisma";
import PostComposer from "@/components/PostComposer";
import PostItem from "@/components/PostItem";
import type { Post, TimelineItem } from "@/types/post";
import Link from "next/link";


type Props = {
    initialPosts?: Post[];
    currentUserId: number | null;
    showComposer?: boolean;
    feed?: "recommended" | "following";
    profileUserId?: number;
    profileTab?: "posts" | "replies";
};

export default async function PostList({
    initialPosts,
    currentUserId,
    showComposer = false,
    feed = "recommended",
    profileUserId,
    profileTab = "posts",
}: Props) {
    if (initialPosts !== undefined) {
        return (
            <>
                {initialPosts.map((post) => (
                    <PostItem
                        key={post.id}
                        post={post}
                        currentUserId={currentUserId}
                    />
                ))}
            </>
        );
    }

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

    const posts = await prisma.post.findMany({
        where: profileUserId !== undefined
            ? {
                authorId: profileUserId,
                replyToId: profileTab === "replies"
                    ? { not: null }
                    : null,
            }
            : feed === "following" &&
                currentUserId !== null
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
                    reposts: true,
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

            reposts: currentUserId !== null
                ? {
                    where: {
                        userId: currentUserId,
                    },
                }
                : false,
        },
    });

    const reposts = profileUserId !== undefined &&
        profileTab === "replies"
        ? []
        : await prisma.repost.findMany({
            where: profileUserId !== undefined
                ? {
                    userId: profileUserId,
                }
                : feed === "following" &&
                    currentUserId !== null
                    ? {
                        userId: {
                            in: timelineUserIds,
                        },
                    }
                    : undefined,

            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                    },
                },

                post: {
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
                                reposts: true,
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

                        reposts: currentUserId !== null
                            ? {
                                where: {
                                    userId: currentUserId,
                                },
                            }
                            : false,
                    },
                },
            },
        });

    const postItems: TimelineItem[] =
        posts.map((post) => ({
            type: "post",
            post,
            createdAt: post.createdAt,
        }));

    const repostItems: TimelineItem[] =
        reposts.map((repost) => ({
            type: "repost",
            post: repost.post,
            repostedBy: repost.user,
            createdAt: repost.createdAt,
        }));

    const timelineItems = [...postItems, ...repostItems];

    timelineItems.sort((a, b) =>
        new Date(
            b.createdAt
        ).getTime() -
        new Date(
            a.createdAt
        ).getTime()
    );

    return (
        <>
            {profileUserId === undefined && (
                <nav className="feed-nav">
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

            {timelineItems.map((item) => {
                if (item.type === "repost") {
                    return (
                        <div key={`repost-${item.repostedBy.id}-${item.post.id}`}
                        >
                            <div className="repost-label">
                                ↻{item.repostedBy.name}
                                さんがリポスト
                            </div>

                            <PostItem
                                post={item.post}
                                currentUserId={currentUserId}
                            />
                        </div>
                    );
                }

                return (
                    <PostItem
                        key={`post-${item.post.id}`}
                        post={item.post}
                        currentUserId={currentUserId}
                    />
                );
            })}
        </>
    );
}