import { AoVivo } from '@/components/AoVivo';

export const metadata = { title: 'Votação ao vivo' };

export default function PaginaAoVivo() {
  return (
    <div className="pagina container" style={{ maxWidth: 760 }}>
      <AoVivo variante="pagina" />
    </div>
  );
}
