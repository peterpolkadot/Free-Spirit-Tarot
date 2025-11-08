
import { supabase } from '@/lib/supabaseClient';
import Head from 'next/head';
import { useState } from 'react';

export async function getStaticPaths() {
  const { data: readers } = await supabase.from('readers').select('alias');
  const paths = (readers || []).map(r => ({ params: { slug: r.alias } }));
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { data: reader } = await supabase.from('readers').select('*').eq('alias', params.slug).single();
  return { props: { reader }, revalidate: 60 };
}

export default function ReaderPage({ reader }) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReading() {
    setLoading(true);
    const res = await fetch('/api/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, readerAlias: reader.alias }),
    });
    const data = await res.json();
    setResponse(data.reading || 'No reading available.');
    setLoading(false);
  }

  return (
    <>
      <Head>
        <title>{reader.name} | Free Spirit Tarot 🔮</title>
        <meta name="description" content={reader.meta_description || reader.description} />
      </Head>
      <div className="max-w-3xl mx-auto text-center mt-16">
        <h1 className="text-4xl font-bold text-yellow-300 mb-4">{reader.name}</h1>
        <p className="text-purple-200 mb-10">{reader.tagline}</p>

        <textarea
          className="w-full p-3 rounded-lg bg-purple-950 border border-purple-700 text-white"
          rows="4"
          placeholder="Ask your question..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />
        <button
          onClick={handleReading}
          disabled={loading}
          className="mt-4 bg-purple-700 hover:bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          {loading ? 'Consulting the cards...' : 'Get Reading'}
        </button>

        {response && (
          <div className="mt-8 bg-purple-900/40 p-6 rounded-lg border border-purple-700 text-left whitespace-pre-wrap text-purple-100">
            {response}
          </div>
        )}
      </div>
    </>
  );
}