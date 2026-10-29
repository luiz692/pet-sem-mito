import { Biblioteca } from '@/components/Biblioteca';

export const metadata = { title: 'Mitos e verdades' };

export default function Mitos() {
  return (
    <div className="pagina container">
      <header className="pagina__cabecalho">
        <h1 className="pagina__titulo">Mitos e verdades</h1>
        <p className="pagina__intro">
          O que tem base científica, o que depende de cada animal e o que pode colocar o seu pet em risco.
        </p>
      </header>
      <Biblioteca />
    </div>
  );
}
