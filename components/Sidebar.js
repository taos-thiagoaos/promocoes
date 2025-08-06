import Link from 'next/link';
import Image from 'next/image';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function Sidebar({ links, anuncios, stores }) {
  const createMarkup = (text) => ({ __html: text ? text.replace(/\n/g, '<br />') : '' });

  return (
    <aside className="w-full lg:w-1/4 lg:pl-8 mt-8 lg:mt-0">
      <div className="sticky top-8">
        {/* Bloco de Destaques */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <h3 className="font-bold text-xl mb-4 border-b pb-2">Destaques</h3>
          {anuncios.map((anuncio) => (
            <div key={anuncio.id} className="mb-4 last:mb-0">
              <Image
                src={`${basePath}${anuncio.imageUrl}`}
                alt={anuncio.title}
                width={256}
                height={256}
                className="rounded-lg mb-2"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    'https://placehold.co/400x400/ef4444/ffffff?text=Imagem+Indisponível';
                }}
              />
              <h4 className="font-semibold text-gray-800">{anuncio.title}</h4>
              <p
                className="text-sm text-gray-600 mb-2"
                dangerouslySetInnerHTML={createMarkup(anuncio.text)}
              />
              <a
                href={anuncio.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-brand-primary hover:underline"
              >
                Ver agora &rarr;
              </a>
            </div>
          ))}
        </div>

        {/* Bloco de Lojas */}
        {stores && stores.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h3 className="font-bold text-xl mb-4 border-b pb-2">Lojas</h3>
            <ul>
              {stores.map((store) => (
                <li key={store} className="mb-2 last:mb-0">
                  <Link
                    href={`/loja/${encodeURIComponent(store.toLowerCase())}`}
                    className="flex items-center p-2 rounded-md text-gray-700 hover:bg-surface-100 hover:text-brand-primary transition-colors"
                  >
                    <span className="mr-2">🛍️</span>
                    {store}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Bloco de Links Fixos */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="font-bold text-xl mb-4 border-b pb-2">Links Úteis</h3>
          <ul>
            {links.map((link) => (
              <li key={link.title} className="mb-2 last:mb-0">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-2 rounded-md text-gray-700 hover:bg-surface-100 hover:text-brand-primary transition-colors"
                >
                  <span className="mr-2">🔗</span>
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
