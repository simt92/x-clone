import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ username: string }> }
) {
    const session = await auth();

    if (!session?.user?.id) {
        return Response.json(
            { message: "ログインが必要です" },
            { status: 401 }
        );
    }

    const { username } = await params;

    const followerId = Number(session.user.id);

    const targetUser = await prisma.user.findUnique({
        where: {
            username,
        },
    });

    if (!targetUser) {
        return Response.json(
            { message: "ユーザーが見つかりません" },
            { status: 404 }
        );
    }

    if (followerId === targetUser.id) {
        return Response.json(
            { message: "自分自身はフォローできません" },
            { status: 409 }
        );
    }

    const existingFollow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId,
                followingId: targetUser.id,
            },
        },
    });

    if (existingFollow) {
        return Response.json(
            { message: "既にフォローしています" },
            { status: 409 }
        );
    }

    const follow = await prisma.follow.create({
        data: {
            followerId,
            followingId: targetUser.id,
        },
    });

    return Response.json(follow, { status: 200 });
}

export async function DELETE(
    _request: Request,
    { params }: {
        params: Promise<{ username: string }>
    }
) {
    const session = await auth();

    if (!session?.user?.id) {
        return Response.json(
            { message: "ログインが必要です" },
            { status: 401 }
        );
    }

    const { username } = await params;

    const followerId = Number(session.user.id);

    const targetUser = await prisma.user.findUnique({
        where: {
            username,
        },
    });

    if (!targetUser) {
        return Response.json(
            { message: "ユーザーが見つかりません" },
            { status: 404 }
        );
    }

    const existingFollow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId,
                followingId: targetUser.id,
            },
        },
    });

    if (!existingFollow) {
        return Response.json(
            { message: "フォローしていません" },
            { status: 404 }
        );
    }

    await prisma.follow.delete({
        where: {
            followerId_followingId: {
                followerId,
                followingId: targetUser.id,
            },
        },
    });

    return Response.json({ message: "フォローを解除しました" });
}