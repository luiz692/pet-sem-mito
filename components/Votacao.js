'use client';

// Peças visuais compartilhadas: placas de MITO/VERDADE, carimbo do veredito e barras de votos.

import { nomeDoVeredito, porcentagem } from '@/lib/cliente';

export function Placas({ escolhido = null, aoEscolher, desabilitado = false, grande = false, rotulo = 'Seu voto' }) {
  const classes = ['placas', grande && 'placas--grande', escolhido && 'placas--escolhido'].filter(Boolean);
  return (
    <div className={classes.join(' ')} role="group" aria-label={rotulo}>
      {['MITO', 'VERDADE'].map((v) => (
        <button
          key={v}
          type="button"
          className={`placa placa--${v.toLowerCase()}`}
          aria-pressed={escolhido === v}
          disabled={desabilitado}
          onClick={() => aoEscolher?.(v)}
        >
          <span className="placa__disco">
            <span>
              <span className="placa__marca" aria-hidden="true">
                {v === 'MITO' ? '✕' : '✓'}
              </span>
              {nomeDoVeredito(v)}
            </span>
          </span>
          <span className="placa__cabo" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

export function Carimbo({ veredito }) {
  return (
    <div className={`carimbo carimbo--${veredito.toLowerCase()}`}>
      {veredito === 'MITO' ? 'É mito!' : 'É verdade!'}
    </div>
  );
}

export function BarrasVotos({ votos, veredito }) {
  const total = votos?.total ?? 0;
  return (
    <div className="barras">
      {['MITO', 'VERDADE'].map((v) => {
        const n = votos?.[v] ?? 0;
        const pct = porcentagem(n, total);
        const apagada = veredito && veredito !== v;
        return (
          <div key={v} className={`barra barra--${v.toLowerCase()}${apagada ? ' barra--apagada' : ''}`}>
            <div className="barra__topo">
              <span>{nomeDoVeredito(v)}</span>
              <strong>{pct}%</strong>
            </div>
            <div
              className="barra__trilho"
              role="meter"
              aria-label={`Votos em ${nomeDoVeredito(v)}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
            >
              <div className="barra__preenchimento" style={{ width: `${pct}%` }} />
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

export function NaPratica({ texto }) {
  if (!texto) return null;
  return (
    <div className="na-pratica">
      <strong>Na prática</strong>
      {texto}
    </div>
  );
}

export function EtiquetaVeredito({ veredito }) {
  return (
    <span className={`etiqueta etiqueta--${veredito.toLowerCase()}`}>
      {veredito === 'MITO' ? '✕ Mito' : '✓ Verdade'}
    </span>
  );
}
