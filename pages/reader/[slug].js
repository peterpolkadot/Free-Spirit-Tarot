
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

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


export default function ReaderPage({ reader, topCard }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `✨ I am ${reader.name}. ${reader.tagline}` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // 🌀 Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
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
        body: JSON.stringify({
          reader_alias: reader.alias,
          message: input
        })
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

  // 🖼️ Helper to render messages with cards inline
  function renderMessageContent(content) {
    // Detect image markdown patterns
    const cardPattern = /!\[Card.*?\]\((.*?)\)/g;
    const matches = [...content.matchAll(cardPattern)];
    const text = content.replace(cardPattern, '').trim();

    return (
      <>
        {text && <p className="whitespace-pre-wrap mb-2">{text}</p>}
        {matches.length > 0 && (
          <div className="flex justify-center flex-wrap gap-3">
            {matches.map((match, i) => (
              <Image
  key={i}
  src={match[1]}
  alt={'Tarot Card ' + (i + 1)}
  width={100}
  height={160}
  placeholder="blur"
  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAnsBvDaKeEQAAAAASUVORK5CYII=" // tiny transparent base64
  className="rounded-lg border border-purple-700 shadow-md transition-opacity duration-500"
/>

            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-yellow-300 mb-2">
          {reader.emoji || '🔮'} {reader.name}
        </h1>
        <p className="text-purple-200">{reader.tagline}</p>
      </div>

      {/* 💬 Chat window */}
      <div className="bg-purple-950/40 border border-purple-700 rounded-2xl p-4 flex flex-col h-[450px]">
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 scrollbar-thin scrollbar-thumb-purple-700">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={
                msg.role === 'assistant'
                  ? 'text-purple-200 bg-purple-900/40 p-3 rounded-lg w-fit max-w-[80%]'
                  : 'text-yellow-200 bg-purple-800/40 p-3 rounded-lg self-end w-fit max-w-[80%]'
              }
            >
              {renderMessageContent(msg.content)}
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
    <h2 className="text-2xl font-bold text-yellow-300 mb-4">
      🪄 Most Drawn Cards
    </h2>

    <div className="flex justify-center flex-wrap gap-6">
      {topCards.map((card, i) => (
        <div
          key={i}
          className="bg-purple-900/40 border border-purple-700 p-3 rounded-xl w-28"
        >
          <div className="relative w-16 h-24 mx-auto mb-2">
            {card.image_url ? (
              <Image
                src={card.image_url}
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
          <p className="text-xs text-purple-400">
            {card.draw_count}× drawn
          </p>
        </div>
      ))}
    </div>
  </div>
)}

