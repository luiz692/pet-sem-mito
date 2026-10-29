'use client';

// Cartão do Início: uma afirmação sorteada para responder na hora.

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/cliente';
import { Carimbo, NaPratica, Placas } from './Votacao';

export function Desafio() {
  const [fila, setFila] = useState([]);
  const [resposta, setResposta] = useState(null);
  const [erro, setErro] = useState('');
  const vistos = useRef(new Set());
  const titulo = useRef(null);

  const carregar = useCallback(async () => {
    try {
      const novos = await api('/api/mitos?sortear=6');
      const ineditos = novos.filter((m) => !vistos.current.has(m.id));
      setFila(ineditos.length ? ineditos : novos);
      setErro('');
    } catch (e) {
      setErro(e.message);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const atual = fila[0];

  function responder(v) {
    setResposta(v);
    vistos.current.add(atual.id);
  }

  function proxima() {
    setResposta(null);
    if (fila.length > 1) setFila(fila.slice(1));
    else carregar();
    requestAnimationFrame(() => titulo.current?.focus());
  }

  return (
    <div className="desafio">
      <div className="desafio__topo">
        <span className="desafio__rotulo">Mito ou verdade?</span>
        {atual && <span className="etiqueta etiqueta--neutra">{atual.categoria}</span>}
      </div>

      {!atual && <p className="carregando">{erro || 'Sorteando uma afirmação…'}</p>}

      {atual && (
        <>
          <h3 className="desafio__afirmacao" tabIndex={-1} ref={titulo}>
            {atual.afirmacao}
          </h3>

          {!resposta ? (
            <Placas aoEscolher={responder} rotulo="Responda mito ou verdade" />
          ) : (
            <div className="desafio__resultado" aria-live="polite">
              <Carimbo veredito={atual.veredito} />
              <p className="desafio__veredito">
                {resposta === atual.veredito ? 'Acertou! 🎉' : 'Errou, mas agora você sabe.'}
              </p>
              <p>{atual.explicacao}</p>
              <NaPratica texto={atual.na_pratica} />
              <div className="botoes" style={{ marginTop: 6 }}>
                <button type="button" className="botao" onClick={proxima}>
                  Outra afirmação
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
