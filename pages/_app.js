import Head from "next/head";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  const orgData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Free Spirit Tarot",
    alternateName: "FreeSpiritTarot.com.au",
    url: "https://fstarot.com.au",
    logo: "https://fstarot.com.au/logo.png",
    sameAs: [
      "https://www.facebook.com/freespirittarot",
      "https://www.instagram.com/freespirittarot",
      "https://x.com/freespirittarot",
      "https://www.youtube.com/@freespirittarot"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+61-400-000-000",
      contactType: "customer support",
      areaServed: "AU",
      availableLanguage: ["English"]
    }
  };

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Free Spirit Tarot",
    url: "https://fstarot.com.au",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://fstarot.com.au/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}