"use client"

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

type Props = {
    postId: number;
    initialIsLiked: boolean;
    initialLikeCount: number;
};

export default function LikeButton({
    postId,
    initialIsLiked,
    initialLikeCount,
}: Props) {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);

    useEffect(() =>{
        setIsLiked(initialIsLiked);
        setLikeCount(initialLikeCount);
    }, [
        initialIsLiked,
        initialLikeCount,
    ]);
    
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const pathname = usePathname();

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
                setIsLiked(false);
                setLikeCount((count) => count - 1);
            } else {
                setIsLiked(true);
                setLikeCount((count) => count + 1);
            }

            router.refresh();
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