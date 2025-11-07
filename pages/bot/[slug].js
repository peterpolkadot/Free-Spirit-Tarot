
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getSupabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';
import ChatInterface from '../../components/ChatInterface';
import HeadMeta from '../../components/HeadMeta';
import Breadcrumbs from '../../components/Breadcrumbs';

export default function BotPage() {
  const { slug } = useRouter().query;
  const [bot, setBot] = useState(null);
  const [category, setCategory] = useState(null);
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    if (!slug) return;
    const supabase = getSupabase();

    async function fetchBotData() {
      const { data: botData } = await supabase.from('bots').select('*').eq('alias', slug).single();
      if (!botData) return;
      setBot(botData);

      const { data: cat } = await supabase.from('categories').select('*').eq('id', botData.category_id).single();
      setCategory(cat);

      try {
        const res = await fetch('/api/analytics?botAlias=' + slug);
        const json = await res.json();
        setActivity(json.stats || null);
      } catch {}
    }

    fetchBotData();
  }, [slug]);

  if (!bot) return <Layout><p>Loading...</p></Layout>;

  const seoTitle = `${bot.emoji || '🤖'} ${bot.name} — AI Chatbot Companion`;
  const seoDesc = bot.tagline || bot.description || 'Chat with this AI companion for fun, insight, and creativity.';
  const seoImage = bot.image_url || '/default-og.png';
  const seoUrl = `https://chatbotcity.ai/bot/${bot.alias}`;

  return (
    <Layout>
      <HeadMeta title={seoTitle} description={seoDesc} image={seoImage} url={seoUrl} />
      <Breadcrumbs category={category} />

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-5xl">{bot.emoji}</span>
          <h1 className="text-4xl font-bold">{bot.name}</h1>
        </div>
        <p className="text-lg text-gray-600 italic mb-4">{bot.tagline}</p>

        {activity && (
          <div className="flex items-center gap-4 mb-6 text-sm">
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
              💬 {activity.messages_24h} chats
            </div>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              👥 {activity.users_24h} users
            </div>
          </div>
        )}

        <ChatInterface botAlias={bot.alias} botName={bot.name} botEmoji={bot.emoji} />

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-lg">
          <p className="text-gray-800">{bot.description}</p>
        </div>
      </div>
    </Layout>
  );
}
