import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();

    const userId = session?.user?.id
        ? Number(session.user.id)
        : null;

    const posts = await prisma.post.findMany({
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