import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = {
    params: Promise<{
        username: string;
    }>;
};

export default async function FollowingPage({
    params,
}: Props) {
    const { username } = await params;

    const user = await prisma.user.findUnique({
        where: {
            username,
        },

        include: {
            following: {
                include: {
                    following: {
                        select: {
                            id: true,
                            username: true,
                            name: true,

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
                {user.name}さんがフォロー中
            </h1>

            {user.following.map((follow) => (
                <div key={follow.id}>
                    <Link
                        href={`/users/${follow.following.username}`}
                    >
                        <strong>
                            {follow.following.name}
                        </strong>

                        <p>
                            @{follow.following.username}
                        </p>
                    </Link>
                </div>
            ))}
        </main>
    );
}