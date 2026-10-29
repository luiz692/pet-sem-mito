'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, dataCurta } from '@/lib/cliente';

const ESPECIES = ['Cão', 'Gato', 'Outro'];

export function Pergunte() {
  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState('Cão');
  const [pergunta, setPergunta] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [publicadas, setPublicadas] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setPublicadas(await api('/api/perguntas'));
    } catch {
      setPublicadas([]);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function enviar(evento) {
    evento.preventDefault();
    setEnviando(true);
    setMensagem(null);
    try {
      await api('/api/perguntas', { metodo: 'POST', corpo: { nome, especie, pergunta } });
      setPergunta('');
      setMensagem({
        tipo: 'ok',
        texto: 'Pergunta enviada! A equipe vai responder, e as dúvidas escolhidas aparecem nesta página.',
      });
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pergunte">
      <form className="formulario" onSubmit={enviar}>
        <h2 style={{ fontSize: 'var(--t-3)', marginBottom: 16 }}>Qual é a sua dúvida?</h2>

        <label className="campo">
          <span>
            Seu nome <small>(opcional)</small>
          </span>
          <input type="text" maxLength={60} value={nome} onChange={(e) => setNome(e.target.value)} />
        </label>

        <fieldset className="campo">
          <legend>Seu pet é</legend>
          <div className="opcoes">
            {ESPECIES.map((e) => (
              <label key={e} className="opcao">
                <input
                  type="radio"
                  name="especie"
                  value={e}
                  checked={especie === e}
                  onChange={() => setEspecie(e)}
                />
                <span>{e}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="campo">
          <span>Pergunta</span>
          <textarea
            required
            minLength={10}
            maxLength={600}
            placeholder="Ex.: Posso dar banho no meu filhote antes de terminar as vacinas?"
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
          />
          <small>{pergunta.length}/600</small>
        </label>

        <button type="submit" className="botao" disabled={enviando || pergunta.trim().length < 10}>
          {enviando ? 'Enviando…' : 'Enviar pergunta'}
        </button>

        {mensagem && (
          <p className={`mensagem mensagem--${mensagem.tipo}`} role="status">
            {mensagem.texto}
          </p>
        )}

        <p style={{ marginTop: 16, fontSize: 'var(--t-0)', color: 'var(--tinta-3)' }}>
          Em caso de sintomas, suspeita de intoxicação ou emergência, não espere a resposta: procure atendimento
          veterinário.
        </p>
      </form>

      <section className="respostas" aria-labelledby="titulo-respondidas">
        <h2 id="titulo-respondidas">Dúvidas respondidas</h2>
        {publicadas === null && <p className="vazio">Carregando…</p>}
        {publicadas?.length === 0 && (
          <p className="vazio">Nenhuma resposta publicada ainda. Mande a primeira pergunta!</p>
        )}
        {publicadas?.map((p) => (
          <article key={p.id} className="duvida-publicada">
            <p className="duvida-publicada__pergunta">{p.pergunta}</p>
            <p className="duvida-publicada__autor">
              {p.nome || 'Tutor(a)'}
              {p.especie ? `, tutor(a) de ${p.especie === 'Cão' ? 'cão' : p.especie === 'Gato' ? 'gato' : 'pet'}` : ''}
              {p.respondida_em ? ` — respondida em ${dataCurta(p.respondida_em)}` : ''}
            </p>
            <div className="duvida-publicada__resposta">
              <strong>Resposta da equipe</strong>
              <p style={{ whiteSpace: 'pre-line' }}>{p.resposta}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
