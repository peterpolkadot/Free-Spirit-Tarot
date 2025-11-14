import Link from 'next/link';

export default function Header() {
  return (
    <header className='py-6 border-b border-purple-800 bg-purple-900/40'>
      <div className='max-w-5xl mx-auto flex justify-between items-center px-4'>
        <Link href='/' className='text-2xl font-bold text-yellow-300'>
          🔮 Free Spirit Tarot
        </Link>

        <nav className='flex gap-6 text-purple-200'>
          <Link href='/readers' className='hover:text-yellow-300 transition'>Readers</Link>
          <Link href='/cards' className='hover:text-yellow-300 transition'>Cards</Link>
        </nav>
      </div>
    </header>
  );
}