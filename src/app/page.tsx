import { auth } from "@/auth";
import PostList from "@/components/PostList";

type Props = {
  searchParams: Promise<{
    feed?: string;
    page?: string;
  }>;
};

export default async function Page({
  searchParams,
}: Props) {
  const session = await auth();

  const currentUserId = session?.user?.id
    ? Number(session.user.id)
    : null;

  const params = await searchParams;

  const feed =
    params.feed === "following"
      ? "following"
      : "recommended";

  return (
    <main>
      <PostList
        currentUserId={currentUserId}
        showComposer={true}
        feed={feed}
      />
    </main>
  );
}