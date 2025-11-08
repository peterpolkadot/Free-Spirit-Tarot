import { motion, AnimatePresence } from "framer-motion";
import HeadMeta from "./HeadMeta";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Layout({ children, title, description }) {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-950 via-purple-950 to-purple-900 text-white font-raleway">
      <HeadMeta title={title} description={description} />

      <header className="relative sticky top-0 z-40 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 shadow-lg backdrop-blur-md overflow-hidden">
        <div className="absolute inset-0 animate-shimmer opacity-60"></div>
        <div className="container mx-auto flex justify-between items-center p-4 relative z-10">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <span className="text-3xl animate-pulse">🔮</span>
            <span className="text-xl md:text-2xl font-bold tracking-wide">Free Spirit Tarot</span>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm">
            <Link href="/" className="hover:text-purple-300 transition">Home</Link>
            <Link href="/#categories" className="hover:text-purple-300 transition">Categories</Link>
            <Link href="/#about" className="hover:text-purple-300 transition">About</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div key={router.route}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}>
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 text-purple-200 text-center py-8 mt-10 border-t border-purple-700">
        <div className="max-w-6xl mx-auto px-4">
          <p className="mb-3 text-sm">© {new Date().getFullYear()} Free Spirit Tarot 🔮 — All rights reserved.</p>
          <p className="text-xs text-purple-400 mb-3">
            Readings are for entertainment and spiritual guidance purposes only.
          </p>
          <div className="flex justify-center gap-4 text-xs text-purple-300">
            <Link href="/privacy" className="hover:text-purple-100">Privacy</Link>
            <Link href="/terms" className="hover:text-purple-100">Terms</Link>
            <Link href="/contact" className="hover:text-purple-100">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}