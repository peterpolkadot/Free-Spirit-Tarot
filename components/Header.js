
export default function Header() {
  return (
    <header className='bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 text-white py-6 shadow-lg'>
      <div className='container mx-auto flex justify-center'>
        <a href='/' className='text-2xl font-bold tracking-wide flex items-center gap-2'>
          <span className='text-3xl'>🔮</span>
          <span>Free Spirit Tarot</span>
        </a>
      </div>
    </header>
  );
}
