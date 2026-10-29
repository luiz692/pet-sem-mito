import { enviarPergunta, perguntasPublicadas, todasPerguntas } from '@/lib/dados';
import { json, lerCorpo, rota } from '@/lib/http';

export const dynamic = 'force-dynamic';

// Sem parâmetros: só as respondidas e publicadas. ?todas=1: todas (equipe).
export const GET = rota(async (req) => {
  const todas = new URL(req.url).searchParams.get('todas') === '1';
  return json(todas ? await todasPerguntas() : await perguntasPublicadas());
});

export const POST = rota(async (req) => json(await enviarPergunta(await lerCorpo(req)), 201));
