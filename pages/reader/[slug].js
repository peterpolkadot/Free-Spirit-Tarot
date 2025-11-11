
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Head from 'next/head';

const driveToDirect = (url) => {
  if (!url) return null;
  if (url.includes('drive.google.com/file/d/')) {
    return url
      .replace('https://drive.google.com/file/d/', 'https://drive.google.com/uc?export=view&id=')
      .replace(/\/view\?.*$/, '');
  }
  return url;
};

// ⭐ Helper to generate reader schema
function getReaderSchemaMarkup(reader) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: reader.name,
    jobTitle: 'Tarot Reader',
    description: reader.description || reader.tagline,
    url: `https://fstarot.com/reader/${reader.alias}`,
    knowsAbout: reader.specialty || 'Tarot Reading',
  };
}

export async function getStaticPaths() {
  const { data } = await supabase.from('readers').select('alias');
  return { paths: data?.map(r => ({ params: { slug: r.alias } })) || [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { data: reader } = await supabase.from('readers').select('*').eq('alias', params.slug).single();
  if (!reader) return { notFound: true };

  const { data: topCardStats } = await supabase
    .from('card_stats')
    .select('*')
    .eq('reader', reader.alias)
    .order('draw_count', { ascending: false })
    .limit(3);

  const topCards = [];
  for (const stat of topCardStats || []) {
    const { data: cardInfo } = await supabase
      .from('cards')
      .select('image_url')
      .eq('name', stat.card_name)
      .single();
    topCards.push({ ...stat, image_url: cardInfo?.image_url || null });
  }

  return { props: { reader, topCards }, revalidate: 86400 };
}

export default function ReaderPage({ reader, topCards }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `✨ I am ${reader.name}. ${reader.tagline}` },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const schemaMarkup = getReaderSchemaMarkup(reader);
  const pageTitle = reader.meta_title || `${reader.name} - Tarot Reader | Free Spirit Tarot`;
  const pageDescription = reader.meta_description || reader.tagline;
  const pageKeywords = reader.seo_keywords || '';

  const imageSrc =
    driveToDirect(reader.image_url) ||
    'https://pirces.com.au/wp-content/uploads/2024/11/no-photo.png';

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    try {
      const res = await fetch('/api/askReader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reader_alias: reader.alias, message: input }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Something went wrong. Try again soon.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {pageKeywords && <meta name="keywords" content={pageKeywords} />}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      </Head>

      <div className="max-w-2xl mx-auto space-y-10">
        {/* 🌙 Reader Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6 text-center sm:text-left mb-10">
          <Image
            src={imageSrc}
            alt={reader.name}
            width={180}
            height={180}
            className="rounded-full border-4 border-purple-700 shadow-xl object-cover mb-4 sm:mb-0"
          />
          <div>
            <h1 className="text-3xl font-bold text-yellow-300 mb-1">
              {reader.emoji || '🔮'} {reader.name}
            </h1>
            <p className="text-purple-200 italic">{reader.tagline}</p>
          </div>
        </div>

        {/* 💬 Chat */}
        {/* (same chat logic from your version here) */}

        {/* ✨ Most Drawn Cards */}
        {/* (same card display logic) */}
      </div>
    </>
  );
}
