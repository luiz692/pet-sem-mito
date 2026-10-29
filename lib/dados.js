// Regras do site e acesso ao banco. As rotas da API só chamam estas funções.

import { banco } from './db';

export const VEREDITOS = ['MITO', 'VERDADE'];
const FASES = ['fora', 'espera', 'votacao', 'resultado', 'fim'];

export class ErroDeUso extends Error {
  constructor(mensagem, status = 400) {
    super(mensagem);
    this.status = status;
  }
}

function maiuscula(t) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function texto(valor, { campo, max, obrigatorio = false }) {
  const t = typeof valor === 'string' ? valor.trim() : '';
  if (obrigatorio && !t) throw new ErroDeUso(`Preencha ${campo}.`);
  if (t.length > max) throw new ErroDeUso(`${maiuscula(campo)} passou do limite de ${max} caracteres.`);
  return t;
}

function inteiro(valor, { min, max, padrao }) {
  const n = Number.parseInt(valor, 10);
  if (!Number.isInteger(n)) return padrao;
  return Math.min(max, Math.max(min, n));
}

function idValido(id) {
  const n = Number.parseInt(id, 10);
  if (!Number.isInteger(n) || n < 1) throw new ErroDeUso('Item não encontrado.', 404);
  return n;
}

/* ---------- Mitos e verdades ---------- */

const CAMPOS_MITO = 'id, categoria, afirmacao, veredito, explicacao, na_pratica, publicado, ordem_show';

export async function listarMitos({ incluirOcultos = false } = {}) {
  const { sql } = await banco();
  return sql(
    `SELECT ${CAMPOS_MITO} FROM mitos ${incluirOcultos ? '' : 'WHERE publicado'}
     ORDER BY ordem_show NULLS LAST, categoria, id`,
  );
}

export async function sortearMitos(quantidade) {
  const { sql } = await banco();
  const qtd = inteiro(quantidade, { min: 1, max: 30, padrao: 8 });
  return sql(`SELECT ${CAMPOS_MITO} FROM mitos WHERE publicado ORDER BY random() LIMIT $1`, [qtd]);
}

function validarMito(entrada = {}) {
  const veredito = String(entrada.veredito ?? '').toUpperCase();
  if (!VEREDITOS.includes(veredito)) throw new ErroDeUso('Escolha se a afirmação é mito ou verdade.');

  let ordem = entrada.ordem_show;
  if (ordem === '' || ordem === null || ordem === undefined) {
    ordem = null;
  } else {
    ordem = Number.parseInt(ordem, 10);
    if (!Number.isInteger(ordem) || ordem < 1 || ordem > 99) {
      throw new ErroDeUso('A ordem no teatro precisa ser um número de 1 a 99, ou ficar vazia.');
    }
  }

  return [
    texto(entrada.categoria, { campo: 'o tema', max: 40, obrigatorio: true }),
    texto(entrada.afirmacao, { campo: 'a afirmação', max: 220, obrigatorio: true }),
    veredito,
    texto(entrada.explicacao, { campo: 'a explicação', max: 1200, obrigatorio: true }),
    texto(entrada.na_pratica, { campo: 'o texto "na prática"', max: 600 }),
    entrada.publicado !== false,
    ordem,
  ];
}

export async function criarMito(entrada) {
  const valores = validarMito(entrada);
  const { sql } = await banco();
  const [mito] = await sql(
    `INSERT INTO mitos (categoria, afirmacao, veredito, explicacao, na_pratica, publicado, ordem_show)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ${CAMPOS_MITO}`,
    valores,
  );
  return mito;
}

export async function atualizarMito(id, entrada) {
  const valores = validarMito(entrada);
  const { sql } = await banco();
  const [mito] = await sql(
    `UPDATE mitos SET categoria = $1, afirmacao = $2, veredito = $3, explicacao = $4,
       na_pratica = $5, publicado = $6, ordem_show = $7
     WHERE id = $8 RETURNING ${CAMPOS_MITO}`,
    [...valores, idValido(id)],
  );
  if (!mito) throw new ErroDeUso('Esse mito ou verdade não existe mais.', 404);
  return mito;
}

export async function excluirMito(id) {
  const { sql } = await banco();
  const apagados = await sql('DELETE FROM mitos WHERE id = $1 RETURNING id', [idValido(id)]);
  if (!apagados.length) throw new ErroDeUso('Esse mito ou verdade não existe mais.', 404);
}

/* ---------- Teatro ao vivo ---------- */

export async function estadoAoVivo(participante = '') {
  const { sql } = await banco();
  const p = typeof participante === 'string' ? participante.slice(0, 64) : '';
  const [e] = await sql(
    `SELECT a.fase, a.mito_id, a.atualizado_em,
       m.categoria, m.afirmacao, m.veredito, m.explicacao, m.na_pratica,
       (SELECT count(*)::int FROM votos v WHERE v.mito_id = a.mito_id AND v.voto = 'MITO') AS votos_mito,
       (SELECT count(*)::int FROM votos v WHERE v.mito_id = a.mito_id AND v.voto = 'VERDADE') AS votos_verdade,
       (SELECT v.voto FROM votos v WHERE v.mito_id = a.mito_id AND v.participante = $1) AS meu_voto,
       (SELECT count(*)::int FROM votos v JOIN mitos mm ON mm.id = v.mito_id
          WHERE v.participante = $1 AND v.voto = mm.veredito) AS meus_acertos,
       (SELECT count(*)::int FROM votos v WHERE v.participante = $1) AS minhas_respostas,
       (SELECT count(DISTINCT v.participante)::int FROM votos v) AS participantes,
       (SELECT count(*)::int FROM votos v JOIN mitos mm ON mm.id = v.mito_id
          WHERE v.voto = mm.veredito) AS acertos_plateia,
       (SELECT count(*)::int FROM votos v) AS votos_plateia,
       (SELECT coalesce(json_agg(r.id ORDER BY r.ordem_show, r.id), '[]'::json)
          FROM mitos r WHERE r.ordem_show IS NOT NULL) AS rodadas
     FROM ao_vivo a LEFT JOIN mitos m ON m.id = a.mito_id
     WHERE a.id = 1`,
    [p],
  );

  const rodadas = Array.isArray(e.rodadas) ? e.rodadas : JSON.parse(e.rodadas || '[]');
  const posicao = e.mito_id ? rodadas.indexOf(e.mito_id) : -1;
  const revelado = e.fase === 'resultado';
  const temPergunta = e.mito_id && (e.fase === 'votacao' || e.fase === 'resultado');

  return {
    fase: e.fase,
    atualizadoEm: e.atualizado_em,
    rodada: temPergunta && posicao >= 0 ? { numero: posicao + 1, total: rodadas.length } : null,
    totalRodadas: rodadas.length,
    mito: temPergunta
      ? {
          id: e.mito_id,
          categoria: e.categoria,
          afirmacao: e.afirmacao,
          ...(revelado ? { veredito: e.veredito, explicacao: e.explicacao, na_pratica: e.na_pratica } : {}),
        }
      : null,
    votos: temPergunta
      ? { MITO: e.votos_mito, VERDADE: e.votos_verdade, total: e.votos_mito + e.votos_verdade }
      : null,
    meuVoto: temPergunta ? e.meu_voto : null,
    placar: { acertos: e.meus_acertos, respondidas: e.minhas_respostas },
    plateia: { participantes: e.participantes, acertos: e.acertos_plateia, votos: e.votos_plateia },
  };
}

export async function votar({ participante, voto, mitoId }) {
  const p = typeof participante === 'string' ? participante.trim().slice(0, 64) : '';
  if (!p) throw new ErroDeUso('Não foi possível identificar este celular. Recarregue a página.');
  const v = String(voto ?? '').toUpperCase();
  if (!VEREDITOS.includes(v)) throw new ErroDeUso('Escolha mito ou verdade.');

  const { sql } = await banco();
  const gravados = await sql(
    `INSERT INTO votos (mito_id, participante, voto)
     SELECT a.mito_id, $1, $2 FROM ao_vivo a
     WHERE a.id = 1 AND a.fase = 'votacao' AND a.mito_id = $3
     ON CONFLICT (mito_id, participante) DO UPDATE SET voto = EXCLUDED.voto, criado_em = now()
     RETURNING voto`,
    [p, v, idValido(mitoId)],
  );
  if (!gravados.length) throw new ErroDeUso('A votação desta rodada já foi encerrada.', 409);
  return { voto: gravados[0].voto };
}

export async function controlarShow({ acao, mitoId }) {
  const { transacao } = await banco();
  return transacao(async (sql) => {
    const [atual] = await sql('SELECT fase, mito_id FROM ao_vivo WHERE id = 1 FOR UPDATE');
    const rodadas = (
      await sql('SELECT id FROM mitos WHERE ordem_show IS NOT NULL ORDER BY ordem_show, id')
    ).map((r) => r.id);

    const mudar = (fase, mito) =>
      sql('UPDATE ao_vivo SET fase = $1, mito_id = $2, atualizado_em = now() WHERE id = 1', [fase, mito]);

    switch (acao) {
      case 'iniciar':
        await mudar('espera', null);
        break;
      case 'abrir': {
        const id = idValido(mitoId);
        const [existe] = await sql('SELECT id FROM mitos WHERE id = $1', [id]);
        if (!existe) throw new ErroDeUso('Essa afirmação não existe mais.', 404);
        await mudar('votacao', id);
        break;
      }
      case 'proxima': {
        if (!rodadas.length) throw new ErroDeUso('Nenhuma afirmação está marcada para o teatro.');
        const posicao = atual.mito_id ? rodadas.indexOf(atual.mito_id) : -1;
        const proxima = rodadas[posicao + 1];
        if (proxima) await mudar('votacao', proxima);
        else await mudar('fim', atual.mito_id);
        break;
      }
      case 'revelar':
        if (atual.fase !== 'votacao' || !atual.mito_id) throw new ErroDeUso('Não há votação aberta para revelar.');
        await mudar('resultado', atual.mito_id);
        break;
      case 'espera':
        await mudar('espera', atual.mito_id);
        break;
      case 'encerrar':
        await mudar('fim', atual.mito_id);
        break;
      case 'desligar':
        await mudar('fora', null);
        break;
      case 'zerar':
        await sql('DELETE FROM votos');
        break;
      default:
        throw new ErroDeUso('Ação desconhecida.');
    }
    return { ok: true };
  });
}

export function faseValida(fase) {
  return FASES.includes(fase);
}

/* ---------- Quiz e ranking ---------- */

export async function salvarPartida(entrada = {}) {
  const apelido = texto(entrada.apelido, { campo: 'o apelido', max: 24, obrigatorio: true });
  const total = inteiro(entrada.total, { min: 1, max: 30, padrao: 1 });
  const acertos = inteiro(entrada.acertos, { min: 0, max: total, padrao: 0 });
  const pontos = inteiro(entrada.pontos, { min: 0, max: total * 200, padrao: 0 });

  const { sql } = await banco();
  const [partida] = await sql(
    `INSERT INTO partidas (apelido, pontos, acertos, total) VALUES ($1, $2, $3, $4)
     RETURNING id, apelido, pontos, acertos, total, criado_em`,
    [apelido, pontos, acertos, total],
  );
  const [{ posicao }] = await sql(
    `SELECT count(*)::int + 1 AS posicao FROM partidas
     WHERE pontos > $1 OR (pontos = $1 AND criado_em < $2)`,
    [pontos, partida.criado_em],
  );
  return { ...partida, posicao };
}

export async function ranking(limite = 10) {
  const { sql } = await banco();
  return sql(
    `SELECT id, apelido, pontos, acertos, total, criado_em FROM partidas
     ORDER BY pontos DESC, criado_em ASC LIMIT $1`,
    [inteiro(limite, { min: 1, max: 100, padrao: 10 })],
  );
}

export async function zerarRanking() {
  const { sql } = await banco();
  await sql('DELETE FROM partidas');
}

/* ---------- Pergunte ao vet ---------- */

const ESPECIES = ['Cão', 'Gato', 'Outro'];

export async function enviarPergunta(entrada = {}) {
  const nome = texto(entrada.nome, { campo: 'o nome', max: 60 });
  const especie = ESPECIES.includes(entrada.especie) ? entrada.especie : null;
  const pergunta = texto(entrada.pergunta, { campo: 'a pergunta', max: 600, obrigatorio: true });
  if (pergunta.length < 10) throw new ErroDeUso('Conte um pouco mais da sua dúvida (pelo menos 10 caracteres).');

  const { sql } = await banco();
  const [nova] = await sql(
    `INSERT INTO perguntas (nome, especie, pergunta) VALUES ($1, $2, $3) RETURNING id, criado_em`,
    [nome || null, especie, pergunta],
  );
  return nova;
}

export async function perguntasPublicadas() {
  const { sql } = await banco();
  return sql(
    `SELECT id, nome, especie, pergunta, resposta, respondida_em FROM perguntas
     WHERE publicada AND coalesce(resposta, '') <> ''
     ORDER BY respondida_em DESC NULLS LAST, id DESC LIMIT 50`,
  );
}

export async function todasPerguntas() {
  const { sql } = await banco();
  return sql(
    `SELECT id, nome, especie, pergunta, resposta, publicada, criado_em, respondida_em FROM perguntas
     ORDER BY (coalesce(resposta, '') = '') DESC, criado_em DESC LIMIT 300`,
  );
}

export async function responderPergunta(id, entrada = {}) {
  const resposta = texto(entrada.resposta, { campo: 'a resposta', max: 2000 });
  const publicada = Boolean(entrada.publicada) && resposta !== '';
  const { sql } = await banco();
  const [atualizada] = await sql(
    `UPDATE perguntas SET resposta = $1, publicada = $2,
       respondida_em = CASE WHEN $3::boolean THEN coalesce(respondida_em, now()) ELSE NULL END
     WHERE id = $4
     RETURNING id, nome, especie, pergunta, resposta, publicada, criado_em, respondida_em`,
    [resposta || null, publicada, resposta !== '', idValido(id)],
  );
  if (!atualizada) throw new ErroDeUso('Essa pergunta não existe mais.', 404);
  return atualizada;
}

export async function excluirPergunta(id) {
  const { sql } = await banco();
  const apagadas = await sql('DELETE FROM perguntas WHERE id = $1 RETURNING id', [idValido(id)]);
  if (!apagadas.length) throw new ErroDeUso('Essa pergunta não existe mais.', 404);
}
