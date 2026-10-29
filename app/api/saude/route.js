import { banco } from '@/lib/db';
import { json, rota } from '@/lib/http';

export const dynamic = 'force-dynamic';

// Verificação rápida: o site está no ar e o banco responde?
export const GET = rota(async () => {
  const { tipo, sql } = await banco();
  const [{ mitos }] = await sql('SELECT count(*)::int AS mitos FROM mitos');
  return json({ ok: true, banco: tipo, mitos });
});
