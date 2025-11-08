
import { supabase } from '@/lib/supabaseClient';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

export async function getStaticPaths() {
  const { data } = await supabase.from('readers').select('alias');
  return { paths: data?.map(r => ({ params: { slug: r.alias } })) || [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { data: reader } = await supabase.from('readers').select('*').eq('alias', params.slug).single();
  return { props: { reader } };
}

export default function ReaderPage({ reader }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      const timeout = setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    setLoading(true);
    const newMessages = [...messages, { role: 'user', content: input }];
    setInput('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, readerAlias: reader.alias }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto text-center mt-10 px-4 pb-20">
      {/* ✨ Animated header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: 'easeOut' }} className="mb-8">
        <h1 className="text-3xl font-bold text-yellow-300 mb-2">
          {reader.emoji || '🔮'}{' '}
          <motion.span
            key={messages.length}
            initial={{ textShadow: '0 0 0px #fff' }}
            animate={{
              textShadow: [
                '0 0 5px #ffb700',
                '0 0 15px #ffb700',
                '0 0 25px #ffb700',
                '0 0 15px #ffb700',
                '0 0 5px #ffb700',
                '0 0 0px #ffb700',
              ],
              color: ['#fff8dc', '#ffe36e', '#fff8dc'],
            }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="inline-block filter drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]"
          >
            {reader.name}
          </motion.span>
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} className="text-purple-200">
          {reader.tagline}
        </motion.p>
      </motion.div>

      {/* 💬 Messages */}
      <div className="space-y-3 text-left overflow-y-auto max-h-[65vh] pr-2">
        {messages.map((m, i) => {
          const isUser = m.role === 'user';
          const cardPattern = /!\[Card.*?\]\((.*?)\)/g;
          const matches = [...m.content.matchAll(cardPattern)];
          return (
            <motion.div key={i} className={`p-3 rounded-lg ${isUser ? 'bg-purple-800/50' : 'bg-purple-900/50'}`} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <strong>{isUser ? 'You' : reader.name}:</strong>
              {matches.length > 0 && (
                <div className="flex justify-center gap-3 mt-3 mb-2">
                  {matches.map((match, j) => (
                    <motion.img key={j} src={match[1]} alt={'Tarot Card ' + (j + 1)} className="w-28 h-auto rounded-lg border border-purple-700 shadow-md" initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ delay: j * 0.3, duration: 0.6 }} />
                  ))}
                </div>
              )}
              <p className="mt-2 whitespace-pre-wrap">{m.content.replace(/!\[Card.*?\]\(.*?\)/g, '')}</p>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ✉️ Input */}
      <div className="mt-6 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} className="flex-1 p-3 rounded-lg bg-purple-950 border border-purple-700 text-white" placeholder="Ask your tarot reader..." />
        <button onClick={sendMessage} disabled={loading} className="bg-purple-700 hover:bg-purple-600 text-white px-4 rounded-lg transition">
          {loading ? 'Reading…' : 'Send'}
        </button>
      </div>

      {/* 💎 Scroll to top crystal */}
      {showTop && (
        <motion.button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="fixed bottom-8 right-8 bg-purple-700/80 hover:bg-purple-600 text-white p-3 rounded-full shadow-lg backdrop-blur-md border border-purple-400">
          <ChevronUp size={24} />
        </motion.button>
      )}

      <p className="text-xs text-purple-500 mt-8">© 2025 Free Spirit Tarot</p>
    </div>
  );
}