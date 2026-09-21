import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Props = {
    params: Promise<{ id: string; }>;
};

export async function POST(
    request: Request,
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

    const existingBookmark = await prisma.bookmark.findUnique({
        where: {
            userId_postId: {
                userId,
                postId,
            },
        },
    });

    if (existingBookmark) {
        return Response.json(
            {
                message: "既にブックマークしています"
            },
            {
                status: 409
            },
        );
    }

    const bookmark = await prisma.bookmark.create({
        data: {
            userId,
            postId,
        },
    });

    return Response.json(
        bookmark,
        {
            status: 201,
        }
    );
}

export async function DELETE(
    request: Request,
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

    const existingBookmark = await prisma.bookmark.findUnique({
        where: {
            userId_postId: {
                userId,
                postId,
            },
        },
    });

    if (!existingBookmark) {
        return Response.json(
            {
                message: "ブックマークされていません",
            },
            {
                status: 404,
            }
        );
    }

    await prisma.bookmark.delete({
        where: {
            id: existingBookmark.id,
        },
    });

    return Response.json({
        message: "ブックマークを削除しました",
    });
}