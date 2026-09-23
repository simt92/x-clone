import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    request: Request
) {
    const session = await auth();

    if (!session?.user?.id) {
        return Response.json(
            {
                error: "ログインが必要です"
            },
            {
                status: 401,
            }
        );
    }

    const body = await request.json();

    if(
        typeof body.name !== "string" ||
        (
            body.bio !== undefined &&
            body.bio !== null &&
            typeof body.bio !== "string"
        )
    ) {
        return Response.json(
            {
                error: "入力内容が不正です",
            },
            {
                status: 400
            }
        );
    }

    const name = body.name?.trim();
    const bio = body.bio?.trim();

    if (!name) {
        return Response.json(
            {
                error: "名前は必須です",
            },
            {
                status: 400
            }
        );
    }

    if (name.length > 50) {
        return Response.json(
            {
                error: "名前は50文字以内で入力してください",
            },
            {
                status: 400
            }
        );
    }

    if (bio && bio.length > 160) {
        return Response.json(
            {
                error: "自己紹介は160文字以内で入力してください",
            },
            {
                status: 400
            }
        );
    }

    const user = await prisma.user.update({
        where: {
            id: Number(session.user.id),
        },

        data: {
            name,
            bio: bio || null,
        },

        select: {
            id: true,
            username: true,
            name: true,
            bio: true,
        },
    });

    return Response.json(user);
}