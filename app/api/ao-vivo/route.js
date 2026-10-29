import { estadoAoVivo } from '@/lib/dados';
import { json, rota } from '@/lib/http';

export const dynamic = 'force-dynamic';

// Estado da votação do teatro. ?p=<id do celular> traz o voto e o placar de quem pergunta.
export const GET = rota(async (req) => {
  const participante = new URL(req.url).searchParams.get('p') || '';
  return json(await estadoAoVivo(participante));
});
