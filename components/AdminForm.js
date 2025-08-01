import { useState, useEffect } from 'react';
import Anuncio from './Anuncio';
import { AnuncioModel } from '../models/AnuncioModel';

export default function AdminForm({ scrapedData, isLoading, setIsLoading, initialData }) {
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    text: '',
    link: '',
    image: null,
    imageUrl: null,
    imageBase64: null,
    coupon: '',
    startDate: '',
    store: 'AMAZON',
  });
  const [previewData, setPreviewData] = useState(null);
  const [status, setStatus] = useState({ message: '', error: false });

  useEffect(() => {
    if (scrapedData) {
      const data = { ...formData, ...{
        title: scrapedData.title,
        text: scrapedData.description,
        imageBase64: scrapedData.image,
        link: scrapedData.link,
        startDate: new Date().toISOString().split('T')[0],
      }}

      setFormData(data);

      previewDataFromFormData(data);
    }
  }, [scrapedData]);

  useEffect(() => {
    if (initialData) {
      const { date, ...rest } = initialData;
      const data = { ...rest, startDate: date }
      setFormData(data);
      
      previewDataFromFormData(data);
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const previewDataFromFormData = (data) => {
    const promoModel = new AnuncioModel({
      id: data.id,
      title: data.title,
      date: data.startDate,
      text: data.text,
      link: data.link,
      imageUrl: data.image || data.imageBase64 || data.imageUrl,
      coupon: data.coupon,
      store: data.store || 'AMAZON',
    });

    setPreviewData(promoModel);

  }

  const handlePreview = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate) {
      setStatus({ message: 'Título, Data de Início e Imagem são obrigatórios para a pré-visualização.', error: true });
      return;
    }
    previewDataFromFormData(formData);
    setStatus({ message: '', error: false });
  };
  
  const handleUpdatePreview = (updatedFields) => {
    setFormData(prev => ({...prev, ...updatedFields}));
    setPreviewData(prev => new AnuncioModel({...prev, ...updatedFields}));
  }

  const handleSubmit = async () => {
    setIsLoading(true);
    setStatus({ message: '', error: false });

    formData.image = formData.image || formData.imageBase64 || formData.imageUrl;

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
      setFormData({ title: '', text: '', link: '', image: null, imageBase64: null, startDate: '' });
      setPreviewData(null);
      document.getElementById("admin-promo-form").reset();
    } catch (err) {
      setStatus({ message: err.message, error: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">      
      <div>
        <h2 className="text-2xl font-bold mb-4">Formulário</h2>
        <form id="admin-promo-form" onSubmit={handlePreview} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
        {/* Campos do formulário... */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título do Anúncio</label>
          <input type="text" name="title" id="title" value={formData.title} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleInputChange} />
        </div>
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea name="text" id="text" rows="4" value={formData.text} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleInputChange}></textarea>
        </div>
        <div>
          <label htmlFor="link" className="block text-sm font-medium text-gray-700">Link da Oferta</label>
          <input type="url" name="link" id="link" value={formData.link} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleInputChange} />
        </div>
        {(!formData.imageBase64 && !formData.imageUrl) && (
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">Imagem do Produto</label>
            <input type="file" name="image" id="image" required accept="image/png, image/jpeg, image/webp" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" onChange={handleFileChange} />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data</label>
            <input type="date" name="startDate" id="startDate" value={formData.startDate} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleInputChange} />
          </div>
          <div>
            <label htmlFor="coupon" className="block text-sm font-medium text-gray-700">Cupom</label>
            <input type="text" name="coupon" id="coupon" value={formData.coupon} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleInputChange} />
          </div>
        </div>
        <div>
          <button type="submit" disabled={isLoading} className="w-full btn btn-secondary disabled:opacity-50">
            {isLoading ? 'Aguarde...' : 'Pré-visualizar'}
          </button>
        </div>
        {status.message && !previewData && (
          <p className={`text-sm ${status.error ? 'text-red-600' : 'text-green-600'}`}>
            {status.message}
          </p>
        )}
        </form>
      </div>

      <div className="grid grid-cols-1">      
        <h2 className="text-2xl font-bold mb-4">Pré-visualização</h2>
        {previewData && (
          <div>          
            <Anuncio promo={previewData} isPreview={true} onUpdatePreview={handleUpdatePreview} />
            <div className="mt-6">
              <button onClick={handleSubmit} disabled={isLoading} className="w-full btn btn-success disabled:opacity-50">
                {isLoading 
                  ? 'Enviando para o GitHub...' 
                  : formData.id 
                    ? 'Atualizar no GitHub' 
                    : 'Adicionar novo anúncio ao GitHub'}
              </button>
            </div>
            {status.message && (
              <p className={`mt-4 text-sm text-center ${status.error ? 'text-red-600' : 'text-green-600'}`}>
                {status.message}
              </p>
            )}
          </div>
        )}
        </div>
    </div>
  );
}