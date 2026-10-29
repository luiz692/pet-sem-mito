'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api, gravarLocal, lerLocal } from '@/lib/cliente';
import { Carimbo, NaPratica, Placas } from './Votacao';

const QUANTIDADE = 8;
const PONTOS_ACERTO = 100;
const BONUS_SEQUENCIA = 25;

export function Quiz() {
  const [etapa, setEtapa] = useState('inicio');
  const [perguntas, setPerguntas] = useState([]);
  const [indice, setIndice] = useState(0);
  const [resposta, setResposta] = useState(null);
  const [acertos, setAcertos] = useState(0);
  const [pontos, setPontos] = useState(0);
  const [sequencia, setSequencia] = useState(0);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const [apelido, setApelido] = useState('');
  const [salva, setSalva] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [lista, setLista] = useState(null);

  const tituloPergunta = useRef(null);
  const tituloResultado = useRef(null);

  const carregarRanking = useCallback(async () => {
    try {
      setLista(await api('/api/ranking?limite=10'));
    } catch {
      setLista([]);
    }
  }, []);

  useEffect(() => {
    setApelido(lerLocal('psm-apelido'));
    carregarRanking();
  }, [carregarRanking]);

  async function comecar() {
    setCarregando(true);
    setErro('');
    try {
      const sorteadas = await api(`/api/mitos?sortear=${QUANTIDADE}`);
      if (!sorteadas.length) throw new Error('Ainda não há afirmações publicadas para o quiz.');
      setPerguntas(sorteadas);
      setIndice(0);
      setResposta(null);
      setAcertos(0);
      setPontos(0);
      setSequencia(0);
      setSalva(null);
      setMensagem(null);
      setEtapa('jogando');
      requestAnimationFrame(() => tituloPergunta.current?.focus());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  const atual = perguntas[indice];

  function responder(v) {
    if (resposta) return;
    setResposta(v);
    if (v === atual.veredito) {
      const novaSequencia = sequencia + 1;
      setSequencia(novaSequencia);
      setAcertos((a) => a + 1);
      setPontos((p) => p + PONTOS_ACERTO + BONUS_SEQUENCIA * Math.min(novaSequencia - 1, 4));
    } else {
      setSequencia(0);
    }
  }

  function avancar() {
    if (indice + 1 < perguntas.length) {
      setIndice(indice + 1);
      setResposta(null);
      requestAnimationFrame(() => tituloPergunta.current?.focus());
    } else {
      setEtapa('fim');
      requestAnimationFrame(() => tituloResultado.current?.focus());
    }
  }

  async function salvar(evento) {
    evento.preventDefault();
    setSalvando(true);
    setMensagem(null);
    try {
      const nova = await api('/api/ranking', {
        metodo: 'POST',
        corpo: { apelido, pontos, acertos, total: perguntas.length },
      });
      gravarLocal('psm-apelido', apelido.trim());
      setSalva(nova);
      setMensagem({ tipo: 'ok', texto: `Pontuação salva! Você está em ${nova.posicao}º lugar.` });
      carregarRanking();
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    } finally {
      setSalvando(false);
    }
  }

  async function compartilhar() {
    const url = `${window.location.origin}/jogar`;
    const texto = `Acertei ${acertos} de ${perguntas.length} no quiz Pet sem Mito (${pontos} pontos). Você sabe o que é mito e o que é verdade na saúde dos pets?`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Pet sem Mito', text: texto, url });
        return;
      }
      await navigator.clipboard.writeText(`${texto} ${url}`);
      setMensagem({ tipo: 'ok', texto: 'Desafio copiado. É só colar no WhatsApp ou nas redes.' });
    } catch {
      // compartilhamento cancelado
    }
  }

  return (
    <div className="layout-quiz">
      <div className="quiz">
        {etapa === 'inicio' && (
          <div>
            <h2 className="quiz__afirmacao" style={{ marginBottom: 12 }}>
              {QUANTIDADE} afirmações, uma de cada vez
            </h2>
            <p style={{ marginBottom: 8 }}>
              Levante a placa de mito ou de verdade. Cada acerto vale {PONTOS_ACERTO} pontos, e acertos seguidos dão
              bônus. No final, salve sua pontuação no ranking.
            </p>
            <div className="botoes" style={{ marginTop: 20 }}>
              <button type="button" className="botao" onClick={comecar} disabled={carregando}>
                {carregando ? 'Sorteando…' : 'Começar o quiz'}
              </button>
            </div>
            {erro && <p className="mensagem mensagem--erro">{erro}</p>}
          </div>
        )}

        {etapa === 'jogando' && atual && (
          <div>
            <div className="quiz__barra">
              <span>
                Pergunta {indice + 1} de {perguntas.length}
              </span>
              <span>{pontos} pontos</span>
            </div>
            <div className="quiz__progresso" aria-hidden="true">
              <span style={{ width: `${((indice + (resposta ? 1 : 0)) / perguntas.length) * 100}%` }} />
            </div>
            <span className="etiqueta etiqueta--neutra quiz__categoria">{atual.categoria}</span>
            <h2 className="quiz__afirmacao" tabIndex={-1} ref={tituloPergunta} style={{ marginTop: 10 }}>
              {atual.afirmacao}
            </h2>

            {!resposta ? (
              <Placas aoEscolher={responder} rotulo="Responda mito ou verdade" />
            ) : (
              <div className="quiz__resultado" aria-live="polite">
                <Carimbo veredito={atual.veredito} />
                <p className="quiz__acerto">
                  {resposta === atual.veredito
                    ? sequencia > 1
                      ? `Acertou! ${sequencia} seguidas 🔥`
                      : 'Acertou! 🎉'
                    : 'Errou, mas agora você sabe.'}
                </p>
                <p>{atual.explicacao}</p>
                <NaPratica texto={atual.na_pratica} />
                <div className="botoes" style={{ marginTop: 8 }}>
                  <button type="button" className="botao" onClick={avancar}>
                    {indice + 1 < perguntas.length ? 'Próxima pergunta' : 'Ver meu resultado'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {etapa === 'fim' && (
          <div className="quiz__final">
            <h2 tabIndex={-1} ref={tituloResultado}>
              {acertos === perguntas.length
                ? 'Gabaritou! Nenhum mito te engana.'
                : acertos >= perguntas.length / 2
                  ? 'Mandou bem!'
                  : 'Bora estudar mais um pouco?'}
            </h2>
            <p className="quiz__pontos">{pontos}</p>
            <p>
              pontos, com {acertos} de {perguntas.length} acertos
            </p>

            {!salva ? (
              <form className="quiz__salvar" onSubmit={salvar}>
                <label className="so-leitor" htmlFor="apelido">
                  Seu apelido
                </label>
                <input
                  id="apelido"
                  type="text"
                  placeholder="Seu apelido"
                  maxLength={24}
                  value={apelido}
                  onChange={(e) => setApelido(e.target.value)}
                  required
                />
                <button type="submit" className="botao" disabled={salvando || !apelido.trim()}>
                  {salvando ? 'Salvando…' : 'Salvar no ranking'}
                </button>
              </form>
            ) : null}

            {mensagem && (
              <p className={`mensagem mensagem--${mensagem.tipo}`} role="status">
                {mensagem.texto}
              </p>
            )}

            <div className="botoes" style={{ justifyContent: 'center', marginTop: 16 }}>
              <button type="button" className="botao botao--sol" onClick={compartilhar}>
                Desafiar os amigos
              </button>
              <button type="button" className="botao botao--claro" onClick={comecar} disabled={carregando}>
                Jogar de novo
              </button>
            </div>
          </div>
        )}
      </div>

      <aside className="ranking" aria-labelledby="titulo-ranking">
        <h2 id="titulo-ranking">Ranking</h2>
        {lista === null && <p className="vazio">Carregando…</p>}
        {lista?.length === 0 && <p className="vazio">Ninguém jogou ainda. Seja o primeiro!</p>}
        {lista?.length > 0 && (
          <ol>
            {lista.map((p) => (
              <li key={p.id} className={salva?.id === p.id ? 'ranking--voce' : undefined}>
                <span className="ranking__nome">{p.apelido}</span>
                <span className="ranking__pontos">{p.pontos}</span>
              </li>
            ))}
          </ol>
        )}
      </aside>
    </div>
  );
}
