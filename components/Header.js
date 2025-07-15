import Link from 'next/link';

export default function Header({ title }) {
  return (
    <header className="bg-brand-dark shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-white hover:text-gray-200">
              {title}
            </Link>
          </div>
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="text-gray-300 hover:bg-brand-darker hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Promoções
              </Link>
              <Link href="/sobre" className="text-gray-300 hover:bg-brand-darker hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Sobre
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}