
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Head from 'next/head';

const driveToDirect = (url) => {
  if (!url) return null;
  if (url.includes('drive.google.com/file/d/')) {
    return url
      .replace('https://drive.google.com/file/d/', 'https://drive.google.com/uc?export=download&id=')
      .replace(/\/view\?.*$/, '');
  }
  if (url.includes('drive.google.com/open?id=')) {
    return url.replace('open?id=', 'uc?export=download&id=');
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
  const { data: reader } = await supabase
    .from('readers')
    .select('*')
    .eq('alias', params.slug)
    .single();

  if (!reader) return { notFound: true };

  // 🔢 Fetch top 3 cards by draw count
  const { data: topCardStats } = await supabase
    .from('card_stats')
    .select('*')
    .eq('reader', reader.alias)
    .order('draw_count', { ascending: false })
    .limit(3);

  // 🎴 Enrich with card images
  const topCards = [];
  for (const stat of topCardStats || []) {
    const { data: cardInfo } = await supabase
      .from('cards')
      .select('image_url')
      .eq('name', stat.card_name)
      .single();

    topCards.push({
      ...stat,
      image_url: cardInfo?.image_url || null,
    });
  }

  return {
    props: { reader, topCards },
    revalidate: 86400,
  };
}

export default function ReaderPage({ reader, topCards }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `✨ I am ${reader.name}. ${reader.tagline}` }
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/askReader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reader_alias: reader.alias, message: input })
      });
      const data = await res.json();
      const botMessage = {
        role: 'assistant',
        content: data.reply || '✨ ...the spirits are quiet right now.'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '⚠️ Something went wrong. Try again soon.' }
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
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`https://fstarot.com/reader/${reader.alias}`} />
        <meta property="og:site_name" content="Free Spirit Tarot" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <link rel="canonical" href={`https://fstarot.com/reader/${reader.alias}`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />
      </Head>

      <div className="max-w-2xl mx-auto space-y-10">
        {/* 🌙 Reader Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6 text-center sm:text-left">
          <Image
            src={imageSrc}
            alt={reader.name}
            width={120}
            height={120}
            className="rounded-full border-2 border-purple-700 shadow-md object-cover mb-4 sm:mb-0"
          />
          <div>
            <h1 className="text-3xl font-bold text-yellow-300 mb-1">
              {reader.emoji || '🔮'} {reader.name}
            </h1>
            <p className="text-purple-200 italic">{reader.tagline}</p>
          </div>
        </div>

        {/* 💬 Chat Window */}
        <div className="bg-purple-950/40 border border-purple-700 rounded-2xl p-4 flex flex-col h-[450px]">
          <div className="flex-1 overflow-y-auto mb-4 space-y-3 scrollbar-thin scrollbar-thumb-purple-700">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={msg.role === 'assistant'
                  ? 'text-purple-200 bg-purple-900/40 p-3 rounded-lg w-fit max-w-[80%]'
                  : 'text-yellow-200 bg-purple-800/40 p-3 rounded-lg self-end w-fit max-w-[80%]'
                }
              >
                {msg.content}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center space-x-1 bg-purple-900/40 p-3 rounded-lg w-fit">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-300"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="flex">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask your tarot reader..."
              className="flex-1 bg-purple-800/30 border border-purple-700 rounded-l-lg px-4 py-2 text-purple-100 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-400 text-purple-900 font-semibold rounded-r-lg hover:bg-yellow-300 transition"
            >
              Send
            </button>
          </form>
        </div>

        {/* 🪄 Most Drawn Cards */}
        {topCards && topCards.length > 0 && (
          <div className="text-center mt-10">
            <h2 className="text-2xl font-bold text-yellow-300 mb-4">✨ Most Drawn Cards</h2>
            <div className="flex justify-center flex-wrap gap-6">
              {topCards.map((card, i) => (
                <div
                  key={i}
                  className="bg-purple-900/40 border border-purple-700 p-3 rounded-xl w-28"
                >
                  <div className="relative w-16 h-24 mx-auto mb-2">
                    {card.image_url ? (
                      <Image
                        src={driveToDirect(card.image_url) || card.image_url}
                        alt={card.card_name}
                        fill
                        className="rounded-md object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-purple-800/50 rounded-md flex items-center justify-center text-purple-300">
                        🃏
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-yellow-300 truncate">
                    {card.card_name}
                  </h3>
                  <p className="text-xs text-purple-400">{card.draw_count}× drawn</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
