
import Link from 'next/link';

export default function Breadcrumbs({ category, subcategory }) {
  return (
    <nav className="text-sm text-gray-500 mb-4">
      <ol className="list-reset flex">
        <li><Link href="/">Home</Link></li>
        {category && (
          <>
            <li><span className="mx-2">›</span></li>
            <li><Link href={`/category/${category.slug}`}>{category.category_name}</Link></li>
          </>
        )}
        {subcategory && (
          <>
            <li><span className="mx-2">›</span></li>
            <li><Link href={`/subcategory/${subcategory.slug}`}>{subcategory.subcategory_name}</Link></li>
          </>
        )}
      </ol>
    </nav>
  );
}
