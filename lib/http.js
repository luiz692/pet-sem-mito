import { ErroDeUso } from './dados';

const SEM_CACHE = { 'Cache-Control': 'no-store' };

export function json(dados, status = 200) {
  return Response.json(dados, { status, headers: SEM_CACHE });
}

export async function lerCorpo(req) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

// Envolve uma rota para devolver erros em JSON com mensagem amigável.
export function rota(fn) {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (erro) {
      if (erro instanceof ErroDeUso) return json({ erro: erro.message }, erro.status);
      console.error('[api]', erro);
      return json({ erro: 'O servidor não conseguiu responder. Tente de novo em instantes.' }, 500);
    }
  };
}
