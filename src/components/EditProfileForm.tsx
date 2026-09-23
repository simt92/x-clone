"use client"

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
    initialName: string;
    initialBio: string | null;
    initialImage: string | null;
};

export default function EditProfileForm({
    initialName,
    initialBio,
    initialImage,
}: Props) {
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(initialName);
    const [bio, setBio] = useState(initialBio ?? "");
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setIsLoading(true);
        setError("");

        let imageUrl = initialImage;

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

                setError(data.error ?? "画像のアップロードに失敗しました");

                setIsLoading(false);
                return;
            }

            const uploadData = await uploadResponse.json();

            imageUrl = uploadData.url;
        }

        const response = await fetch(
            "/api/users/me",
            {
                method: "PATCH",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify({
                    name,
                    bio,
                    image: imageUrl,
                }),
            }
        );

        if (!response.ok) {
            const data = await response.json();

            setError(
                data.error ??
                "プロフィールの更新に失敗しました"
            );

            setIsLoading(false);
            return;
        }

        setIsLoading(false);
        setIsEditing(false);
        setImageFile(null);

        router.refresh();
    };

    if (!isEditing) {
        return (
            <button
                type="button"
                onClick={() => setIsEditing(true)}
            >
                プロフィールを編集
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="image">
                    プロフィール画像
                </label>

                <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (file) {
                            setImageFile(file);
                        }
                    }}
                />
            </div>

            <div>
                <label htmlFor="name">
                    名前
                </label>

                <input
                    id="name"
                    type="text"
                    value={name}
                    required
                    maxLength={50}
                    onChange={(event) => setName(event.target.value)}
                />

                <p>{name.length} / 50</p>
            </div>

            <div>
                <label htmlFor="bio">
                    自己紹介
                </label>

                <textarea
                    id="bio"
                    value={bio}
                    maxLength={160}
                    onChange={(event) => setBio(event.target.value)}
                />

                <p>{bio.length} / 160</p>

                {error && (
                    <p>{error}</p>
                )}

                <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                >
                    キャンセル
                </button>

                <button
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading
                        ? "保存中..."
                        : "保存"}
                </button>
            </div>
        </form>
    );
}