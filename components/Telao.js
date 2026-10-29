'use client';

// Tela para projetar no teatro: QR code, votos subindo ao vivo e o veredito.

import { useEffect, useState } from 'react';
import { nomeDoVeredito, porcentagem, useSondagem } from '@/lib/cliente';
import { MENSAGEM_FINAL } from '@/lib/conteudo';
import { Marca } from './Pata';
import { Carimbo } from './Votacao';

function QrCode({ grande = false }) {
  return (
    <div className={`telao__qr${grande ? ' telao__qr--grande' : ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/api/qrcode?formato=svg" alt="QR code para abrir o site no celular" width="400" height="400" />
    </div>
  );
}

function Barras({ votos, veredito }) {
  return (
    <div className="telao__barras">
      {['MITO', 'VERDADE'].map((v) => {
        const n = votos?.[v] ?? 0;
        const pct = porcentagem(n, votos?.total ?? 0);
        const apagada = veredito && veredito !== v;
        return (
          <div key={v} className={`telao__barra telao__barra--${v.toLowerCase()}${apagada ? ' telao__barra--apagada' : ''}`}>
            <div className="telao__barra-topo">
              <span>{nomeDoVeredito(v)}</span>
              <strong>{pct}%</strong>
            </div>
            <div className="telao__barra-trilho">
              <span style={{ width: `${pct}%` }} />
            </div>
            <small>
              {n} {n === 1 ? 'voto' : 'votos'}
            </small>
          </div>
        );
      })}
    </div>
  );
}

export function Telao() {
  const { dados, erro } = useSondagem('/api/ao-vivo', 1500);
  const [endereco, setEndereco] = useState('');
  const [telaCheia, setTelaCheia] = useState(false);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    setEndereco(url.replace(/^https?:\/\//, '').replace(/\/$/, ''));
    const aoMudar = () => setTelaCheia(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', aoMudar);
    return () => document.removeEventListener('fullscreenchange', aoMudar);
  }, []);

  function alternarTelaCheia() {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }

  const fase = dados?.fase ?? 'fora';
  const { mito, rodada, votos, plateia } = dados ?? {};

  let corpo;
  if (!dados) {
    corpo = (
      <div className="telao__corpo telao__corpo--centro">
        <p className="telao__subtitulo">{erro ? 'Sem conexão com o servidor. Tentando de novo…' : 'Carregando…'}</p>
      </div>
    );
  } else if (fase === 'votacao' || fase === 'resultado') {
    const revelado = fase === 'resultado';
    const acertaram = revelado ? porcentagem(votos[mito.veredito], votos.total) : 0;
    corpo = (
      <div className="telao__corpo">
        <div>
          {rodada && (
            <p className="telao__rodada">
              Rodada {rodada.numero} de {rodada.total}, {mito.categoria.toLowerCase()}
            </p>
          )}
          {!revelado ? (
            <>
              <h1 className="telao__afirmacao">{mito.afirmacao}</h1>
              <Barras votos={votos} />
            </>
          ) : (
            <div className="telao__veredito">
              <h1 className="telao__afirmacao" style={{ margin: 0, fontSize: 'clamp(1.6rem, 3vw, 3.4rem)' }}>
                {mito.afirmacao}
              </h1>
              <Carimbo veredito={mito.veredito} />
              <p className="telao__explicacao">{mito.explicacao}</p>
              {votos.total > 0 && <p className="telao__acertos">{acertaram}% da plateia acertou</p>}
            </div>
          )}
        </div>
        <aside className="telao__lateral">
          <QrCode />
          <p className="telao__chamada">{revelado ? 'Ainda não entrou? Aponte a câmera' : 'Vote pelo celular'}</p>
          <p className="telao__url">{endereco}</p>
          <p className="telao__total">
            {votos.total} {votos.total === 1 ? 'voto' : 'votos'}
          </p>
        </aside>
      </div>
    );
  } else if (fase === 'fim') {
    const taxa = porcentagem(plateia.acertos, plateia.votos);
    corpo = (
      <div className="telao__corpo telao__corpo--centro">
        <div>
          <h1 className="telao__titulo">Obrigado!</h1>
          <div className="telao__numeros">
            <div className="telao__numero">
              <strong>{plateia.participantes}</strong>
              <span>{plateia.participantes === 1 ? 'pessoa votou' : 'pessoas votaram'}</span>
            </div>
            <div className="telao__numero">
              <strong>{taxa}%</strong>
              <span>de acertos da plateia</span>
            </div>
          </div>
          <p className="telao__subtitulo" style={{ maxWidth: '30em', marginInline: 'auto' }}>
            {MENSAGEM_FINAL}
          </p>
          <p className="telao__chamada">Continue no site: quiz, mitos e verdades e Pergunte ao vet</p>
          <p className="telao__url">{endereco}</p>
        </div>
      </div>
    );
  } else {
    corpo = (
      <div className="telao__corpo telao__corpo--abertura">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="telao__logo" src="/logo.jpg" alt="Mito e Verdade na Medicina Veterinária" width="600" height="600" />
        <div className="telao__lateral">
          <QrCode grande />
          <p className="telao__chamada">
            {fase === 'espera' ? 'Aponte a câmera e prepare sua placa' : 'Aponte a câmera do celular'}
          </p>
          <p className="telao__url">{endereco}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="telao">
      <div className="telao__topo">
        <Marca />
        {!telaCheia && (
          <button type="button" className="telao__tela-cheia" onClick={alternarTelaCheia}>
            Tela cheia
          </button>
        )}
      </div>
      {corpo}
    </div>
  );
}
