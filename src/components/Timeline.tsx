"use client"

import { useState, useEffect, useRef } from "react";
import PostItem from "@/components/PostItem";
import type { TimelineItem } from "@/types/post"

type Props = {
    initialItems: TimelineItem[];
    initialCursor: string | null;
    currentUserId: number | null;
    feed: "recommended" | "following";
};

export default function Timeline({
    initialItems,
    initialCursor,
    currentUserId,
    feed,
}: Props) {
    const [items, setItems] = useState<TimelineItem[]>(initialItems);
    const [cursor, setCursor] = useState<string | null>(initialCursor);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadMoreRef = useRef<HTMLDivElement>(null);

    const handleLoadMore = async () => {
        if (!cursor || isLoading) {
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch(
                `/api/timeline?cursor=${encodeURIComponent(
                    cursor
                )}&feed=${feed}`
            );

            if (!response.ok) {
                const data = await response.json();

                setError(
                    data.message ?? "投稿の取得に失敗しました"
                );

                return;
            }

            const data = await response.json();

            setItems((currentItems) => [
                ...currentItems,
                ...data.items,
            ]);

            setCursor(data.nextCursor);
        } catch (error) {
            console.error(error);
            setError("通信エラーが発生しました");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        const target = loadMoreRef.current;

        if (!target || !cursor) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];

            if (entry.isIntersecting && !isLoading) {
                handleLoadMore();
            }
        });

        observer.observe(target);

        return () => {
            observer.disconnect();
        };
    }, [cursor, isLoading]);

    return (
        <>
            {items.map((item) => {
                if (item.type === "repost") {
                    return (
                        <div
                            key={`repost-${item.repostedBy.id}-${item.post.id}`}
                        >
                            <div className="repost-label">
                                ↻ {item.repostedBy.name}さんがリポスト
                            </div>

                            <PostItem
                                post={item.post}
                                currentUserId={currentUserId}
                            />
                        </div>
                    );
                }

                return (
                    <PostItem
                        key={`post-${item.post.id}`}
                        post={item.post}
                        currentUserId={currentUserId}
                    />
                );
            })}

            {error && (
                <p className="form-error">
                    {error}
                </p>
            )}

            {cursor && (
                <div ref={loadMoreRef}>
                    {isLoading && (
                        <p>読み込み中...</p>
                    )}
                </div>
            )}
        </>
    );
}