import sharp from 'sharp';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { image } = req.body; // Recebe a imagem em base64

  if (!image) {
    return res.status(400).json({ error: 'A imagem em base64 é obrigatória.' });
  }

  try {
    const imageBuffer = Buffer.from(image.split(',')[1], 'base64');

    const optimizedBuffer = await sharp(imageBuffer)
      .resize({
        width: 1200,
        height: 630,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    // Retorna a imagem otimizada como uma string base64
    const optimizedImage = `data:image/webp;base64,${optimizedBuffer.toString('base64')}`;

    return res.status(200).json({ optimizedImage });

  } catch (error) {
    console.error("Erro ao otimizar a imagem base64:", error);
    return res.status(500).json({ error: 'Falha ao otimizar a imagem.' });
  }
}

export default withAllowedUsers(handler);