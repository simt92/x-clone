import { auth } from "@/auth";
import Header from "@/components/Header";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="ja">
      <body>
        <Header user={session?.user ?? null} />

        {children}
      </body>
    </html>
  );
}
