'use client';

// Área da equipe: controle do teatro, respostas às dúvidas, edição do conteúdo e ranking.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, dataCurta, useSondagem } from '@/lib/cliente';
import { BarrasVotos, EtiquetaVeredito } from './Votacao';

function BotaoConfirmar({ children, confirmar, aoConfirmar, classe = 'botao botao--claro botao--pequeno', desabilitado }) {
  const [armado, setArmado] = useState(false);
  useEffect(() => {
    if (!armado) return undefined;
    const t = setTimeout(() => setArmado(false), 4000);
    return () => clearTimeout(t);
  }, [armado]);
  return (
    <button
      type="button"
      className={armado ? 'botao botao--perigo botao--pequeno' : classe}
      disabled={desabilitado}
      onClick={() => {
        if (armado) {
          setArmado(false);
          aoConfirmar();
        } else {
          setArmado(true);
        }
      }}
    >
      {armado ? confirmar : children}
    </button>
  );
}

function Mensagem({ valor }) {
  if (!valor) return null;
  return (
    <p className={`mensagem mensagem--${valor.tipo}`} role="status">
      {valor.texto}
    </p>
  );
}

/* ---------- Teatro ao vivo ---------- */

const NOMES_FASE = {
  fora: 'Show fora do ar',
  espera: 'Show aberto, aguardando a rodada',
  votacao: 'Votação aberta',
  resultado: 'Resposta revelada',
  fim: 'Show encerrado',
};

function PainelShow() {
  const { dados, atualizar } = useSondagem('/api/ao-vivo', 2000);
  const [rodadas, setRodadas] = useState([]);
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    api('/api/mitos?todos=1')
      .then((todos) =>
        setRodadas(todos.filter((m) => m.ordem_show !== null).sort((a, b) => a.ordem_show - b.ordem_show || a.id - b.id)),
      )
      .catch((e) => setMensagem({ tipo: 'erro', texto: e.message }));
  }, []);

  async function agir(acao, extra = {}) {
    setOcupado(true);
    setMensagem(null);
    try {
      await api('/api/ao-vivo/controle', { metodo: 'POST', corpo: { acao, ...extra } });
      await atualizar();
      if (acao === 'zerar') setMensagem({ tipo: 'ok', texto: 'Votos zerados.' });
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    } finally {
      setOcupado(false);
    }
  }

  if (!dados) return <p className="carregando">Carregando o show…</p>;

  const { fase, mito, rodada, votos, plateia } = dados;
  const atual = rodadas.find((r) => r.id === mito?.id);
  const posicao = atual ? rodadas.indexOf(atual) : -1;
  const proxima = rodadas[posicao + 1];

  let principal;
  if (fase === 'fora') principal = { rotulo: 'Iniciar o show', acao: 'iniciar' };
  else if (fase === 'espera')
    principal = proxima
      ? { rotulo: `Abrir rodada ${posicao + 2}`, acao: 'proxima' }
      : { rotulo: 'Encerrar o show', acao: 'encerrar' };
  else if (fase === 'votacao') principal = { rotulo: 'Fechar votação e revelar', acao: 'revelar' };
  else if (fase === 'resultado')
    principal = proxima
      ? { rotulo: `Abrir rodada ${posicao + 2}`, acao: 'proxima' }
      : { rotulo: 'Encerrar o show', acao: 'encerrar' };
  else principal = { rotulo: 'Tirar o show do ar', acao: 'desligar' };

  return (
    <div className="painel">
      <div className="bloco show-status">
        <div>
          <p className="show-status__fase">{NOMES_FASE[fase]}</p>
          <h2 className="show-status__titulo">
            {mito ? `Rodada ${rodada?.numero ?? '?'}: ${mito.afirmacao}` : fase === 'fim' ? 'Fim do show' : 'Nenhuma rodada aberta'}
          </h2>
          {atual && (
            <p>
              Resposta certa: <EtiquetaVeredito veredito={atual.veredito} />
            </p>
          )}
          <div className="show-status__acao">
            <button
              type="button"
              className={`botao${principal.acao === 'revelar' ? ' botao--sol' : ''}`}
              onClick={() => agir(principal.acao)}
              disabled={ocupado}
            >
              {principal.rotulo}
            </button>
          </div>
          <div className="botoes">
            {(fase === 'votacao' || fase === 'resultado') && (
              <button type="button" className="botao botao--claro botao--pequeno" onClick={() => agir('espera')} disabled={ocupado}>
                Voltar para a espera
              </button>
            )}
            {fase !== 'fim' && fase !== 'fora' && (
              <button type="button" className="botao botao--claro botao--pequeno" onClick={() => agir('encerrar')} disabled={ocupado}>
                Encerrar o show
              </button>
            )}
            {fase !== 'fora' && (
              <button type="button" className="botao botao--claro botao--pequeno" onClick={() => agir('desligar')} disabled={ocupado}>
                Tirar do ar
              </button>
            )}
            <BotaoConfirmar confirmar="Confirmar: apagar todos os votos" aoConfirmar={() => agir('zerar')} desabilitado={ocupado}>
              Zerar votos
            </BotaoConfirmar>
          </div>
          <Mensagem valor={mensagem} />
        </div>
        <div>
          {votos ? (
            <>
              <BarrasVotos votos={votos} />
              <p style={{ marginTop: 12 }}>
                {votos.total} {votos.total === 1 ? 'voto' : 'votos'} nesta rodada
              </p>
            </>
          ) : (
            <p className="vazio">Os votos aparecem aqui quando uma rodada abrir.</p>
          )}
          <p style={{ marginTop: 12, color: 'var(--tinta-3)' }}>
            {plateia.participantes} {plateia.participantes === 1 ? 'celular votou' : 'celulares votaram'} no show
          </p>
          <div className="botoes" style={{ marginTop: 16 }}>
            <a className="botao botao--claro botao--pequeno" href="/telao" target="_blank" rel="noopener">
              Abrir o telão
            </a>
            <a className="botao botao--claro botao--pequeno" href="/api/qrcode?baixar=1">
              Baixar QR code
            </a>
          </div>
        </div>
      </div>

      <div className="bloco">
        <h2>Rodadas do teatro</h2>
        {rodadas.length === 0 ? (
          <p className="vazio">
            Nenhuma afirmação marcada para o teatro. Em &ldquo;Mitos e verdades&rdquo;, preencha a ordem no teatro.
          </p>
        ) : (
          <ol className="lista-rodadas">
            {rodadas.map((r, i) => (
              <li key={r.id} data-atual={r.id === mito?.id}>
                <span className="lista-rodadas__numero">{i + 1}</span>
                <span className="lista-rodadas__texto">
                  {r.afirmacao}
                  <EtiquetaVeredito veredito={r.veredito} />
                </span>
                <button
                  type="button"
                  className="botao botao--claro botao--pequeno"
                  onClick={() => agir('abrir', { mitoId: r.id })}
                  disabled={ocupado || (r.id === mito?.id && fase === 'votacao')}
                >
                  {r.id === mito?.id && fase === 'votacao' ? 'Aberta' : 'Abrir'}
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

/* ---------- Dúvidas ---------- */

function CartaoDuvida({ duvida, aoMudar }) {
  const [resposta, setResposta] = useState(duvida.resposta ?? '');
  const [publicada, setPublicada] = useState(duvida.publicada);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  async function salvar() {
    setSalvando(true);
    setMensagem(null);
    try {
      const atualizada = await api(`/api/perguntas/${duvida.id}`, { metodo: 'PUT', corpo: { resposta, publicada } });
      setPublicada(atualizada.publicada);
      setMensagem({ tipo: 'ok', texto: atualizada.publicada ? 'Salva e publicada no site.' : 'Resposta salva.' });
      aoMudar();
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    try {
      await api(`/api/perguntas/${duvida.id}`, { metodo: 'DELETE' });
      aoMudar();
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    }
  }

  const respondida = Boolean(duvida.resposta);
  return (
    <article className="duvida">
      <div className="duvida__topo">
        <span>
          {duvida.nome || 'Sem nome'}
          {duvida.especie ? `, ${duvida.especie.toLowerCase()}` : ''}, enviada em {dataCurta(duvida.criado_em)}
        </span>
        {duvida.publicada ? (
          <span className="etiqueta etiqueta--verdade">Publicada</span>
        ) : respondida ? (
          <span className="etiqueta etiqueta--neutra">Respondida, não publicada</span>
        ) : (
          <span className="etiqueta etiqueta--perigo">Nova</span>
        )}
      </div>
      <p className="duvida__pergunta">{duvida.pergunta}</p>
      <label className="campo" style={{ marginBottom: 0 }}>
        <span className="so-leitor">Resposta</span>
        <textarea
          placeholder="Escreva a resposta em linguagem simples"
          maxLength={2000}
          value={resposta}
          onChange={(e) => setResposta(e.target.value)}
        />
      </label>
      <div className="botoes" style={{ alignItems: 'center' }}>
        <label className="check">
          <input type="checkbox" checked={publicada} onChange={(e) => setPublicada(e.target.checked)} />
          Publicar no site
        </label>
        <button type="button" className="botao botao--pequeno" onClick={salvar} disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar resposta'}
        </button>
        <BotaoConfirmar confirmar="Confirmar exclusão" aoConfirmar={excluir}>
          Excluir
        </BotaoConfirmar>
      </div>
      <Mensagem valor={mensagem} />
    </article>
  );
}

function PainelDuvidas({ aoContar }) {
  const [duvidas, setDuvidas] = useState(null);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    try {
      const lista = await api('/api/perguntas?todas=1');
      setDuvidas(lista);
      aoContar(lista.filter((d) => !d.resposta).length);
    } catch (e) {
      setErro(e.message);
    }
  }, [aoContar]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (erro) return <p className="mensagem mensagem--erro">{erro}</p>;
  if (!duvidas) return <p className="carregando">Carregando dúvidas…</p>;

  return (
    <div className="painel">
      <div className="botoes" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <p>
          {duvidas.length} {duvidas.length === 1 ? 'dúvida recebida' : 'dúvidas recebidas'}. Só aparecem no site as
          respondidas e marcadas para publicar.
        </p>
        <button type="button" className="botao botao--claro botao--pequeno" onClick={carregar}>
          Atualizar lista
        </button>
      </div>
      {duvidas.length === 0 && <p className="vazio">Nenhuma dúvida recebida ainda.</p>}
      {duvidas.map((d) => (
        <CartaoDuvida key={`${d.id}-${d.respondida_em ?? ''}-${d.publicada}`} duvida={d} aoMudar={carregar} />
      ))}
    </div>
  );
}

/* ---------- Mitos e verdades ---------- */

const MITO_VAZIO = {
  categoria: '',
  afirmacao: '',
  veredito: 'MITO',
  explicacao: '',
  na_pratica: '',
  publicado: true,
  ordem_show: '',
};

function EditorMito({ inicial, temas, aoSalvar, aoCancelar }) {
  const [m, setM] = useState({ ...MITO_VAZIO, ...inicial, ordem_show: inicial?.ordem_show ?? '' });
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const mudar = (campo) => (e) =>
    setM({ ...m, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function salvar(evento) {
    evento.preventDefault();
    setSalvando(true);
    setMensagem(null);
    try {
      if (inicial?.id) await api(`/api/mitos/${inicial.id}`, { metodo: 'PUT', corpo: m });
      else await api('/api/mitos', { metodo: 'POST', corpo: m });
      aoSalvar();
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
      setSalvando(false);
    }
  }

  return (
    <form className="editor" onSubmit={salvar}>
      <h2 style={{ fontSize: 'var(--t-3)', marginBottom: 16 }}>
        {inicial?.id ? 'Editar afirmação' : 'Nova afirmação'}
      </h2>
      <label className="campo">
        <span>Afirmação</span>
        <input type="text" required maxLength={220} value={m.afirmacao} onChange={mudar('afirmacao')} />
      </label>
      <div className="editor__grade">
        <label className="campo">
          <span>Tema</span>
          <input type="text" required maxLength={40} list="temas" value={m.categoria} onChange={mudar('categoria')} />
          <datalist id="temas">
            {temas.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </label>
        <fieldset className="campo">
          <legend>Veredito</legend>
          <div className="opcoes">
            {['MITO', 'VERDADE'].map((v) => (
              <label key={v} className="opcao">
                <input type="radio" name="veredito" value={v} checked={m.veredito === v} onChange={mudar('veredito')} />
                <span>{v === 'MITO' ? 'Mito' : 'Verdade'}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="campo">
          <span>Ordem no teatro</span>
          <input type="number" min={1} max={99} value={m.ordem_show} onChange={mudar('ordem_show')} />
          <small>Vazio = não entra no teatro</small>
        </label>
      </div>
      <label className="campo">
        <span>Explicação</span>
        <textarea required maxLength={1200} value={m.explicacao} onChange={mudar('explicacao')} />
      </label>
      <label className="campo">
        <span>Na prática</span>
        <textarea maxLength={600} style={{ minHeight: 80 }} value={m.na_pratica} onChange={mudar('na_pratica')} />
      </label>
      <div className="botoes" style={{ alignItems: 'center' }}>
        <label className="check">
          <input type="checkbox" checked={m.publicado} onChange={mudar('publicado')} />
          Publicado no site e no quiz
        </label>
        <button type="submit" className="botao botao--pequeno" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar'}
        </button>
        <button type="button" className="botao botao--claro botao--pequeno" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
      <Mensagem valor={mensagem} />
    </form>
  );
}

function PainelMitos() {
  const [mitos, setMitos] = useState(null);
  const [editando, setEditando] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setMitos(await api('/api/mitos?todos=1'));
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const temas = useMemo(() => [...new Set((mitos ?? []).map((m) => m.categoria))].sort(), [mitos]);

  async function excluir(id) {
    try {
      await api(`/api/mitos/${id}`, { metodo: 'DELETE' });
      setMensagem({ tipo: 'ok', texto: 'Afirmação excluída.' });
      carregar();
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    }
  }

  async function restaurar() {
    try {
      await api('/api/mitos', { metodo: 'POST', corpo: { acao: 'restaurar' } });
      setMensagem({ tipo: 'ok', texto: 'Conteúdo original restaurado.' });
      carregar();
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    }
  }

  if (!mitos) return <p className="carregando">{mensagem?.texto || 'Carregando…'}</p>;

  return (
    <div className="painel">
      {editando ? (
        <EditorMito
          inicial={editando === 'novo' ? null : editando}
          temas={temas}
          aoCancelar={() => setEditando(null)}
          aoSalvar={() => {
            setEditando(null);
            setMensagem({ tipo: 'ok', texto: 'Afirmação salva.' });
            carregar();
          }}
        />
      ) : (
        <div className="botoes" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" className="botao" onClick={() => setEditando('novo')}>
            Nova afirmação
          </button>
          <BotaoConfirmar confirmar="Confirmar: apagar edições e votos" aoConfirmar={restaurar}>
            Restaurar conteúdo original
          </BotaoConfirmar>
        </div>
      )}
      <Mensagem valor={mensagem} />
      <div className="tabela-mitos">
        {mitos.map((m) => (
          <div key={m.id} className="linha-mito">
            <div>
              <p className="linha-mito__texto">{m.afirmacao}</p>
              <div className="linha-mito__info">
                <EtiquetaVeredito veredito={m.veredito} />
                <span className="etiqueta etiqueta--neutra">{m.categoria}</span>
                {m.ordem_show !== null && <span className="etiqueta etiqueta--sol">Teatro: rodada {m.ordem_show}</span>}
                {!m.publicado && <span className="etiqueta etiqueta--perigo">Oculta</span>}
              </div>
            </div>
            <div className="botoes">
              <button type="button" className="botao botao--claro botao--pequeno" onClick={() => setEditando(m)}>
                Editar
              </button>
              <BotaoConfirmar confirmar="Confirmar" aoConfirmar={() => excluir(m.id)}>
                Excluir
              </BotaoConfirmar>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Ranking ---------- */

function PainelRanking() {
  const [lista, setLista] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setLista(await api('/api/ranking?limite=100'));
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function zerar() {
    try {
      await api('/api/ranking', { metodo: 'DELETE' });
      setMensagem({ tipo: 'ok', texto: 'Ranking zerado.' });
      carregar();
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    }
  }

  return (
    <div className="painel">
      <div className="botoes" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <p>{lista ? `${lista.length} ${lista.length === 1 ? 'partida salva' : 'partidas salvas'}` : 'Carregando…'}</p>
        <BotaoConfirmar confirmar="Confirmar: apagar o ranking" aoConfirmar={zerar}>
          Zerar ranking
        </BotaoConfirmar>
      </div>
      <Mensagem valor={mensagem} />
      {lista?.length > 0 && (
        <div className="ranking">
          <ol>
            {lista.map((p) => (
              <li key={p.id}>
                <span className="ranking__nome">
                  {p.apelido}{' '}
                  <small style={{ color: 'var(--tinta-3)' }}>
                    {p.acertos}/{p.total} em {dataCurta(p.criado_em)}
                  </small>
                </span>
                <span className="ranking__pontos">{p.pontos}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

/* ---------- Página ---------- */

const ABAS = [
  { id: 'show', rotulo: 'Teatro ao vivo' },
  { id: 'duvidas', rotulo: 'Dúvidas' },
  { id: 'mitos', rotulo: 'Mitos e verdades' },
  { id: 'ranking', rotulo: 'Ranking' },
];

export function Equipe() {
  const [aba, setAba] = useState('show');
  const [novas, setNovas] = useState(0);

  useEffect(() => {
    api('/api/perguntas?todas=1')
      .then((lista) => setNovas(lista.filter((d) => !d.resposta).length))
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="abas" role="tablist" aria-label="Seções da área da equipe">
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            id={`aba-${a.id}`}
            aria-selected={aba === a.id}
            aria-controls={`painel-${a.id}`}
            className="aba"
            onClick={() => setAba(a.id)}
          >
            {a.rotulo}
            {a.id === 'duvidas' && novas > 0 && <span className="aba__contador">{novas}</span>}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`painel-${aba}`} aria-labelledby={`aba-${aba}`}>
        {aba === 'show' && <PainelShow />}
        {aba === 'duvidas' && <PainelDuvidas aoContar={setNovas} />}
        {aba === 'mitos' && <PainelMitos />}
        {aba === 'ranking' && <PainelRanking />}
      </div>
    </div>
  );
}
