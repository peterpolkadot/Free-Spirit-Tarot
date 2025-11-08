
import Head from 'next/head';
export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Free Spirit Tarot 🔮</title>
      </Head>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-950 via-purple-950 to-purple-900 text-white">
        <header className="py-6 text-center font-bold text-2xl">🔮 Free Spirit Tarot</header>
        <main className="flex-1 container mx-auto p-6">{children}</main>
        <footer className="text-center py-4 text-purple-300 text-sm">© 2025 Free Spirit Tarot</footer>
      </div>
    </>
  );
}