import { withAllowedUsers } from '@/pages/api/auth/auth-helpers';
import { Octokit } from '@octokit/rest';

async function handler(req, res) {
  const { id, date } = req.body;
  if (!id || !date) {
    return res.status(400).json({ error: 'ID e data são obrigatórios.' });
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner = 'taos-thiagoaos';
  const repo = 'promocoes';
  const jsonFileName = `anuncios-${date}.json`;
  const jsonPath = `data/${jsonFileName}`;

  try {
    const { data: fileData } = await octokit.repos.getContent({
      owner,
      repo,
      path: jsonPath,
    });

    const promos = JSON.parse(Buffer.from(fileData.content, 'base64').toString());
    const updatedPromos = promos.filter(promo => promo.id !== id);

    if (promos.length === updatedPromos.length) {
      return res.status(404).json({ error: `Anúncio com ID ${id} não encontrado.` });
    }

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: jsonPath,
      message: `[BOT] Apaga anúncio: ${id}`,
      content: Buffer.from(JSON.stringify(updatedPromos, null, 2)).toString('base64'),
      sha: fileData.sha,
      branch: 'main',
    });

    res.status(200).json({ message: 'Anúncio apagado com sucesso!' });
  } catch (error) {
    console.error('Erro ao apagar anúncio no GitHub:', error);
    res.status(500).json({ error: 'Falha ao apagar anúncio no GitHub.' });
  }
}

export default withAllowedUsers(handler);