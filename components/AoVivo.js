'use client';

// Votação do teatro no celular da plateia.
// variante "pagina": sempre aparece (página /ao-vivo).
// variante "destaque": só aparece no Início enquanto o show está acontecendo.

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { api, idDoParticipante, useSondagem } from '@/lib/cliente';
import { MENSAGEM_FINAL } from '@/lib/conteudo';
import { BarrasVotos, Carimbo, NaPratica, Placas } from './Votacao';

export function AoVivo({ variante = 'pagina' }) {
  const [participante, setParticipante] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [votoLocal, setVotoLocal] = useState(null);
  const [aviso, setAviso] = useState('');
  const ultimaRodada = useRef(null);

  useEffect(() => setParticipante(idDoParticipante()), []);

  const url = participante ? `/api/ao-vivo?p=${encodeURIComponent(participante)}` : null;
  const { dados, erro, atualizar } = useSondagem(url, 2500);

  const mitoId = dados?.mito?.id ?? null;
  const fase = dados?.fase;

  // Vibra o celular quando uma rodada nova abre.
  useEffect(() => {
    if (fase === 'votacao' && mitoId && ultimaRodada.current !== mitoId) {
      if (ultimaRodada.current !== null) navigator.vibrate?.(120);
      setAviso('');
    }
    ultimaRodada.current = mitoId;
  }, [fase, mitoId]);

  if (!dados) {
    if (variante === 'destaque') return null;
    return (
      <section className="aovivo" aria-live="polite">
        <p className="aovivo__espera">{erro ? 'Sem conexão com o show. Tentando de novo…' : 'Conectando ao show…'}</p>
      </section>
    );
  }

  if (variante === 'destaque' && fase === 'fora') return null;

  const meuVoto = votoLocal && votoLocal.mitoId === mitoId ? votoLocal.voto : dados.meuVoto;

  async function votar(voto) {
    if (!mitoId) return;
    setEnviando(true);
    setAviso('');
    setVotoLocal({ mitoId, voto });
    try {
      await api('/api/ao-vivo/voto', { metodo: 'POST', corpo: { participante, voto, mitoId } });
      await atualizar();
    } catch (e) {
      setVotoLocal(null);
      setAviso(e.message);
      atualizar();
    } finally {
      setEnviando(false);
    }
  }

  const classe = `aovivo${variante === 'destaque' ? ' aovivo--destaque' : ''}`;
  const selo = (
    <span className="aovivo__selo">
      <span className="aovivo__ponto" aria-hidden="true" /> Teatro ao vivo
    </span>
  );

  if (fase === 'fora') {
    return (
      <section className={classe}>
        <h2 className="aovivo__afirmacao">Nenhuma votação acontecendo agora</h2>
        <p className="aovivo__espera">
          Quando o teatro começar, as perguntas aparecem aqui. Enquanto isso, teste seus conhecimentos no quiz.
        </p>
        <p style={{ marginTop: 20 }}>
          <Link className="botao botao--sol" href="/jogar">
            Jogar o quiz
          </Link>
        </p>
      </section>
    );
  }

  if (fase === 'espera') {
    return (
      <section className={classe} aria-live="polite">
        {selo}
        <h2 className="aovivo__afirmacao" style={{ marginBottom: 0 }}>
          {dados.placar.respondidas ? 'Prepare-se para a próxima rodada' : 'O show já vai começar'}
        </h2>
        <p className="aovivo__espera">
          Deixe esta tela aberta. Quando a apresentadora chamar a votação, a pergunta aparece aqui e você vota em
          mito ou verdade.
        </p>
      </section>
    );
  }

  if (fase === 'fim') {
    const { acertos, respondidas } = dados.placar;
    return (
      <section className={classe} aria-live="polite">
        {selo}
        <h2 className="aovivo__afirmacao" style={{ marginBottom: 8 }}>
          Obrigado por participar!
        </h2>
        {respondidas > 0 && (
          <>
            <p className="aovivo__placar">
              {acertos} de {respondidas}
            </p>
            <p>{acertos === 1 ? 'acerto' : 'acertos'} nas rodadas do teatro</p>
          </>
        )}
        <p className="aovivo__mensagem">{MENSAGEM_FINAL}</p>
        <div className="botoes" style={{ justifyContent: 'center' }}>
          <Link className="botao botao--sol" href="/jogar">
            Jogar o quiz completo
          </Link>
          <Link className="botao botao--claro" href="/pergunte" style={{ color: 'inherit', borderColor: 'currentColor' }}>
            Mandar uma dúvida
          </Link>
        </div>
      </section>
    );
  }

  const { mito, rodada, votos } = dados;

  return (
    <section className={classe} aria-live="polite">
      {selo}
      {rodada && (
        <p className="aovivo__rodada">
          Rodada {rodada.numero} de {rodada.total}
        </p>
      )}
      <h2 className="aovivo__afirmacao">{mito.afirmacao}</h2>

      {fase === 'votacao' && (
        <>
          <Placas escolhido={meuVoto} aoEscolher={votar} desabilitado={enviando} grande rotulo="Escolha mito ou verdade" />
          <p className={`aovivo__nota${aviso ? ' aovivo__nota--erro' : ''}`} role="status">
            {aviso ||
              (meuVoto
                ? `Voto registrado: ${meuVoto === 'MITO' ? 'mito' : 'verdade'}. Dá para trocar até a votação fechar.`
                : 'Toque na placa para votar.')}
          </p>
        </>
      )}

      {fase === 'resultado' && (
        <div className="aovivo__resultado">
          <Carimbo veredito={mito.veredito} />
          <p className="aovivo__acerto">
            {!meuVoto
              ? 'Você não votou nesta rodada.'
              : meuVoto === mito.veredito
                ? 'Você acertou! 🎉'
                : 'Não foi dessa vez.'}
          </p>
          <div className="aovivo__explicacao">
            <BarrasVotos votos={votos} veredito={mito.veredito} />
            <p>{mito.explicacao}</p>
            <NaPratica texto={mito.na_pratica} />
          </div>
        </div>
      )}
    </section>
  );
}
