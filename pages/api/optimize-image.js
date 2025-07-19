import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Not Found' });
  }

  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: 'O caminho da imagem é obrigatório.' });
  }

  try {
    const imagePath = path.join(process.cwd(), 'public', imageUrl);
    
    // Lê a imagem original para um buffer
    const originalBuffer = await fs.readFile(imagePath);

    // Processa a imagem com o Sharp
    const optimizedBuffer = await sharp(originalBuffer)
      .resize({
        width: 1200, // Largura máxima ideal para Open Graph
        height: 630, // Altura máxima ideal para Open Graph
        fit: 'inside', // Mantém a proporção, cabendo dentro das dimensões
        withoutEnlargement: true, // Não aumenta imagens que já são pequenas
      })
      .webp({ quality: 80 }) // Converte para WebP com 80% de qualidade
      .toBuffer();

    // Sobrescreve o arquivo original com a versão otimizada
    await fs.writeFile(imagePath, optimizedBuffer);

    return res.status(200).json({ message: 'Imagem otimizada com sucesso!' });

  } catch (error) {
    console.error("Erro ao otimizar a imagem:", error);
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: `Arquivo de imagem não encontrado em: ${imageUrl}` });
    }
    return res.status(500).json({ error: 'Falha ao otimizar a imagem.' });
  }
}