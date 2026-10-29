import { Pergunte } from '@/components/Pergunte';

export const metadata = { title: 'Pergunte ao vet' };

export default function PaginaPergunte() {
  return (
    <div className="pagina container">
      <header className="pagina__cabecalho">
        <h1 className="pagina__titulo">Pergunte ao vet</h1>
        <p className="pagina__intro">
          Toda dúvida merece resposta. Envie a sua para a equipe do projeto e ajude outros tutores que podem ter a
          mesma dúvida.
        </p>
      </header>
      <Pergunte />
    </div>
  );
}
