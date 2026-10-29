import { criarMito, listarMitos, sortearMitos } from '@/lib/dados';
import { restaurarConteudoOriginal } from '@/lib/db';
import { json, lerCorpo, rota } from '@/lib/http';

export const dynamic = 'force-dynamic';

// ?sortear=8 devolve afirmações aleatórias (quiz); ?todos=1 inclui as não publicadas (equipe).
export const GET = rota(async (req) => {
  const params = new URL(req.url).searchParams;
  if (params.has('sortear')) return json(await sortearMitos(params.get('sortear')));
  return json(await listarMitos({ incluirOcultos: params.get('todos') === '1' }));
});

export const POST = rota(async (req) => {
  const corpo = await lerCorpo(req);
  if (corpo.acao === 'restaurar') {
    await restaurarConteudoOriginal();
    return json({ ok: true });
  }
  return json(await criarMito(corpo), 201);
});
