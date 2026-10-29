import { votar } from '@/lib/dados';
import { json, lerCorpo, rota } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const POST = rota(async (req) => json(await votar(await lerCorpo(req))));
