"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostComposer() {
    const [content, setContent] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
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

        setError(null);
        setIsLoading(true);

        try {
            let imageUrl: string | null = null;

            if (imageFile) {
                const formData = new FormData();

                formData.append("file", imageFile);

                const uploadResponse = await fetch(
                    "/api/upload", {
                    method: "POST",
                    body: formData,
                }
                );

                if (!uploadResponse.ok) {
                    const data = await uploadResponse.json();

                    setError(
                        data.message ?? "画像のアップロードに失敗しました"
                    );

                    return;
                }

                const uploadData = await uploadResponse.json();

                imageUrl = uploadData.url;
            }

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
                        image: imageUrl,
                    }),
                }
            );

            if (!response.ok) {
                const data = await response.json();

                setError(
                    data.message ?? "投稿に失敗しました"
                );

                return;
            }

            setContent("");
            setImageFile(null);

            if (imagePreview) {
                URL.revokeObjectURL(imagePreview)
            }

            setImagePreview(null);

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

            {error && (
                <p className="form-error">
                    {error}
                </p>
            )}

            <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (!file) {
                        return;
                    }

                    if (imagePreview) {
                        URL.revokeObjectURL(imagePreview);
                    }

                    const previewUrl = URL.createObjectURL(file);

                    setImageFile(file);
                    setImagePreview(previewUrl);
                }}
            />

            {imagePreview && (
                <div className="image-preview">
                    <img
                        src={imagePreview}
                        alt="投稿画像のプレビュー"
                    />

                    <button
                        type="button"
                        onClick={() => {
                            if (imagePreview) {
                                URL.revokeObjectURL(imagePreview);
                            }

                            setImageFile(null);
                            setImagePreview(null);
                        }}
                    >
                        画像を削除
                    </button>
                </div>
            )}

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