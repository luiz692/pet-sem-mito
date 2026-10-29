'use client';

import { useEffect, useMemo, useState } from 'react';
import { api, semAcento } from '@/lib/cliente';
import { EtiquetaVeredito, NaPratica } from './Votacao';

export function Biblioteca() {
  const [mitos, setMitos] = useState(null);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [tema, setTema] = useState('Todos');
  const [veredito, setVeredito] = useState('todos');

  useEffect(() => {
    api('/api/mitos')
      .then(setMitos)
      .catch((e) => setErro(e.message));
  }, []);

  const temas = useMemo(() => {
    const unicos = [...new Set((mitos ?? []).map((m) => m.categoria))];
    return ['Todos', ...unicos.sort((a, b) => a.localeCompare(b, 'pt-BR'))];
  }, [mitos]);

  const filtrados = useMemo(() => {
    const termo = semAcento(busca.trim());
    return (mitos ?? []).filter((m) => {
      if (tema !== 'Todos' && m.categoria !== tema) return false;
      if (veredito !== 'todos' && m.veredito !== veredito) return false;
      if (!termo) return true;
      return semAcento(`${m.afirmacao} ${m.explicacao} ${m.na_pratica} ${m.categoria}`).includes(termo);
    });
  }, [mitos, busca, tema, veredito]);

  if (erro) return <p className="mensagem mensagem--erro">{erro}</p>;
  if (!mitos) return <p className="carregando">Carregando mitos e verdades…</p>;

  return (
    <div>
      <div className="filtros">
        <label className="campo" style={{ marginBottom: 0, maxWidth: 520 }}>
          <span className="so-leitor">Buscar</span>
          <input
            type="search"
            placeholder="Buscar por assunto: vacina, chocolate, pulga…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </label>
        <div className="filtros__linha" role="group" aria-label="Filtrar por tema">
          {temas.map((t) => (
            <button key={t} type="button" className="chip" aria-pressed={tema === t} onClick={() => setTema(t)}>
              {t}
            </button>
          ))}
        </div>
        <div className="filtros__linha" role="group" aria-label="Filtrar por veredito">
          {[
            ['todos', 'Mitos e verdades'],
            ['MITO', 'Só mitos'],
            ['VERDADE', 'Só verdades'],
          ].map(([valor, rotulo]) => (
            <button
              key={valor}
              type="button"
              className={`chip${valor === 'MITO' ? ' chip--mito' : valor === 'VERDADE' ? ' chip--verdade' : ''}`}
              aria-pressed={veredito === valor}
              onClick={() => setVeredito(valor)}
            >
              {rotulo}
            </button>
          ))}
        </div>
      </div>

      <p className="contagem" role="status">
        {filtrados.length === 1 ? '1 afirmação' : `${filtrados.length} afirmações`}. Toque em uma para ver a
        explicação.
      </p>

      {filtrados.length === 0 ? (
        <p className="vazio">
          Nada encontrado com esses filtros. Tente outra palavra ou mande sua dúvida em Pergunte ao vet.
        </p>
      ) : (
        <div className="lista-mitos">
          {filtrados.map((m) => (
            <details key={m.id} className={`mito mito--${m.veredito.toLowerCase()}`}>
              <summary>
                <span>
                  <span className="mito__tema">{m.categoria}</span>
                  <span className="mito__afirmacao">{m.afirmacao}</span>
                </span>
                <EtiquetaVeredito veredito={m.veredito} />
              </summary>
              <div className="mito__corpo">
                <p>{m.explicacao}</p>
                <NaPratica texto={m.na_pratica} />
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
