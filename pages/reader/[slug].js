
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';
import Link from 'next/link';

export async function getStaticPaths() {
  const { data } = await supabase.from('readers').select('alias');
  return { paths: data?.map(r => ({ params: { slug: r.alias } })) || [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { data: reader } = await supabase.from('readers').select('*').eq('alias', params.slug).single();
  if (!reader) return { notFound: true };

  // Fetch category info for breadcrumb + emoji display
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('category_name', reader.category)
    .single();

  return { props: { reader, category } };
}

export default function ReaderPage({ reader, category }) {
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
    setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto text-center mt-10">

      {/* 🧭 Breadcrumbs */}
      <div className="text-sm text-purple-300 mb-4">
        <Link href="/">Home</Link> &nbsp;›&nbsp;
        <Link href={`/category/${category?.slug || reader.category_slug || reader.category}`}>
          {category?.emoji || reader.emoji || '🃏'} {category?.category_name || reader.category}
        </Link>
      </div>

      {/* 🧙‍♂️ Reader header */}
      <h1 className="text-3xl font-bold text-yellow-300 mb-2">
        {reader.emoji || category?.emoji || '🔮'} {reader.name}
      </h1>
      <p className="text-purple-200 mb-8">{reader.tagline}</p>

      {/* 💬 Chat messages */}
      <div className="space-y-3 text-left">
        {messages.filter(m => m.role !== 'system').map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg ${m.role === 'user' ? 'bg-purple-800/50' : 'bg-purple-900/50'}`}
          >
            <strong>{m.role === 'user' ? 'You' : reader.name}:</strong> {m.content}
          </div>
        ))}
      </div>

      {/* 🗣️ Input */}
      <div className="mt-6 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
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