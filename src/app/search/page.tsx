import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import FollowButton from "@/components/FollowButton";

type Props = {
    searchParams: Promise<{
        q?: string;
    }>;
};

export default async function SearchPage({
    searchParams,
}: Props) {
    const session = await auth();

    const currentUserId = session?.user?.id
        ? Number(session.user.id)
        : null;

    const { q } = await searchParams;

    const query = q?.trim() ?? "";

    const users = query
        ? await prisma.user.findMany({
            where: {
                OR: [
                    {
                        username: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    {
                        name: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                ],
            },

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

            take: 20,
        })
        : [];

    return (
        <main>
            <h1>ユーザー検索</h1>

            <form action="/search">
                <input
                    type="text"
                    name="q"
                    defaultValue={query}
                    placeholder="ユーザーを検索"
                />

                <button type="submit">
                    検索
                </button>
            </form>

            {query && (
                <div>
                    <p>
                        「{query}」の検索結果
                    </p>

                    {users.length === 0 ? (
                        <p>
                            ユーザーが見つかりませんでした
                        </p>
                    ) : (
                        users.map((user) => {
                            const isFollowing = (user.followers?.length ?? 0) > 0;

                            const isOwnProfile = currentUserId === user.id;

                            return (
                                <div key={user.id}>
                                    <Link href={`/users/${user.username}`}>
                                        <strong>
                                            {user.name}
                                        </strong>

                                        <p>
                                            @{user.username}
                                        </p>
                                    </Link>

                                    {!isOwnProfile && (
                                        <FollowButton
                                            username={user.username}
                                            initialIsFollowing={isFollowing}
                                        />
                                    )}
                                </div>

                            );
                        })
                    )}
                </div>
            )}
        </main>
    );
}