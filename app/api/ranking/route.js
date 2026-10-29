import { ranking, salvarPartida, zerarRanking } from '@/lib/dados';
import { json, lerCorpo, rota } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const GET = rota(async (req) => {
  const limite = new URL(req.url).searchParams.get('limite') || 10;
  return json(await ranking(limite));
});

export const POST = rota(async (req) => json(await salvarPartida(await lerCorpo(req)), 201));

export const DELETE = rota(async () => {
  await zerarRanking();
  return json({ ok: true });
});
