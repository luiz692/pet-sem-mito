import { excluirPergunta, responderPergunta } from '@/lib/dados';
import { json, lerCorpo, rota } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const PUT = rota(async (req, { params }) => {
  const { id } = await params;
  return json(await responderPergunta(id, await lerCorpo(req)));
});

export const DELETE = rota(async (_req, { params }) => {
  const { id } = await params;
  await excluirPergunta(id);
  return json({ ok: true });
});
