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
            { message: "ログインが必要です" },
            { status: 401 }
        );
    }

    const body = await request.json();

    const userId = Number(session.user.id);

    const newPost = await prisma.post.create({
        data: {
            content: body.content,
            authorId: userId,
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

    return Response.json(newPost);
}