import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { imageUrl } = req.body; // ex: /images/anuncios/123-abc.jpeg

  if (!imageUrl) {
    return res.status(400).json({ error: 'A URL da imagem é obrigatória.' });
  }

  try {
    const imagePath = path.join(process.cwd(), 'public', imageUrl);

    try {
      await fs.access(imagePath);
    } catch (e) {
      return res.status(404).json({ error: `Arquivo de imagem não encontrado em: ${imagePath}` });
    }
    
    const imageBuffer = await fs.readFile(imagePath);

    const optimizedBuffer = await sharp(imageBuffer)
      .resize({
        width: 800,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 75 })
      .toBuffer();

    const parsedPath = path.parse(imagePath);
    const newFileName = `${parsedPath.name}.webp`;
    const newImagePath = path.join(parsedPath.dir, newFileName);
    
    await fs.writeFile(newImagePath, optimizedBuffer);

    if (parsedPath.ext.toLowerCase() !== '.webp') {
        await fs.unlink(imagePath);
    }

    const newPublicUrl = path.join(path.dirname(imageUrl), newFileName).replace(/\\/g, '/');

    return res.status(200).json({ optimizedImageUrl: newPublicUrl });

  } catch (error) {
    console.error("Erro ao otimizar a imagem:", error);
    return res.status(500).json({ error: 'Falha ao otimizar a imagem.' });
  }
}

export default withAllowedUsers(handler);