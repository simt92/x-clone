import { auth } from "@/auth";
import Home from "@/components/Home";

export default async function Page() {
  const session = await auth();

  const currentUserId = session?.user?.id
    ? Number(session.user.id)
    : null;

  return (
    <>
      <Home currentUserId={currentUserId} />
    </>
  );
}