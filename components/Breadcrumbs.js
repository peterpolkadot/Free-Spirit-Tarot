import Link from 'next/link';

export default function Breadcrumbs({ category }) {
  return (
    <nav className="text-sm text-purple-300 mb-4">
      <ol className="list-reset flex">
        <li><Link href="/" className="hover:text-purple-100">Home</Link></li>
        {category && (
          <>
            <li><span className="mx-2">›</span></li>
            <li><Link href={`/category/${category.slug}`} className="hover:text-purple-100">{category.category_name}</Link></li>
          </>
        )}
      </ol>
    </nav>
  );
}