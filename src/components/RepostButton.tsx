"use client"

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

type Props = {
    postId: number;
    initialIsReposted: boolean;
    initialRepostCount: number;
};

export default function RepostButton({
    postId,
    initialIsReposted,
    initialRepostCount,
}: Props) {
    const [isReposted, setIsReposted] = useState(initialIsReposted);
    const [repostCount, setRepostCount] = useState(initialRepostCount);

    useEffect(() => {
        setIsReposted(initialIsReposted);
        setRepostCount(initialRepostCount);
    }, [
        initialIsReposted,
        initialRepostCount,
    ]);

    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const pathname = usePathname();

    const handleRepost = async () => {
        if (isLoading) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                `/api/posts/${postId}/repost`,
                {
                    method: isReposted
                        ? "DELETE"
                        : "POST",
                }
            );

            if (response.status === 401) {
                router.push(
                    `/login?callbackUrl=${encodeURIComponent(
                        pathname
                    )}`
                );

                return;
            }

            if (!response.ok) {
                return;
            }

            if (isReposted) {
                setIsReposted(false);

                setRepostCount((count) => count - 1);
            } else {
                setIsReposted(true);

                setRepostCount((count) => count + 1);
            }

            router.refresh();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleRepost}
            disabled={isLoading}
        >
            {isReposted ? "🔁" : "↻"}{" "}
            {repostCount}
        </button>
    );
}