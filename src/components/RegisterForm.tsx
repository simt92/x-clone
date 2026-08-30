"use client"

import { useState } from "react";
import {signIn} from "next-auth/react";
import {useRouter} from "next/navigation";
 
export default function RegisterForm() {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        setError("");

        const response = await fetch("/api/users", {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                name,
                username,
                email,
                password,
            }),
        });

        const data = await response.json();

        if(!response.ok) {
            setError(data.message);
            return;
        }

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError("登録は成功しましたが、ログインに失敗しました");
            return;
        }

        router.push("/");
        router.refresh();
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="名前"
                value={name}
                onChange={(event) => setName(event.target.value)}
            />
            <input
                type="text"
                placeholder="ユーザー名"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
            />
            <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
            />
            <input
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
            />

            {error && (
                <p>{error}</p>
            )}

            <button type="submit">
                新規登録
            </button>
        </form>
    );
}