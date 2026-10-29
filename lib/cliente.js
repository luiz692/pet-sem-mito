'use client';

// Utilidades usadas pelas telas no navegador.

import { useCallback, useEffect, useRef, useState } from 'react';

export async function api(url, { metodo = 'GET', corpo } = {}) {
  const resposta = await fetch(url, {
    method: metodo,
    headers: corpo ? { 'Content-Type': 'application/json' } : undefined,
    body: corpo ? JSON.stringify(corpo) : undefined,
    cache: 'no-store',
  });
  let dados = {};
  try {
    dados = await resposta.json();
  } catch {
    // resposta sem corpo
  }
  if (!resposta.ok) throw new Error(dados.erro || `Não foi possível concluir (erro ${resposta.status}).`);
  return dados;
}

function gerarId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

let idEmMemoria = null;

// Identifica o celular de quem vota (sem cadastro). Fica salvo no navegador.
export function idDoParticipante() {
  try {
    let id = localStorage.getItem('psm-participante');
    if (!id) {
      id = gerarId();
      localStorage.setItem('psm-participante', id);
    }
    return id;
  } catch {
    idEmMemoria ??= gerarId();
    return idEmMemoria;
  }
}

export function lerLocal(chave, padrao = '') {
  try {
    return localStorage.getItem(chave) ?? padrao;
  } catch {
    return padrao;
  }
}

export function gravarLocal(chave, valor) {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    // navegador sem armazenamento local
  }
}

// Busca uma URL de tempos em tempos (votos ao vivo). Pausa quando a aba está escondida.
export function useSondagem(url, intervalo) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const montado = useRef(true);

  const atualizar = useCallback(async () => {
    if (!url) return;
    try {
      const novo = await api(url);
      if (montado.current) {
        setDados(novo);
        setErro('');
      }
    } catch (e) {
      if (montado.current) setErro(e.message);
    }
  }, [url]);

  useEffect(() => {
    montado.current = true;
    atualizar();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') atualizar();
    }, intervalo);
    const aoVoltar = () => document.visibilityState === 'visible' && atualizar();
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      montado.current = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, [atualizar, intervalo]);

  return { dados, erro, atualizar };
}

export function porcentagem(parte, total) {
  return total ? Math.round((parte / total) * 100) : 0;
}

export function nomeDoVeredito(v) {
  return v === 'MITO' ? 'Mito' : 'Verdade';
}

export function semAcento(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function dataCurta(valor) {
  if (!valor) return '';
  return new Date(valor).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}
