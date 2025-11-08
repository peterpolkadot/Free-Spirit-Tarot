
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600&family=Raleway:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-950 via-purple-950 to-purple-900 text-white font-raleway">
        <Header />
        <main className="flex-1 container mx-auto p-6">{children}</main>
        <Footer />
      </div>
    </>
  );
}