import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export async function GET(
    request: Request
) {
    const session = await auth();

    const currentUserId =
        session?.user?.id
            ? Number(session.user.id)
            : null;

    const { searchParams } = new URL(request.url);

    const cursor = searchParams.get("cursor");

    const feed = searchParams.get("feed") === "following"
        ? "following"
        : "recommended";

    if (feed === "following" && currentUserId === null) {
        return Response.json(
            { message: "ログインが必要です" },
            { status: 401 }
        );
    }

    let timelineUserIds: number[] = [];

    if (feed === "following" && currentUserId !== null) {
        const following =
            await prisma.follow.findMany({
                where: {
                    followerId: currentUserId,
                },

                select: {
                    followingId: true,
                },
            });

        const followingIds = following.map(
            (follow) =>
                follow.followingId
        );

        timelineUserIds = [
            currentUserId,
            ...followingIds,
        ];
    }

    const cursorDate = cursor
        ? new Date(cursor)
        : null;

    if (cursorDate && Number.isNaN(cursorDate.getTime())) {
        return Response.json(
            { message: "cursorが不正です" },
            { status: 400 }
        );
    }

    const posts = await prisma.post.findMany({
        where: {
            ...(cursorDate
                ? {
                    createdAt: {
                        lt: cursorDate,
                    },
                }
                : {}),

            ...(feed === "following"
                ? {
                    authorId: {
                        in: timelineUserIds,
                    },
                }
                : {}),
        },

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

            likes:
                currentUserId !== null
                    ? {
                        where: {
                            userId: currentUserId,
                        },
                    }
                    : false,

            bookmarks:
                currentUserId !== null
                    ? {
                        where: {
                            userId: currentUserId,
                        },
                    }
                    : false,

            reposts:
                currentUserId !== null
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

        take: PAGE_SIZE,
    });

    const reposts = await prisma.repost.findMany({
        where: {
            ...(cursorDate
                ? {
                    createdAt: {
                        lt: cursorDate,
                    },
                }
                : {}),

            ...(feed === "following"
                ? {
                    userId: {
                        in: timelineUserIds,
                    },
                }
                : {}),
        },

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

                    likes:
                        currentUserId !== null
                            ? {
                                where: {
                                    userId: currentUserId,
                                },
                            }
                            : false,

                    bookmarks:
                        currentUserId !== null
                            ? {
                                where: {
                                    userId: currentUserId,
                                },
                            }
                            : false,

                    reposts:
                        currentUserId !== null
                            ? {
                                where: {
                                    userId: currentUserId,
                                },
                            }
                            : false,
                },
            },
        },

        orderBy: {
            createdAt: "desc",
        },

        take: PAGE_SIZE,
    });

    const postItems = posts.map(
        (post) => ({
            type: "post" as const,
            post,
            createdAt: post.createdAt,
        })
    );

    const repostItems = reposts.map(
        (repost) => ({
            type: "repost" as const,
            post: repost.post,
            repostedBy: repost.user,
            createdAt: repost.createdAt,
        })
    );

    const items = [
        ...postItems,
        ...repostItems,
    ].sort(
        (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
    ).slice(0, PAGE_SIZE);

    const nextCursor = items.length === PAGE_SIZE
        ? items[
            items.length - 1
        ].createdAt
        : null;

    return Response.json({
        items,
        nextCursor,
    });
}