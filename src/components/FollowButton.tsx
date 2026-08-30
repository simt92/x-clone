"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
    username: string;
    initialFollowing: boolean;
};

export default function FollowButton({
    username,
    initialFollowing,
}: Props) {
    const [isFollowing, setIsFollowing] = useState(initialFollowing);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const handleFollow = async () => {
        if (isLoading) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                `/api/users/${username}/follow`,
                {
                    method: isFollowing ? "DELETE" : "POST",
                }
            );

            if (response.status === 401) {
                router.push(
                    `/login?callbackUrl=${encodeURIComponent(
                        `/users/${username}`
                    )}`
                );

                return;
            }

            if (!response.ok) {
                return;
            }

            setIsFollowing(!isFollowing);

            router.refresh();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleFollow}
                disabled={isLoading}
            >
                {isFollowing ? "フォロー中" : "フォローする"}
            </button>
        </div>
    );
}