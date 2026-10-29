# Pet sem Mito

Site do projeto paralelo de Medicina Veterinária **Mito e Verdade na Medicina Veterinária**, baseado no teatro interativo "Mito ou Verdade Pet" sobre prevenção de doenças e guarda responsável.

> Informação que cuida. Ciência que conecta.

## O que o site faz

| Página | Para quem | O que tem |
| --- | --- | --- |
| `/` Início | Público | Apresentação, teste rápido de mito ou verdade e, durante o teatro, a votação ao vivo no topo |
| `/jogar` | Público | Quiz com 8 afirmações sorteadas, pontuação, bônus por sequência, ranking e botão de desafiar amigos |
| `/mitos` | Público | Todas as afirmações com veredito, explicação e "na prática", com busca e filtro por tema |
| `/pergunte` | Público | Formulário de dúvidas e lista das dúvidas respondidas pela equipe |
| `/ao-vivo` | Plateia | Só a votação do teatro, sem o resto da página |
| `/telao` | Projetor | QR code, votos subindo ao vivo, veredito com explicação e resultado final da plateia |
| `/equipe` | Equipe | Controle das rodadas do teatro, respostas às dúvidas, edição do conteúdo e ranking |

A área da equipe **não tem senha** (o projeto não precisa de segurança). Compartilhe o endereço só com o grupo.

## Como usar no dia do teatro

1. Projete `/telao` (botão "Tela cheia" no canto).
2. A assistente de palco abre `/equipe` no celular e toca em **Iniciar o show**. O público lê o QR code e fica na página inicial.
3. Em cada rodada: **Abrir rodada** → a plateia vota pelo celular → **Fechar votação e revelar** → o telão carimba "É mito!" ou "É verdade!" com a explicação.
4. Depois da última rodada: **Encerrar o show**. O telão mostra quantas pessoas votaram e a taxa de acerto, e cada celular mostra o placar de quem votou.
5. Para ensaiar de novo, use **Zerar votos**. Para voltar o site ao normal, **Tirar do ar**.

O QR code em alta resolução para imprimir fica em `/api/qrcode?baixar=1` (ou no botão "Baixar QR code" da área da equipe).

## Tecnologias

- **Next.js** (front-end e back-end no mesmo projeto: as rotas em `app/api` são a API)
- **PostgreSQL** (Neon) com o driver `pg`
- Hospedagem na **Vercel**

## Banco de dados

As tabelas são criadas sozinhas na primeira vez que o site recebe um acesso, e o conteúdo inicial (as 4 rodadas do roteiro e mais 13 afirmações) é gravado junto.

| Tabela | Guarda |
| --- | --- |
| `mitos` | Afirmações: tema, texto, veredito (`MITO`/`VERDADE`), explicação, "na prática", se está publicada e a ordem no teatro |
| `ao_vivo` | Uma linha com o estado do teatro: fase (`fora`, `espera`, `votacao`, `resultado`, `fim`) e a afirmação da rodada |
| `votos` | Voto de cada celular em cada rodada (um por celular, pode trocar enquanto a votação está aberta) |
| `partidas` | Pontuações salvas no ranking do quiz |
| `perguntas` | Dúvidas enviadas, resposta da equipe e se está publicada |

## API

| Método e rota | Função |
| --- | --- |
| `GET /api/ao-vivo?p=<celular>` | Estado do teatro, votos da rodada e placar do celular |
| `POST /api/ao-vivo/voto` | Registra o voto `{ participante, voto, mitoId }` |
| `POST /api/ao-vivo/controle` | Ações da equipe `{ acao }`: `iniciar`, `abrir` (com `mitoId`), `proxima`, `revelar`, `espera`, `encerrar`, `desligar`, `zerar` |
| `GET /api/mitos` | Afirmações publicadas (`?todos=1` inclui as ocultas, `?sortear=8` sorteia) |
| `POST /api/mitos` · `PUT/DELETE /api/mitos/:id` | Cria, edita e exclui afirmações |
| `GET/POST/DELETE /api/ranking` | Lista, salva e zera o ranking |
| `GET/POST /api/perguntas` · `PUT/DELETE /api/perguntas/:id` | Dúvidas: envio, resposta, publicação e exclusão |
| `GET /api/qrcode` | QR code do site (PNG; `?formato=svg` para o telão) |
| `GET /api/saude` | Verifica se o site e o banco estão respondendo |

## Rodar no computador

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Sem a variável `DATABASE_URL`, o site usa um banco Postgres local que fica na pasta `.banco-local` (não precisa instalar nada). Para usar o banco da Vercel, copie `.env.example` para `.env.local` e preencha `DATABASE_URL`.

## Publicar na Vercel

1. Importe o repositório em vercel.com/new.
2. Em **Storage**, crie um banco **Neon (Postgres)** e conecte ao projeto. A variável `DATABASE_URL` é preenchida sozinha.
3. Faça o deploy (ou um novo deploy, se o banco foi conectado depois do primeiro).

## Aviso

O conteúdo é educativo e não substitui consulta veterinária. Em caso de sintomas, suspeita de intoxicação ou emergência, procure atendimento veterinário.
