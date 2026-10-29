import Link from 'next/link';

export function Rodape() {
  return (
    <footer className="rodape">
      <div className="container rodape__grade">
        <div className="rodape__aviso">
          <p>
            <strong>Informação também é cuidado.</strong> Conteúdo educativo do projeto paralelo de Medicina
            Veterinária. Ele não substitui a consulta veterinária: em caso de sintomas, suspeita de intoxicação ou
            emergência, procure atendimento veterinário.
          </p>
        </div>
        <nav className="rodape__links" aria-label="Links da equipe">
          <Link href="/equipe">Área da equipe</Link>
          <Link href="/telao">Telão</Link>
        </nav>
      </div>
    </footer>
  );
}
