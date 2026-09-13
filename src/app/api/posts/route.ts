import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request
) {
    const session = await auth();

    const userId = session?.user?.id
        ? Number(session.user.id)
        : null;

    const { searchParams } = new URL(request.url);

    const feed = searchParams.get("feed");

    let timelineUserIds: number[] = [];

    if (feed === "following" && userId) {
        const following = await prisma.follow.findMany({
            where: {
                followerId: userId,
            },

            select: {
                followingId: true,
            },
        });

        const followingIds = following.map(
            (follow) => follow.followingId
        );

        timelineUserIds = [userId, ...followingIds];
    }

    const posts = await prisma.post.findMany({
        where: feed === "following" && userId
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

            _count: {
                select: {
                    likes: true,
                },
            },

            likes: userId
                ? {
                    where: {
                        userId,
                    },
                }
                : false,
        },

        orderBy: {
            createdAt: "desc",
        },
    });

    return Response.json(posts);
}

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user.id) {
        return Response.json(
            {
                message: "ログインが必要です"
            },
            {
                status: 401
            }
        );
    }

    const body = await request.json();

    if (!body.content?.trim()) {
        return Response.json(
            {
                message: "投稿内容を入力してください"
            },
            {
                status: 400,
            }
        );
    }

    const userId = Number(session.user.id);

    const replyToId = typeof body.replyToId === "number"
        ? body.replyToId
        : null;

    if (replyToId !== null) {
        const replyToPost = await prisma.post.findUnique({
            where: {
                id: replyToId,
            },
        });

        if (!replyToPost) {
            return Response.json(
                {
                    message: "返信先の投稿が見つかりません",
                },
                {
                    status: 404,
                }
            );
        }
    }

    const newPost = await prisma.post.create({
        data: {
            content: body.content,
            authorId: userId,
            replyToId,
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

            likes: {
                where: {
                    userId,
                },
            },
        },
    });

    return Response.json(
        newPost,
        {
            status: 201
        }
    );
}