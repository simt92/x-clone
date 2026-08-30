"use client"

import { signOut } from "next-auth/react";

export default function LogoutButton() {
    const handleLogout = async () => {
        await signOut({
            redirectTo: "/login",
        });
    };

    return (
        <button onClick={handleLogout}>
            ログアウト
        </button>
    );
}