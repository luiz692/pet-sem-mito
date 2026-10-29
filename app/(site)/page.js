import Link from 'next/link';
import { AoVivo } from '@/components/AoVivo';
import { Desafio } from '@/components/Desafio';
import { Pata } from '@/components/Pata';

export default function Inicio() {
  return (
    <div className="pagina container">
      <AoVivo variante="destaque" />

      <section className="hero" style={{ marginTop: 24 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="hero__logo"
          src="/logo.jpg"
          alt="Logo Mito e Verdade na Medicina Veterinária: um cão e um gato com balões de X e de visto"
          width="420"
          height="420"
        />
        <div>
          <h1 className="hero__titulo">Informação que cuida. Ciência que conecta.</h1>
          <p className="hero__texto">
            Muita coisa que se diz por aí sobre a saúde de cães e gatos não é verdade. Aqui você descobre o que é mito,
            o que é verdade e o que fazer na prática, sem linguagem complicada.
          </p>
          <div className="botoes">
            <Link className="botao" href="/jogar">
              Jogar o quiz
            </Link>
            <Link className="botao botao--claro" href="/mitos">
              Ver mitos e verdades
            </Link>
          </div>
        </div>
      </section>

      <section className="secao desafio-secao" aria-labelledby="titulo-desafio">
        <div className="desafio-secao__texto">
          <h2 className="secao__titulo" id="titulo-desafio" style={{ marginBottom: 0 }}>
            Teste rápido
          </h2>
          <p>Leia a frase e levante a placa. A resposta vem com a explicação de quem estuda o assunto.</p>
        </div>
        <Desafio />
      </section>

      <section className="secao" aria-labelledby="titulo-caminhos">
        <h2 className="secao__titulo" id="titulo-caminhos">
          O que dá para fazer aqui
        </h2>
        <div className="caminhos">
          <Link className="caminho" href="/jogar">
            <h3 className="caminho__titulo">Jogar</h3>
            <p>Quiz de mito ou verdade com pontuação e ranking. Desafie os amigos a fazer mais pontos.</p>
          </Link>
          <Link className="caminho" href="/mitos">
            <h3 className="caminho__titulo">Mitos e verdades</h3>
            <p>Todas as afirmações explicadas, com o que funciona na prática, separadas por tema.</p>
          </Link>
          <Link className="caminho" href="/pergunte">
            <h3 className="caminho__titulo">Pergunte ao vet</h3>
            <p>Mande sua dúvida. A equipe responde em linguagem simples e publica as respostas aqui.</p>
          </Link>
        </div>
      </section>

      <section className="secao sobre" aria-labelledby="titulo-sobre">
        <span className="sobre__selo">
          <Pata tamanho={36} />
        </span>
        <div>
          <h2 className="secao__titulo" id="titulo-sobre" style={{ marginBottom: 10 }}>
            Sobre o projeto
          </h2>
          <p>
            O Pet sem Mito nasceu do teatro interativo &ldquo;Mito ou Verdade Pet&rdquo;, um projeto paralelo do curso
            de Medicina Veterinária sobre prevenção de doenças e guarda responsável.
          </p>
          <p>
            A ideia vai além de desmentir informações falsas: é aproximar a universidade da comunidade e mostrar que
            cuidar bem começa por se informar bem.
          </p>
        </div>
      </section>
    </div>
  );
}
