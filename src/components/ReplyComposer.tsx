"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
    replyToId: number
};

export default function ReplyComposer({
    replyToId,
}: Props) {
    const [content, setContent] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const handleSubmit = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        if (!content.trim()) {
            return;
        }

        if (isLoading) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                "/api/posts",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        content,
                        replyToId,
                    }),
                }
            );

            if (response.status === 401) {
                router.push(
                    `/login?callbackUrl=${encodeURIComponent(`/posts/${replyToId}`)}`
                );

                return;
            }

            if (!response.ok) {
                return;
            }

            setContent("");

            router.refresh();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="返信をポスト"
            />

            <button
                type="submit"
                disabled={isLoading}
            >
                返信
            </button>

        </form>
    )
}