import { Cabecalho } from '@/components/Cabecalho';
import { Rodape } from '@/components/Rodape';

export default function SiteLayout({ children }) {
  return (
    <>
      <Cabecalho />
      <main id="conteudo">{children}</main>
      <Rodape />
    </>
  );
}
