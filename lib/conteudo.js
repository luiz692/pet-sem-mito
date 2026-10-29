// Conteúdo inicial gravado no banco na primeira vez que o site sobe.
// Os quatro primeiros são as rodadas do teatro (ordem_show 1 a 4), na mesma ordem do roteiro.
// Depois disso, tudo pode ser editado pela Área da equipe.

export const MITOS_INICIAIS = [
  {
    ordem_show: 1,
    categoria: 'Vacinas',
    afirmacao: 'Todo animal precisa ser vacinado exatamente da mesma forma.',
    veredito: 'MITO',
    explicacao:
      'Cada animal precisa de um protocolo vacinal individualizado. A idade, o estilo de vida, a região onde vive e o estado de saúde mudam quais vacinas tomar e quando. Vacina não é receita pronta: é ato médico.',
    na_pratica:
      'Leve a carteirinha de vacinação em toda consulta e siga o calendário que o veterinário montar para o seu pet.',
  },
  {
    ordem_show: 2,
    categoria: 'Medicamentos',
    afirmacao: 'Remédio de gente pode ser dado para cães e gatos, é só diminuir a dose pelo peso.',
    veredito: 'MITO',
    explicacao:
      'O organismo dos pets metaboliza os remédios de um jeito muito diferente do nosso. O paracetamol pode ser fatal para gatos e causar lesão grave no fígado de cães. Anti-inflamatórios comuns, como o ibuprofeno, podem provocar úlceras e problemas nos rins.',
    na_pratica:
      'Nunca medique por conta própria, nem com chás e receitas caseiras. Se o pet tomou algum remédio humano, procure atendimento veterinário na hora.',
  },
  {
    ordem_show: 3,
    categoria: 'Parasitas',
    afirmacao: 'Pet que vive dentro de apartamento não precisa de prevenção contra pulgas, carrapatos e vermes.',
    veredito: 'MITO',
    explicacao:
      'Ovos de vermes e pulgas chegam na sola dos sapatos e nas roupas. Mosquitos também entram em apartamentos e podem transmitir a dirofilariose (o verme do coração) e a leishmaniose.',
    na_pratica:
      'Mantenha o vermífugo e o antipulgas em dia, no intervalo indicado pelo veterinário, mesmo que o pet não saia de casa.',
  },
  {
    ordem_show: 4,
    categoria: 'Comportamento',
    afirmacao: 'Cães e gatos enxergam no escuro.',
    veredito: 'VERDADE',
    explicacao:
      'Eles têm o tapetum lucidum, uma camada no fundo do olho que funciona como um espelho e reaproveita a pouca luz do ambiente. Por isso enxergam muito bem na penumbra, bem melhor que nós. No breu absoluto nenhum animal enxerga, mas a luz fraca de uma janela já basta para eles.',
    na_pratica: 'Não precisa deixar a luz acesa à noite por causa do pet.',
  },
  {
    categoria: 'Cuidados',
    afirmacao: 'Focinho quente e seco é sinal de febre.',
    veredito: 'MITO',
    explicacao:
      'A temperatura e a umidade do focinho mudam ao longo do dia. Depois de dormir, tomar sol ou brincar, ele pode ficar quente e seco sem nenhum problema. O único jeito confiável de saber se há febre é medir a temperatura com termômetro.',
    na_pratica:
      'Fique de olho em sinais como desânimo, falta de apetite, vômito ou diarreia. Na dúvida, leve ao veterinário.',
  },
  {
    categoria: 'Alimentação',
    afirmacao: 'Chocolate faz mal para cães.',
    veredito: 'VERDADE',
    explicacao:
      'O chocolate tem teobromina e cafeína, substâncias que os cães eliminam muito devagar. Elas podem causar vômito, agitação, tremores, alterações no coração e até convulsões. Quanto mais amargo o chocolate, mais perigoso.',
    na_pratica:
      'Guarde chocolates fora do alcance, principalmente na Páscoa. Se o pet comer, procure o veterinário e conte o tipo e a quantidade.',
  },
  {
    categoria: 'Alimentação',
    afirmacao: 'Uva e uva-passa são petiscos seguros para cães.',
    veredito: 'MITO',
    explicacao:
      'Uvas e uvas-passas podem causar insuficiência renal aguda em cães, mesmo em pequenas quantidades. A reação varia muito de um cão para outro, por isso nenhuma quantidade é considerada segura.',
    na_pratica:
      'Prefira petiscos próprios para pets ou frutas liberadas pelo veterinário, como pedaços de maçã sem semente.',
  },
  {
    categoria: 'Alimentação',
    afirmacao: 'Cebola e alho podem fazer mal para cães e gatos.',
    veredito: 'VERDADE',
    explicacao:
      'Cebola, alho, cebolinha e alho-poró têm compostos que danificam as células vermelhas do sangue e podem causar anemia. Isso vale para o alimento cru, cozido ou em pó, como nos temperos da comida caseira.',
    na_pratica: 'Não ofereça restos de comida temperada. Gatos são ainda mais sensíveis que cães.',
  },
  {
    categoria: 'Alimentação',
    afirmacao: 'Leite é bom para gatos.',
    veredito: 'MITO',
    explicacao:
      'A maioria dos gatos adultos não digere bem a lactose, o açúcar do leite. O resultado costuma ser diarreia, gases e desconforto.',
    na_pratica:
      'Água fresca e sempre disponível é a melhor bebida. Filhotes órfãos precisam de leite substituto próprio para gatos, nunca de leite de vaca.',
  },
  {
    categoria: 'Alimentação',
    afirmacao: 'Ração de cachorro serve para gato.',
    veredito: 'MITO',
    explicacao:
      'Gatos são carnívoros estritos e precisam de nutrientes que a ração de cães não fornece na quantidade certa, como a taurina. A falta de taurina pode causar problemas no coração e na visão.',
    na_pratica: 'Cada espécie com a sua ração, de preferência adequada à fase de vida do animal.',
  },
  {
    categoria: 'Castração',
    afirmacao: 'A castração deixa o animal obeso.',
    veredito: 'MITO',
    explicacao:
      'Depois da castração o gasto de energia diminui e o apetite pode aumentar, mas o que engorda é o excesso de comida, não a cirurgia. Com a quantidade de ração ajustada e atividade física, o pet mantém o peso ideal.',
    na_pratica: 'Peça ao veterinário para recalcular a quantidade de ração depois da castração.',
  },
  {
    categoria: 'Castração',
    afirmacao: 'A cadela precisa ter uma cria antes de ser castrada.',
    veredito: 'MITO',
    explicacao:
      'Não existe benefício para a saúde em ter uma ninhada antes da castração. Pelo contrário: castrar antes do primeiro cio reduz muito o risco de tumores de mama e evita a piometra, uma infecção grave no útero.',
    na_pratica: 'Converse com o veterinário sobre a melhor idade para castrar o seu pet.',
  },
  {
    categoria: 'Cuidados',
    afirmacao: 'Gatos sempre caem de pé, então quedas de janela não são perigosas.',
    veredito: 'MITO',
    explicacao:
      'O gato tem um reflexo que ajuda a virar o corpo no ar, mas isso não impede fraturas e lesões na boca e no tórax. Quedas de janelas e sacadas são tão comuns que têm até nome: síndrome do gato paraquedista.',
    na_pratica: 'Instale telas de proteção em janelas, sacadas e varandas.',
  },
  {
    categoria: 'Comportamento',
    afirmacao: 'Cachorro abanando o rabo está sempre feliz.',
    veredito: 'MITO',
    explicacao:
      'Abanar o rabo mostra que o cão está agitado ou atento. Pode ser alegria, mas também ansiedade, insegurança ou alerta. A posição do rabo, das orelhas e do corpo todo ajuda a entender o que ele sente.',
    na_pratica:
      'Não se aproxime de um cão desconhecido só porque ele está abanando o rabo. Observe o corpo todo e peça licença ao tutor.',
  },
  {
    categoria: 'Vacinas',
    afirmacao: 'A raiva pode passar dos pets para as pessoas.',
    veredito: 'VERDADE',
    explicacao:
      'A raiva é uma zoonose: passa pela mordida ou arranhão de animais infectados e é quase sempre fatal. Vacinar cães e gatos é a principal forma de proteger os animais e a família.',
    na_pratica:
      'Mantenha a vacina antirrábica em dia. Em caso de mordida de animal desconhecido, lave o local com água e sabão e procure um serviço de saúde.',
  },
  {
    categoria: 'Cuidados',
    afirmacao: 'Pets também precisam escovar os dentes.',
    veredito: 'VERDADE',
    explicacao:
      'A doença periodontal é um dos problemas mais comuns em cães e gatos adultos. O tártaro causa mau hálito e dor, e as bactérias da boca podem chegar a outros órgãos.',
    na_pratica:
      'Use escova e creme dental próprios para pets (o de gente não pode ser engolido) e comece aos poucos, com petisco de recompensa.',
  },
  {
    categoria: 'Parasitas',
    afirmacao: 'Coleira repelente ajuda a prevenir a leishmaniose.',
    veredito: 'VERDADE',
    explicacao:
      'Coleiras repelentes, como as de deltametrina, diminuem as picadas do mosquito-palha, que transmite a leishmaniose. Elas são uma das principais ferramentas de prevenção, junto com os cuidados com o ambiente.',
    na_pratica:
      'Troque a coleira no prazo indicado pelo fabricante e pergunte ao veterinário quais outros cuidados valem para a sua região.',
  },
];

export const MENSAGEM_FINAL =
  'Guarda responsável é vacinar com orientação, manter a prevenção contra parasitas em dia, nunca automedicar e levar ao veterinário regularmente.';
