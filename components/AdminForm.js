import { useState } from 'react';

export default function AdminForm() {
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    link: '',
    image: null,
    startDate: '',
    endDate: '',
  });
  const [status, setStatus] = useState({ message: '', error: false });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result })); // reader.result is the base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ message: '', error: false });

    try {
      const response = await fetch('/api/add-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocorreu um erro ao enviar o anúncio.');
      }
      
      setStatus({ message: 'Anúncio adicionado com sucesso! O site será reconstruído em breve.', error: false });
      setFormData({ title: '', text: '', link: '', image: null, startDate: '', endDate: '' });
      e.target.reset(); // Limpa o campo de arquivo
    } catch (err) {
      setStatus({ message: err.message, error: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título do Anúncio</label>
        <input type="text" name="title" id="title" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" onChange={handleInputChange} value={formData.title} />
      </div>
      <div>
        <label htmlFor="text" className="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea name="text" id="text" rows="4" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" onChange={handleInputChange} value={formData.text}></textarea>
      </div>
      <div>
        <label htmlFor="link" className="block text-sm font-medium text-gray-700">Link da Oferta</label>
        <input type="url" name="link" id="link" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" onChange={handleInputChange} value={formData.link} />
      </div>
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">Imagem do Produto</label>
        <input type="file" name="image" id="image" required accept="image/png, image/jpeg, image/webp" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" onChange={handleFileChange} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data de Início</label>
          <input type="date" name="startDate" id="startDate" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" onChange={handleInputChange} value={formData.startDate} />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data de Fim</label>
          <input type="date" name="endDate" id="endDate" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" onChange={handleInputChange} value={formData.endDate} />
        </div>
      </div>
      <div>
        <button type="submit" disabled={isLoading} className="w-full btn btn-primary disabled:opacity-50">
          {isLoading ? 'Enviando...' : 'Adicionar Anúncio'}
        </button>
      </div>
      {status.message && (
        <p className={`text-sm ${status.error ? 'text-red-600' : 'text-green-600'}`}>
          {status.message}
        </p>
      )}
    </form>
  );
}