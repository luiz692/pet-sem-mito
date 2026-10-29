import { atualizarMito, excluirMito } from '@/lib/dados';
import { json, lerCorpo, rota } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const PUT = rota(async (req, { params }) => {
  const { id } = await params;
  return json(await atualizarMito(id, await lerCorpo(req)));
});

export const DELETE = rota(async (_req, { params }) => {
  const { id } = await params;
  await excluirMito(id);
  return json({ ok: true });
});
