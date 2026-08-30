"use client";

import { useState } from "react";
import type { Post } from "@/types/post";

type Props = {
    onCreate: (newPost: Post) => void;
};

export default function PostComposer({
    onCreate,
}: Props) {
    const [content, setContent] = useState("");

    const handleSubmit = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        if (!content.trim()) {
            return;
        }

        const response = await fetch("/api/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content,
            }),
        });

        if (!response.ok) {
            return;
        }

        const newPost: Post =
            await response.json();

        onCreate(newPost);

        setContent("");
    };

    return (
        <form onSubmit={handleSubmit}>
            <textarea
                value={content}
                onChange={(event) =>
                    setContent(event.target.value)
                }
                placeholder="いまどうしてる？"
            />

            <button type="submit">
                投稿
            </button>
        </form>
    );
}