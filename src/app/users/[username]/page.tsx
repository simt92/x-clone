import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FollowButton from "@/components/FollowButton";
import PostList from "@/components/PostList";
type Props = {
    params: Promise<{
        username: string;
    }>;
};

export default async function UserProfile({ params }: Props) {
    const session = await auth();

    const currentUserId = session?.user?.id
        ? Number(session.user.id)
        : null;

    const { username } = await params;

    const user = await prisma.user.findUnique({
        where: {
            username: username,
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

                    _count: {
                        select: {
                            likes: true,
                        },
                    },

                    likes: currentUserId
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

    const isFollowing = (user.followers?.length ?? 0) > 0;

    const isOwnProfile = currentUserId === user.id;

    return (
        <main>
            <h1>{user.name}</h1>
            <p>@{user.username}</p>

            <p>
                {user._count.following} フォロー中
            </p>
            <p>
                {user._count.followers} フォロワー
            </p>

            {!isOwnProfile && (
                <FollowButton
                    username={user.username}
                    initialFollowing={isFollowing}
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
