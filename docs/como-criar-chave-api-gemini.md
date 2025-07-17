Como Configurar sua Chave da API do Gemini
Para que a funcionalidade de geração de texto com IA funcione, você precisa fornecer sua própria chave da API do Google Gemini. Siga estes passos:

⚠️ Aviso de Segurança Importante!
Este método fará com que sua chave da API fique visível no código-fonte do seu site no navegador. Para proteger sua conta contra uso indevido:

Restrinja sua Chave: Acesse o console do Google Cloud, encontre sua chave e, em "Restrições de aplicativos", selecione "Sites" e adicione o endereço do seu site: taos-thiagoaos.github.io. Isso impedirá que a chave seja usada em outros domínios.

Monitore o Uso: Crie alertas de orçamento na sua conta do Google Cloud para ser notificado caso o uso da API exceda o esperado.

Passo 1: Obter sua Chave da API
Vá para o Google AI Studio.

Faça login com sua conta do Google.

Clique em "Create API key in new project" (Criar chave de API em um novo projeto).

Copie a chave gerada. Ela se parecerá com AIzaSy....

Passo 2: Configurar para Desenvolvimento Local
Na pasta raiz do seu projeto (promocoes/), crie um arquivo chamado .env.local.

Dentro deste arquivo, adicione a seguinte linha, substituindo SUA_CHAVE_API_AQUI pela chave que você copiou:

NEXT_PUBLIC_GEMINI_API_KEY="SUA_CHAVE_API_AQUI"

Pare o seu servidor de desenvolvimento (se estiver rodando) e inicie-o novamente com npm run dev. O Next.js precisa ser reiniciado para carregar o novo arquivo .env.local.

Passo 3: Configurar para Produção (GitHub Pages)
Para que a chave funcione no site publicado, você precisa adicioná-la aos "Segredos" do seu repositório no GitHub.

No seu repositório GitHub (taos-thiagoaos/promocoes), vá para "Settings" > "Secrets and variables" > "Actions".

Clique em "New repository secret".

No campo "Name", digite exatamente NEXT_PUBLIC_GEMINI_API_KEY.

No campo "Secret", cole a sua chave da API do Gemini.

Clique em "Add secret".

Agora, precisamos dizer à pipeline para usar esse segredo.

3. Workflow do GitHub Actions Atualizado
Eu atualizei o seu arquivo de workflow para que ele passe o segredo para o ambiente de build.

# .github/workflows/deploy.yml

name: Build and Deploy to GitHub Pages

on:
  push:
    branches: [ "main" ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    # Adiciona o segredo como uma variável de ambiente para o build
    env:
      NEXT_PUBLIC_GEMINI_API_KEY: ${{ secrets.NEXT_PUBLIC_GEMINI_API_KEY }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: 'npm'

      - name: Install Dependencies
        run: npm install

      - name: Build and Export
        run: npm run export

      - name: Add .nojekyll file
        run: touch out/.nojekyll

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
