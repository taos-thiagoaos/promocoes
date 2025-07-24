
import { useState } from 'react';
import { scrapeAmazonUrl } from '@/services/adminApi';

export default function ScrapeAmazonForm({ onScrapeSuccess, onLoading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    onLoading(true);

    try {
      const data = await scrapeAmazonUrl(url);

      onScrapeSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Obter dados da Amazon</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label htmlFor="amazon-url" className="block text-sm font-medium text-gray-700">URL do Produto Amazon</label>
          <input
            type="url"
            id="amazon-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="https://www.amazon.com.br/..."
          />
        </div>
        <button type="submit" className="w-full btn btn-primary">
          Preparar Anúncio
        </button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}
