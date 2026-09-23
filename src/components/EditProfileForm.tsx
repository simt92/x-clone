"use client"

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
    initialName: string;
    initialBio: string | null;
};

export default function EditProfileForm({
    initialName,
    initialBio,
}: Props) {
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(initialName);
    const [bio, setBio] = useState(initialBio ?? "");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setIsLoading(true);
        setError("");

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