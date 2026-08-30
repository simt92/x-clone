import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

type Props = {
    user: {
        name?: string | null;
        username: string;
    } | null;
};

export default function Header({ user }: Props) {
    return (
        <header>
            <Link href="/">
                X Clone
            </Link>

            {user ? (
                <div>
                    <Link href={`/users/${user.username}`}>
                        <p>{user.name}</p>
                        <p>@{user.username}</p>
                    </Link>

                    <LogoutButton />
                </div>
            ) : (
                <div>
                    <Link href="/login">
                    ログイン
                    </Link>

                    <Link href="/register">
                    新規登録
                    </Link>
                </div>
        )}
        </header>
    );
}