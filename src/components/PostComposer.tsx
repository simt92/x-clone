"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostComposer() {
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
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        content,
                    }),
                }
            );

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
        <form
            onSubmit={handleSubmit}
            className="post-composer"
        >
            <textarea
                value={content}
                onChange={(event) =>
                    setContent(event.target.value)
                }
                placeholder="いまどうしてる？"
            />
            <div className="post-composer-actions">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="primary-button"
                >
                    {isLoading ? "投稿中" : "投稿"}
                </button>

            </div>
        </form>
    );
}