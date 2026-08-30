import { auth } from "@/auth";

export default async function ProfilePage() {
    const session = await auth();

    console.log(session);

    return (
        <main>
            <h1>プロフィール確認</h1>

            <p>ID: {session?.user?.id}</p>
            <p>Name: {session?.user?.name}</p>
            <p>Email: {session?.user?.email}</p>
        </main>
    );
}