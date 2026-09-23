import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Props = {
    params: Promise<{ id: string; }>;
};

export async function POST(
    _request: Request,
    { params }: Props
) {
    const session = await auth();

    if (!session?.user?.id) {
        return Response.json(
            {
                message: "ログインが必要です",
            },
            {
                status: 401,
            }
        );
    }

    const userId = Number(session.user.id);

    const { id } = await params;
    const postId = Number(id);

    const existingRepost = await prisma.repost.findUnique({
        where: {
            userId_postId: {
                userId,
                postId,
            },
        },
    });

    if (existingRepost) {
        return Response.json(
            {
                message: "既にリポストしています",
            },
            {
                status: 409,
            }
        );
    }

    const repost = await prisma.repost.create({
        data: {
            userId,
            postId,
        },
    });

    return Response.json(
        repost,
        {
            status: 201
        }
    );
}

export async function DELETE(
    _request: Request,
    { params }: Props
) {
    const session = await auth();

    if (!session?.user?.id) {
        return Response.json(
            {
                message: "ログインが必要です",
            },
            {
                status: 401,
            }
        );
    }

    const userId = Number(session.user.id);

    const { id } = await params;
    const postId = Number(id);

    const existingRepost = await prisma.repost.findUnique({
        where: {
            userId_postId: {
                userId,
                postId,
            },
        },
    });

    if (!existingRepost) {
        return Response.json(
            {
                message: "リポストされていません",
            },
            {
                status: 404,
            }
        );
    }

    await prisma.repost.delete({
        where: {
            id: existingRepost.id,
        },
    });

    return Response.json({
        message: "リポストを解除しました",
    });
}