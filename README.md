# Estante App

Estante App Ã© um site simples para organizar obras como livros, mangÃ¡s, filmes, sÃ©ries, animes e jogos.  
O projeto permite cadastrar obras, adicionar capa, descriÃ§Ã£o, status e progresso.

## Funcionalidades

- Cadastrar uma nova obra
- Editar uma obra existente
- Remover obra da biblioteca
- Adicionar imagem de capa
- Filtrar por tipo
- Filtrar por status
- Buscar por tÃ­tulo, descriÃ§Ã£o ou progresso
- Salvar os dados no navegador com `localStorage`

## Tecnologias

- HTML
- CSS
- TypeScript
- JavaScript gerado pelo TypeScript
- LocalStorage

## Estrutura Do Projeto

```text
estante-app/
  index.html
  styles.css
  app.ts
  dist/
    app.js
  package.json
  tsconfig.json
```

## Como Rodar

Abra o arquivo `index.html` no navegador.

Se vocÃª estiver usando uma extensÃ£o como Live Server no VS Code, tambÃ©m pode clicar com o botÃ£o direito no `index.html` e escolher:

```text
Open with Live Server
```

## Como Editar O CÃ³digo

O arquivo principal para editar Ã©:

```text
app.ts
```

Depois de alterar o `app.ts`, gere o JavaScript atualizado com:

```bash
npm run build
```

O TypeScript vai criar/atualizar:

```text
dist/app.js
```

O `index.html` usa esse arquivo:

```html
<script src="dist/app.js"></script>
```

## Modo Watch

Para compilar automaticamente enquanto edita:

```bash
npm run watch
```

Assim, sempre que vocÃª salvar o `app.ts`, o TypeScript tenta atualizar o `dist/app.js`.

## Scripts

```bash
npm run build
```

Compila o TypeScript uma vez.

```bash
npm run watch
```

Compila automaticamente enquanto vocÃª desenvolve.

## Dados Salvos

As obras sÃ£o salvas no navegador usando `localStorage`, com a chave:

```text
estante-works-v1
```

Isso significa que os dados ficam salvos no navegador atual. Se vocÃª abrir em outro navegador ou limpar os dados do site, a biblioteca pode aparecer vazia.

## Tipos De Obra

O app suporta:

- Livro
- MangÃ¡
- Filme
- SÃ©rie
- Anime
- Jogo
- Outro

## Status

O app suporta:

- Quero ver/ler
- Em andamento
- Pausado
- Finalizado

## Objetivo Do Projeto

Este projeto foi criado para praticar:

- manipulaÃ§Ã£o do DOM
- formulÃ¡rios
- listas
- filtros
- armazenamento local
- TypeScript bÃ¡sico
- organizaÃ§Ã£o de dados com tipos

## PrÃ³ximas Melhorias PossÃ­veis

- Criar tela de detalhes separada
- Adicionar favoritos
- Melhorar progresso por tipo de obra
- Criar coleÃ§Ãµes/listas personalizadas
- Melhorar responsividade mobile
- Adicionar exportaÃ§Ã£o/importaÃ§Ã£o de dados
- Migrar para React ou React Native futuramente