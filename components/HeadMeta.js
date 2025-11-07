
import Head from 'next/head';

export default function HeadMeta({ title, description, image, url }) {
  const siteName = 'Free Spirit Tarot 🔮';
  const metaTitle = title ? `${title} | ${siteName}` : siteName;
  const metaDesc = description || 'Connect with AI tarot readers for guidance, insight, and spiritual wisdom.';
  const metaImage = image || '/default-og.png';
  const metaUrl = url || 'https://fstarot.com.au';

  return (
    <Head>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDesc} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={metaImage} />
      <meta name="theme-color" content="#7C3AED" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}
