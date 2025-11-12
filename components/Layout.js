
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const router = useRouter();
  const segments = router.asPath.split('/').filter(Boolean);
  const crumbs = segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/');
    let label = decodeURIComponent(seg)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
    if (segments[0] === 'reader' && i === 0) label = 'Readers';
    if (segments[0] === 'card' && i === 0) label = 'Cards';
    return { href, label };
  });

  return (
    <>
      <Head><title>Free Spirit Tarot 🔮</title></Head>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-950 via-purple-950 to-purple-900 text-white">
        <header className="py-6 text-center font-bold text-2xl">
          <Link href="/" className="hover:text-yellow-300 transition">🔮 Free Spirit Tarot</Link>
          {crumbs.length > 0 && (
            <nav className="mt-2 text-sm text-purple-300">
              <Link href="/" className="hover:text-yellow-300">Home</Link>
              {crumbs.map((c, i) => (
                <span key={i}> › <Link href={c.href} className="hover:text-yellow-300">{c.label}</Link></span>
              ))}
            </nav>
          )}
        </header>

        <main className="flex-1 container mx-auto p-6">{children}</main>

        <footer className="text-center py-4 text-purple-300 text-sm space-x-4">
          <Link href="/cards" className="hover:text-yellow-300">🃏 Cards</Link>
          <span>© 2025 Free Spirit Tarot</span>
        </footer>
      </div>
    </>
  );
}
