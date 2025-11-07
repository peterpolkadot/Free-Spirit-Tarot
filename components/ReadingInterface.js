import { useState } from 'react';

export default function ReadingInterface({ readerAlias, readerName, readerEmoji, popularSpreads }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSpread, setSelectedSpread] = useState('');

  const spreadsArray = popularSpreads ? popularSpreads.split(',').map(s => s.trim()) : [];

  const getReading = async () => {
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    try {
      const response = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question,
          readerAlias: readerAlias,
          spreadType: selectedSpread || null
        })
      });

      const data = await response.json();

      if (data.reading) {
        setMessages(prev => [...prev, { role: 'reader', content: data.reading }]);
      } else {
        setMessages(prev => [...prev, { role: 'reader', content: 'The cards are unclear. Please try again.' }]);
      }
    } catch (error) {
      console.error('Reading error:', error);
      setMessages(prev => [...prev, { role: 'reader', content: 'Sorry, the connection to the spirit realm was interrupted.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      getReading();
    }
  };

  return (
    <div className='bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 border-2 border-purple-400 rounded-xl overflow-hidden shadow-2xl'>
      {/* Reading Header */}
      <div className='bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4'>
        <div className='flex items-center gap-3'>
          <span className='text-3xl'>{readerEmoji}</span>
          <div>
            <h3 className='font-semibold text-lg'>{readerName}</h3>
            <p className='text-xs text-purple-100'>Ask your question and receive guidance...</p>
          </div>
        </div>
      </div>

      {/* Spread Selector */}
      {spreadsArray.length > 0 && (
        <div className='bg-purple-800 bg-opacity-50 p-3 border-b border-purple-600'>
          <label className='text-xs text-purple-200 block mb-2'>Choose a spread (optional):</label>
          <div className='flex flex-wrap gap-2'>
            <button
              onClick={() => setSelectedSpread('')}
              className={'px-3 py-1 text-xs rounded-full transition-colors ' + (!selectedSpread ? 'bg-purple-500 text-white' : 'bg-purple-700 text-purple-200 hover:bg-purple-600')}
            >
              General
            </button>
            {spreadsArray.map((spread, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSpread(spread)}
                className={'px-3 py-1 text-xs rounded-full transition-colors ' + (selectedSpread === spread ? 'bg-purple-500 text-white' : 'bg-purple-700 text-purple-200 hover:bg-purple-600')}
              >
                {spread}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className='h-96 overflow-y-auto p-4 space-y-4 bg-purple-900 bg-opacity-30'>
        {messages.length === 0 && (
          <div className='text-center text-purple-200 py-12'>
            <p className='text-5xl mb-3'>{readerEmoji}</p>
            <p className='text-lg mb-2'>Welcome, seeker.</p>
            <p className='text-sm text-purple-300'>Ask {readerName} your question...</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={'flex ' + (msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={'max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-lg ' + (msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white')}>
              <p className='text-sm whitespace-pre-wrap leading-relaxed'>{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className='flex justify-start'>
            <div className='bg-gradient-to-br from-indigo-500 to-purple-500 px-4 py-3 rounded-lg shadow-lg'>
              <p className='text-sm text-white animate-pulse'>✨ Consulting the cards...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className='border-t-2 border-purple-600 p-4 bg-purple-800 bg-opacity-50'>
        <div className='flex gap-2'>
          <input
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='What guidance do you seek?'
            className='flex-1 px-4 py-2 bg-purple-900 border border-purple-500 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400'
            disabled={loading}
          />
          <button
            onClick={getReading}
            disabled={loading || !input.trim()}
            className='px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all shadow-lg'
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}