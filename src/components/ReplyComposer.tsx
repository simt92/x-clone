"use client"

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Props = {
    replyToId: number
};

export default function ReplyComposer({
    replyToId,
}: Props) {
    const [content, setContent] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    const MAX_CONTENT_LENGTH = 280;

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        if (isLoading || (!content.trim() && !imageFile)) {
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            let imageUrl: string | null = null;

            if (imageFile) {
                const formData = new FormData();

                formData.append(
                    "file",
                    imageFile
                );

                const uploadResponse = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    const data = await uploadResponse.json();

                    setError(data.message ?? "画像のアップロードに失敗しました");

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
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        content,
                        image: imageUrl,
                        replyToId,
                    }),
                }
            );

            if (!response.ok) {
                const data = await response.json();

                setError(data.message ?? "返信に失敗しました");

                return;
            }

            setContent("");
            setImageFile(null);

            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }

            setImagePreview(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            router.refresh();
        } catch (error) {
            console.error(error);

            setError("通信エラーが発生しました");
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
                maxLength={MAX_CONTENT_LENGTH}
                onChange={(event) => setContent(event.target.value)}
                placeholder="返信をポスト"
            />

            <input
                ref={fileInputRef}
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

                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                }}
            />

            {imagePreview && (
                <div className="image-preview">
                    <img
                        src={imagePreview}
                        alt="返信画像のプレビュー"
                    />

                    <button
                        type="button"
                        onClick={() => {
                            URL.revokeObjectURL(imagePreview);

                            setImageFile(null);
                            setImagePreview(null);

                            if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                            }
                        }}
                    >
                        画像を削除
                    </button>
                </div>
            )}

            <div className="post-composer-actions">
                <p>
                    {content.length} / {MAX_CONTENT_LENGTH}
                </p>

                <button
                    type="submit"
                    className="primary-button"
                    disabled={isLoading || (!content.trim() && !imageFile)}
                >
                    {isLoading ? "返信中..." : "返信"}
                </button>
            </div>

            {error && (
                <p className="form-error">
                    {error}
                </p>
            )}
        </form>
    );
}