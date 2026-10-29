import { Quiz } from '@/components/Quiz';

export const metadata = { title: 'Jogar' };

export default function Jogar() {
  return (
    <div className="pagina container">
      <header className="pagina__cabecalho">
        <h1 className="pagina__titulo">Quiz Mito ou Verdade</h1>
        <p className="pagina__intro">Quanto você sabe sobre a saúde dos pets? Responda e entre no ranking.</p>
      </header>
      <Quiz />
    </div>
  );
}
