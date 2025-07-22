import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: 'O caminho da imagem é obrigatório.' });
  }

  try {
    const imagePath = path.join(process.cwd(), 'public', imageUrl);
    
    const originalBuffer = await fs.readFile(imagePath);

    const optimizedBuffer = await sharp(originalBuffer)
      .resize({
        width: 1200,
        height: 630,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

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