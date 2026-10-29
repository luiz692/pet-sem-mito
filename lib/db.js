// Conexão com o banco.
// - Com DATABASE_URL (Neon/Postgres na Vercel): usa o driver "pg".
// - Sem DATABASE_URL (rodando no computador): usa o PGlite, um Postgres local
//   que grava na pasta .banco-local. Assim dá para rodar sem instalar nada.
// Nos dois casos as tabelas são criadas e o conteúdo inicial é gravado sozinho.

import { MITOS_INICIAIS } from './conteudo';

const cache = globalThis.__petSemMito ?? (globalThis.__petSemMito = {});

function urlDoBanco() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
}

const linhas = (executor) => async (sql, params = []) => (await executor.query(sql, params)).rows;

async function conectarPostgres(url) {
  const mod = await import('pg');
  const Pool = mod.Pool ?? mod.default.Pool;
  const pool = new Pool({ connectionString: url, max: 5, idleTimeoutMillis: 10_000 });
  pool.on('error', (erro) => console.error('[banco] erro na conexão', erro));

  return {
    tipo: 'postgres',
    sql: linhas(pool),
    async transacao(fn) {
      const cliente = await pool.connect();
      try {
        await cliente.query('BEGIN');
        const resultado = await fn(linhas(cliente));
        await cliente.query('COMMIT');
        return resultado;
      } catch (erro) {
        await cliente.query('ROLLBACK').catch(() => {});
        throw erro;
      } finally {
        cliente.release();
      }
    },
  };
}

async function conectarLocal() {
  const { PGlite } = await import('@electric-sql/pglite');
  const naVercel = Boolean(process.env.VERCEL);
  if (naVercel) {
    console.warn('[banco] DATABASE_URL não configurada: usando banco temporário em memória.');
  }
  const db = new PGlite(naVercel ? 'memory://' : process.env.PGLITE_DIR || './.banco-local');
  await db.waitReady;

  return {
    tipo: naVercel ? 'memoria' : 'local',
    sql: linhas(db),
    transacao: (fn) => db.transaction((tx) => fn(linhas(tx))),
  };
}

const TABELAS = [
  `CREATE TABLE IF NOT EXISTS mitos (
    id SERIAL PRIMARY KEY,
    categoria TEXT NOT NULL,
    afirmacao TEXT NOT NULL,
    veredito TEXT NOT NULL CHECK (veredito IN ('MITO', 'VERDADE')),
    explicacao TEXT NOT NULL,
    na_pratica TEXT NOT NULL DEFAULT '',
    publicado BOOLEAN NOT NULL DEFAULT TRUE,
    ordem_show INT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS ao_vivo (
    id INT PRIMARY KEY CHECK (id = 1),
    mito_id INT REFERENCES mitos(id) ON DELETE SET NULL,
    fase TEXT NOT NULL DEFAULT 'fora' CHECK (fase IN ('fora', 'espera', 'votacao', 'resultado', 'fim')),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS votos (
    id SERIAL PRIMARY KEY,
    mito_id INT NOT NULL REFERENCES mitos(id) ON DELETE CASCADE,
    participante TEXT NOT NULL,
    voto TEXT NOT NULL CHECK (voto IN ('MITO', 'VERDADE')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (mito_id, participante)
  )`,
  `CREATE TABLE IF NOT EXISTS partidas (
    id SERIAL PRIMARY KEY,
    apelido TEXT NOT NULL,
    pontos INT NOT NULL,
    acertos INT NOT NULL,
    total INT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS perguntas (
    id SERIAL PRIMARY KEY,
    nome TEXT,
    especie TEXT,
    pergunta TEXT NOT NULL,
    resposta TEXT,
    publicada BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    respondida_em TIMESTAMPTZ
  )`,
  `CREATE INDEX IF NOT EXISTS votos_participante_idx ON votos (participante)`,
  `CREATE INDEX IF NOT EXISTS partidas_pontos_idx ON partidas (pontos DESC, criado_em)`,
];

async function gravarConteudoInicial(sql) {
  for (const m of MITOS_INICIAIS) {
    await sql(
      `INSERT INTO mitos (categoria, afirmacao, veredito, explicacao, na_pratica, ordem_show)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [m.categoria, m.afirmacao, m.veredito, m.explicacao, m.na_pratica, m.ordem_show ?? null],
    );
  }
}

async function preparar(db) {
  await db.transacao(async (sql) => {
    // Trava para que duas instâncias não criem as tabelas ao mesmo tempo.
    await sql('SELECT pg_advisory_xact_lock(7231987)');
    for (const comando of TABELAS) await sql(comando);
    const [{ total }] = await sql('SELECT count(*)::int AS total FROM mitos');
    if (total === 0) await gravarConteudoInicial(sql);
    await sql(`INSERT INTO ao_vivo (id, fase) VALUES (1, 'fora') ON CONFLICT (id) DO NOTHING`);
  });
}

export function banco() {
  if (!cache.pronto) {
    cache.pronto = (async () => {
      const url = urlDoBanco();
      const db = url ? await conectarPostgres(url) : await conectarLocal();
      await preparar(db);
      return db;
    })().catch((erro) => {
      cache.pronto = null;
      throw erro;
    });
  }
  return cache.pronto;
}

// Apaga o conteúdo editado e volta para os textos originais (usado pela Área da equipe).
export async function restaurarConteudoOriginal() {
  const db = await banco();
  await db.transacao(async (sql) => {
    await sql(`UPDATE ao_vivo SET mito_id = NULL, fase = 'fora', atualizado_em = now() WHERE id = 1`);
    await sql('DELETE FROM votos');
    await sql('DELETE FROM mitos');
    await gravarConteudoInicial(sql);
  });
}
