import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FollowButton from "@/components/FollowButton";
import PostList from "@/components/PostList";
import EditProfileForm from "@/components/EditProfileForm";
import Link from "next/link";

type Props = {
    params: Promise<{
        username: string;
    }>;

    searchParams: Promise<{
        tab?: string;
    }>;
};

export default async function UserProfile({
    params,
    searchParams,
}: Props) {
    const { tab } = await searchParams;

    const profileTab =
        tab === "replies"
            ? "replies"
            : tab === "likes"
                ? "likes"
                : "posts"

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
            _count: {
                select: {
                    posts: true,
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

    const likedPosts =
        profileTab === "likes"
            ? await prisma.like.findMany({
                where: {
                    userId: user.id,
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

                            likes: currentUserId !== null
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
            })
            : [];

    const likedPostItems = likedPosts.map((like) => like.post);

    return (
        <main>
            <h1>{user.name}</h1>
            <p>@{user.username}</p>

            {user.bio && (
                <p>{user.bio}</p>
            )}

            <p>{user._count.posts}件のポスト</p>

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

            {isOwnProfile && (
                <EditProfileForm
                    initialName={user.name}
                    initialBio={user.bio}
                />
            )}

            <h2>投稿</h2>

            <nav className="feed-nav">
                <Link
                    href={`/users/${user.username}`}
                >
                    投稿
                </Link>

                <Link
                    href={`/users/${user.username}?tab=replies`}
                >
                    返信
                </Link>

                <Link
                    href={`/users/${user.username}?tab=likes`}
                >
                    いいね
                </Link>
            </nav>

            {profileTab === "likes" ? (
                <PostList
                    initialPosts={likedPostItems}
                    currentUserId={currentUserId}
                />
            ) : (
                <PostList
                    currentUserId={currentUserId}
                    profileUserId={user.id}
                    profileTab={profileTab}
                />
            )}
        </main>
    );
}