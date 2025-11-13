
import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ title, description, children }) {
  return (
    <div className="min-h-screen bg-purple-950 text-purple-100 flex flex-col">
      <Head>
        <title>{title ? title : "Free Spirit Tarot"}</title>
        <meta name="description" content={description || "AI-powered tarot readings."} />
      </Head>

      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-10">
        {children}
      </main>

      <Footer />
    </div>
  );
}
