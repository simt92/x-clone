"use client"

import { useState } from "react";
import { signIn } from "next-auth/react";
import {useRouter, useSearchParams} from "next/navigation";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();

    const searchParams = useSearchParams();

    const callbackUrl = searchParams.get("callbackUrl") ?? "/";

    const handeleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        setError("");

        const result = await signIn("credentials", {
            email: email,
            password: password,
            redirect: false,
        });

        if (result?.error) {
            setError("メールアドレスまたはパスワードが違います");
            return;
        }

        router.push(callbackUrl);
        router.refresh();
    };

    return (
        <form onSubmit={handeleSubmit}>
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

             {error && <p>{error}</p>}

            <button type="submit">
                ログイン
            </button>
        </form>
    );
}