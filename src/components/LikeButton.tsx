"use client"

import { useState } from "react";
import type { Like } from "@/types/post";
import { usePathname, useRouter } from "next/navigation";

type Props = {
    postId: number;
    initialLike: Like | null;
    initialLikeCount: number;
};

export default function LikeButton({
    postId,
    initialLike,
    initialLikeCount,
}: Props) {
    const [like, setLike] = useState<Like | null>(initialLike);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const pathname = usePathname();

    const isLiked = like !== null;

    const handleLike = async () => {
        if (isLoading) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`/api/posts/${postId}/like`, {
                method: isLiked ? "DELETE" : "POST",
            });

            if(response.status === 401) {
                router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
                return;
            }

            if (!response.ok) {
                return;
            }

            if (isLiked) {
                setLike(null);
                setLikeCount((count) => count - 1);
            } else {
                const newLike: Like = await response.json();

                setLike(newLike);
                setLikeCount((count) => count + 1);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleLike}
            disabled={isLoading}
        >
            {isLiked ? "❤️" : "♡"}{likeCount}
        </button>
    )
}