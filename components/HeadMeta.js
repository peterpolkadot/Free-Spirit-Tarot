
import Head from 'next/head';

export default function HeadMeta({ title, description, image, url }) {
  const siteName = 'Chatbot City 🤖';
  const metaTitle = title ? `${title} | ${siteName}` : siteName;
  const metaDesc = description || 'Explore hundreds of AI chatbots designed for creativity, support, and fun.';
  const metaImage = image || '/default-og.png';
  const metaUrl = url || 'https://chatbotcity.ai';

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
      <meta name="theme-color" content="#2563EB" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}
