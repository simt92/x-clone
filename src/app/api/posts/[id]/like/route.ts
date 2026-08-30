import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();

    if (!session?.user?.id) {
        return Response.json(
            { message: "ログインが必要です" },
            { status: 401 },
        );
    }

    const { id } = await params;

    const postId = Number(id);
    const userId = Number(session.user.id);

    const existingLike = await prisma.like.findUnique({
        where: {
            userId_postId: {
                userId,
                postId,
            },
        },
    });

    if (existingLike) {
        return Response.json(
            { message: "既にいいねしています" },
            { status: 409 },
        );
    }

    const like = await prisma.like.create({
        data: {
            userId,
            postId,
        },
    });

    return Response.json(like, { status: 201 });
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();

    if (!session?.user?.id) {
        return Response.json(
            { message: "ログインが必要です" },
            { status: 401 },
        );
    }

    const { id } = await params;

    const postId = Number(id);
    const userId = Number(session.user.id);

    const existingLike = await prisma.like.findUnique({
        where: {
            userId_postId: {
                userId,
                postId,
            },
        },
    });

    if (!existingLike) {
        return Response.json(
            { message: "いいねしていません" },
            { status: 404 },
        );
    }

    await prisma.like.delete({
        where: {
            userId_postId: {
                userId,
                postId,
            },
        },
    });

    return Response.json({
        message: "いいねを解除しました"
    });
}
