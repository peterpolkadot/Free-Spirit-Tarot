
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';

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
  const [messages, setMessages] = useState([
    { role: 'system', content: reader.system_instructions || 'You are a kind tarot reader.' },
  ]);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    setLoading(true);
    const newMessages = [...messages, { role: 'user', content: input }];
    setInput('');

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages, readerAlias: reader.alias }),
    });

    const data = await res.json();
    // ⬇️ Include cards array if returned
    const assistantMsg = { role: 'assistant', content: data.reply, cards: data.cards || null };
    setMessages([...newMessages, assistantMsg]);
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto text-center mt-10">
      <h1 className="text-3xl font-bold text-yellow-300 mb-2">
        {reader.emoji || '🔮'} {reader.name}
      </h1>
      <p className="text-purple-200 mb-8">{reader.tagline}</p>

      <div className="space-y-3 text-left">
        {messages
          .filter(m => m.role !== 'system')
          .map((m, i) => (
            <div
              key={i}
              className={'p-3 rounded-lg ' + (m.role === 'user' ? 'bg-purple-800/50' : 'bg-purple-900/50')}
            >
              <strong>{m.role === 'user' ? 'You' : reader.name}:</strong>
              <div className="mt-1 whitespace-pre-line">{m.content}</div>

              {/* 🃏 Render tarot cards if present */}
              {m.cards && (
                <div className="flex justify-center gap-4 mt-3">
                  {m.cards.map((card, idx) => (
                    <div key={idx} className="text-center">
                      <img
                        src={card.image_url}
                        alt={card.name}
                        className="w-24 h-40 object-cover rounded-lg border border-purple-600 shadow-md"
                      />
                      <p className="mt-2 text-sm text-yellow-300">{card.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>

      <div className="mt-6 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-3 rounded-lg bg-purple-950 border border-purple-700 text-white"
          placeholder="Ask your tarot reader..."
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-purple-700 hover:bg-purple-600 text-white px-4 rounded-lg"
        >
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </div>
  );

}