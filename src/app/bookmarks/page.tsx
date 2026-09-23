import { redirect } from "next/navigation";
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma";
import PostList from "@/components/PostList";

export default async function BookmarksPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect(
            `/login?callbackUrl=${encodeURIComponent(
                "bookmarks"
            )}`
        );
    }

    const currentUserId = Number(session.user.id);

    const bookmarks = await prisma.bookmark.findMany({
        where: {
            userId: currentUserId,
        },

        include: {
            post: {
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                        },
                    },

                    replyTo: {
                        select: {
                            id: true,

                            author: {
                                select: {
                                    id: true,
                                    username: true,
                                    name: true,
                                },
                            },
                        },
                    },

                    _count: {
                        select: {
                            likes: true,
                            replies: true,
                            reposts: true,
                        },
                    },

                    likes: {
                        where: {
                            userId: currentUserId,
                        },
                    },

                    bookmarks: {
                        where: {
                            userId: currentUserId,
                        },
                    },

                    reposts: currentUserId !== null
                        ? {
                            where: {
                                userId: currentUserId,
                            },
                        }
                        : false,
                },
            },
        },

        orderBy: {
            id: "desc",
        },
    });

    const posts = bookmarks.map((bookmark) => bookmark.post);

    return (
        <main>
            <h1>ブックマーク</h1>

            <PostList
                initialPosts={posts}
                currentUserId={currentUserId}
            />

            {posts.length === 0 &&
                <p>まだ何もありません</p>
            }
        </main>
    );
}