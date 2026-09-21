import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FollowButton from "@/components/FollowButton";
import PostList from "@/components/PostList";
import Link from "next/link";

type Props = {
    params: Promise<{
        username: string;
    }>;
};

export default async function UserProfile({
    params,
}: Props) {
    const session = await auth();

    const currentUserId = session?.user?.id
        ? Number(session.user.id)
        : null;

    const { username } = await params;

    const user = await prisma.user.findUnique({
        where: {
            username,
        },

        include: {
            posts: {
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
                        },
                    },

                    likes: currentUserId
                        ? {
                            where: {
                                userId: currentUserId,
                            },
                        }
                        : false,

                    bookmarks: currentUserId !== null
                        ? {
                            where: {
                                userId: currentUserId,
                            },
                        }
                        : false,
                },

                orderBy: {
                    createdAt: "desc",
                },
            },

            _count: {
                select: {
                    following: true,
                    followers: true,
                },
            },

            followers: currentUserId
                ? {
                    where: {
                        followerId: currentUserId,
                    },
                }
                : false,
        },
    });

    if (!user) {
        notFound();
    }

    const isFollowing =
        (user.followers?.length ?? 0) > 0;

    const isOwnProfile =
        currentUserId === user.id;

    return (
        <main>
            <h1>{user.name}</h1>

            <p>@{user.username}</p>

            <div>
                <Link href={`/users/${user.username}/following`}>
                    {user._count.following} フォロー中
                </Link>

                <Link href={`/users/${user.username}/followers`}>
                    {user._count.followers} フォロワー
                </Link>
            </div>

            {!isOwnProfile && (
                <FollowButton
                    username={user.username}
                    initialIsFollowing={isFollowing}
                    refreshAfterChange={false}
                />
            )}

            <h2>投稿</h2>

            <PostList
                initialPosts={user.posts}
                currentUserId={currentUserId}
            />
        </main>
    );
}