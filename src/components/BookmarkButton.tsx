"use client"

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Props = {
    postId: number;
    initialIsBookmarked: boolean;
    refreshAfterChage?: boolean;
};

export default function BookmarkButton({
    postId,
    initialIsBookmarked,
    refreshAfterChage = false,
}: Props) {
    const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const pathname = usePathname();

    const handleBookmark = async () => {
        if (isLoading) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                `/api/posts/${postId}/bookmark`,
                {
                    method: isBookmarked
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

            setIsBookmarked(!isBookmarked);

            if(refreshAfterChage) {
                router.refresh();
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleBookmark}
            disabled={isLoading}
        >
            {isBookmarked
                ? "🔖 保存済み"
                : "🔖 ブックマーク"}
        </button>
    );
}