'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Marca } from './Pata';

const LINKS = [
  { href: '/', rotulo: 'Início' },
  { href: '/jogar', rotulo: 'Jogar' },
  { href: '/mitos', rotulo: 'Mitos e verdades' },
  { href: '/pergunte', rotulo: 'Pergunte ao vet' },
];

export function Cabecalho() {
  const caminho = usePathname();
  return (
    <header className="topo">
      <div className="container topo__linha">
        <Marca />
        <nav className="topo__nav" aria-label="Páginas do site">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="topo__link"
              aria-current={caminho === l.href ? 'page' : undefined}
            >
              {l.rotulo}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
