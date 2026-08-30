"use client";

import { useState } from "react";

type Props = {
    onPost: (content: string) => void;
};

export default function PostComposer({ onPost }: Props) {
    const [content, setContent] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (content.trim() === "") {
            return;
        }

        onPost(content);
        setContent("");
    };

    return (
        <form onSubmit={handleSubmit}>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="いまどうしてる？"
            />

            <button type="submit">
                投稿する
            </button>
        </form>
    );
}