import { auth } from "@/auth";
import Header from "@/components/Header";
import "./globals.css";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="ja">
      <body>
        <div className="app-container">
          <Header user={session?.user ?? null} />

          {children}
        </div>
      </body>
    </html>
  );
}
