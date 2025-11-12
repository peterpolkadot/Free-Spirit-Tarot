
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Head from 'next/head';
import { Send, Sparkles } from 'lucide-react';

export async function getStaticPaths() {
  const { data } = await supabase.from('readers').select('alias');
  return { 
    paths: data?.map(r => ({ params: { alias: r.alias } })) || [], 
    fallback: 'blocking' 
  };
}

export async function getStaticProps({ params }) {
  const { data: reader } = await supabase
    .from('readers')
    .select('*')
    .eq('alias', params.alias)
    .single();

  if (!reader) return { notFound: true };
  
  return { props: { reader }, revalidate: 86400 };
}

export default function ReaderPage({ reader }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/askReader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reader_alias: reader.alias, message: userMsg }),
      });
      
      const data = await res.json();
      
      // Add the text response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.reply,
        cards: data.cards // Include cards if they exist
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '✨ The spirits are unclear at this moment...' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{`${reader.name} - ${reader.tagline} | Free Spirit Tarot`}</title>
        <meta name="description" content={reader.description || reader.tagline} />
      </Head>

      <div className="max-w-4xl mx-auto">
        {/* Reader Header */}
        <div className="text-center mb-8">
          <img
            src={reader.image_url || 'https://pirces.com.au/wp-content/uploads/2024/11/no-photo.png'}
            alt={reader.name}
            className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-purple-700 object-cover shadow-lg"
          />
          <h1 className="text-4xl font-bold text-yellow-300 mb-2">
            {reader.emoji || '🔮'} {reader.name}
          </h1>
          <p className="text-xl text-purple-200">{reader.tagline}</p>
          {reader.specialty && (
            <p className="text-purple-300 mt-2">✨ {reader.specialty}</p>
          )}
        </div>

        {/* Chat Messages */}
        <div className="bg-purple-900/40 rounded-2xl border border-purple-700 p-6 mb-6 min-h-[400px] max-h-[600px] overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center text-purple-300 py-12">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
              <p className="text-lg">Ask {reader.name} a question...</p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`mb-6 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block max-w-[80%] p-4 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-purple-700 text-white' 
                  : 'bg-purple-800/50 text-purple-100'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                
                {/* 🎴 RENDER CARDS AS ACTUAL IMAGES */}
                {msg.cards && msg.cards.length > 0 && (
                  <div className="flex gap-4 mt-4 justify-center flex-wrap">
                    {msg.cards.map((card, idx) => (
                      <div key={idx} className="text-center">
                        <img 
                          src={card.image_url} 
                          alt={card.name}
                          className="w-24 h-auto rounded-lg shadow-md border-2 border-purple-600"
                        />
                        <p className="text-xs text-purple-300 mt-2">{card.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="text-center text-purple-300 py-4">
              <Sparkles className="w-6 h-6 mx-auto animate-pulse" />
              <p className="text-sm mt-2">Reading the cards...</p>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your question..."
            className="flex-1 px-4 py-3 bg-purple-900/40 border border-purple-700 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:border-yellow-300"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-purple-700 hover:bg-purple-600 rounded-lg text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            Send
          </button>
        </form>
      </div>
    </>
  );
}
