import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// export async function GET(
//     request: Request
// ) {
//     const session = await auth();

//     const userId = session?.user?.id
//         ? Number(session.user.id)
//         : null;

//     const { searchParams } = new URL(request.url);

//     const feed = searchParams.get("feed");

//     let timelineUserIds: number[] = [];

//     if (feed === "following" && userId) {
//         const following = await prisma.follow.findMany({
//             where: {
//                 followerId: userId,
//             },

//             select: {
//                 followingId: true,
//             },
//         });

//         const followingIds = following.map(
//             (follow) => follow.followingId
//         );

//         timelineUserIds = [userId, ...followingIds];
//     }

//     const posts = await prisma.post.findMany({
//         where: feed === "following" && userId
//             ? {
//                 authorId: {
//                     in: timelineUserIds,
//                 },
//             }
//             : undefined,

//         include: {
//             author: {
//                 select: {
//                     id: true,
//                     username: true,
//                     name: true,
//                 },
//             },

//             replyTo: {
//                 select: {
//                     id: true,

//                     author: {
//                         select: {
//                             id: true,
//                             username: true,
//                             name: true,
//                         },
//                     },
//                 },
//             },

//             _count: {
//                 select: {
//                     likes: true,
//                     replies: true,
//                     reposts: true,
//                 },
//             },

//             likes: userId
//                 ? {
//                     where: {
//                         userId,
//                     },
//                 }
//                 : false,

//             bookmarks: userId
//                 ? {
//                     where: {
//                         userId,
//                     },
//                 }
//                 : false,

//             reposts: userId
//                 ? {
//                     where: {
//                         userId,
//                     },
//                 }
//                 : false,

//         },

//         orderBy: {
//             createdAt: "desc",
//         },
//     });

//     return Response.json(posts);
// }

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user.id) {
        return Response.json(
            { message: "ログインが必要です" },
            { status: 401 }
        );
    }

    const body = await request.json();

    const { content, replyToId, image } = body;

    if (typeof content !== "string") {
        return Response.json(
            { message: "投稿内容が不正です" },
            { status: 400 }
        );
    }

    const trimmedContent = content.trim();

    if (
        image !== undefined &&
        image !== null &&
        typeof image !== "string"
    ) {
        return Response.json(
            { message: "画像のURLが不正です" },
            { status: 400 }
        );
    }

    if (
        replyToId !== undefined &&
        replyToId !== null &&
        typeof replyToId !== "number"
    ) {
        return Response.json(
            { message: "返信先が不正です" },
            { status: 400 }
        );
    }

    if (replyToId !== undefined && replyToId !== null) {
        const parentPost = await prisma.post.findUnique({
            where: {
                id: replyToId,
            },
            select: {
                id: true,
            },
        });
        if (!parentPost) {
            return Response.json(
                { message: "返信先の投稿が存在しません" },
                { status: 404 }
            );
        }
    }

    const post = await prisma.post.create({
        data: {
            content: trimmedContent,
            image: image ?? null,
            authorId: Number(session.user.id),
            replyToId: replyToId ?? null,
        },
    });

    return Response.json(
        { message: "投稿しました" },
        { status: 201 }
    );
}