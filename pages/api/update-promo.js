import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Not Found' });
  }

  const { id, date, newText } = req.body;

  if (!id || !date || !newText) {
    return res.status(400).json({ error: 'ID, data e novo texto são obrigatórios.' });
  }

  try {
    const dataDirectory = path.join(process.cwd(), 'data');
    const fileName = `anuncios-${date}.json`;
    const filePath = path.join(dataDirectory, fileName);

    // Verifica se o arquivo existe
    try {
      await fs.access(filePath);
    } catch (e) {
      return res.status(404).json({ error: `Arquivo não encontrado: ${fileName}` });
    }
    
    const fileContents = await fs.readFile(filePath, 'utf8');
    const promos = JSON.parse(fileContents);

    let promoFound = false;
    const updatedPromos = promos.map(promo => {
      if (promo.id === id) {
        promoFound = true;
        return { ...promo, text: newText };
      }
      return promo;
    });

    if (!promoFound) {
      return res.status(404).json({ error: `Promoção com ID '${id}' não encontrada no arquivo.` });
    }

    // Escreve de volta no arquivo com formatação bonita (2 espaços de indentação)
    await fs.writeFile(filePath, JSON.stringify(updatedPromos, null, 2));

    return res.status(200).json({ message: 'Texto do anúncio atualizado com sucesso!' });

  } catch (error) {
    console.error("Erro ao atualizar o arquivo JSON:", error);
    return res.status(500).json({ error: 'Falha ao atualizar o arquivo no servidor.' });
  }
}