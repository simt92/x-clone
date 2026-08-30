import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LikeButton from "@/components/LikeButton";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function PostDetail({ params }: Props) {
    const session = await auth();

    const userId = session?.user?.id
        ? Number(session.user.id)
        : null;

    const { id } = await params;

    const post = await prisma.post.findUnique({
        where: {
            id: Number(id),
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

            likes: userId
                ? {
                    where: {
                        userId,
                    },
                }
                : false,
        },
    });

    if (!post) {
        notFound();
    }

    return (
        <main>
            <p>{post.author.name}</p>
            <p>{post.author.username}</p>

            <p>{post.content}</p>

            <LikeButton
                postId={post.id}
                initialLike={post.likes?.[0] ?? null}
                initialLikeCount={post._count.likes}
            />
        </main>
    );
}