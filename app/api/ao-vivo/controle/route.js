import { controlarShow } from '@/lib/dados';
import { json, lerCorpo, rota } from '@/lib/http';

export const dynamic = 'force-dynamic';

// Ações da equipe: iniciar, abrir (mitoId), proxima, revelar, espera, encerrar, desligar, zerar.
export const POST = rota(async (req) => json(await controlarShow(await lerCorpo(req))));
