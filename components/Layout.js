import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-br from-indigo-950 via-purple-950 to-purple-900'>
      <Header />
      <main className='flex-1 container mx-auto p-6'>{children}</main>
      <Footer />
    </div>
  );
}