"use client";

import PostList from "@/components/PostList";

type Props = {
    currentUserId: number | null;
};

export default function Home({
    currentUserId,
}: Props) {
    return (
        <main>
            <PostList
                currentUserId={currentUserId}
                showComposer={true}
            />
        </main>
    );
}