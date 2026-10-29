import { Equipe } from '@/components/Equipe';

export const metadata = { title: 'Área da equipe', robots: { index: false } };

export default function PaginaEquipe() {
  return (
    <div className="pagina container">
      <header className="pagina__cabecalho">
        <h1 className="pagina__titulo">Área da equipe</h1>
      </header>
      <p className="aviso-equipe">
        Esta área não tem senha. Compartilhe o endereço só com o grupo e use no celular da assistente de palco para
        controlar as rodadas do teatro.
      </p>
      <Equipe />
    </div>
  );
}
