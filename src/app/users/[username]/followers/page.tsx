import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import FollowButton from "@/components/FollowButton";

type Props = {
    params: Promise<{
        username: string;
    }>;
};

export default async function FollowersPage({
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
            followers: {
                include: {
                    follower: {
                        select: {
                            id: true,
                            username: true,
                            name: true,

                            followers: currentUserId
                                ? {
                                    where: {
                                        followerId: currentUserId,
                                    },
                                }
                                : false,
                        },
                    },
                },
            },
        },
    });

    if (!user) {
        notFound();
    }

    return (
        <main>
            <h1>
                {user.name}さんのフォロワー
            </h1>

            {user.followers.map((follow) => {
                const targetUser = follow.follower;

                const isFollowing =
                    (targetUser.followers?.length ?? 0) > 0;

                const isOwnProfile =
                    currentUserId === targetUser.id;

                return (
                    <div key={follow.id}>
                        <Link
                            href={`/users/${targetUser.username}`}
                        >
                            <strong>
                                {targetUser.name}
                            </strong>

                            <p>
                                @{targetUser.username}
                            </p>
                        </Link>

                        {!isOwnProfile && (
                            <FollowButton
                                username={targetUser.username}
                                initialIsFollowing={isFollowing}
                            />
                        )}
                    </div>
                );
            })}
        </main>
    );
}