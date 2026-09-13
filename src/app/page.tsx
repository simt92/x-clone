import { auth } from "@/auth";
import PostList from "@/components/PostList";

type Props = {
  searchParams: Promise<{
    feed?: string;
  }>;
};

export default async function Page({
  searchParams,
}: Props) {
  const session = await auth();

  const currentUserId = session?.user?.id
    ? Number(session.user.id)
    : null;

  const { feed } = await searchParams;

  const selectedFeed = feed === "following"
    ? "following"
    : "recommended";

  return (
    <main>
      <PostList
        currentUserId={currentUserId}
        showComposer={true}
        feed={selectedFeed}
      />
    </main>
  );
}