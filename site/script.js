"use strict";

/* ============ ARMAZENAMENTO ============ */
const Guardar = (() => {
  let ok = true, mem = {};
  try{ localStorage.setItem("__t","1"); localStorage.removeItem("__t"); }catch(e){ ok = false; }
  return {
    ler(k){ try{ return ok ? JSON.parse(localStorage.getItem(k)) : (mem[k] ?? null); }catch(e){ return null; } },
    gravar(k,v){ try{ ok ? localStorage.setItem(k,JSON.stringify(v)) : mem[k]=v; }catch(e){ mem[k]=v; } },
    apagar(k){ try{ ok ? localStorage.removeItem(k) : delete mem[k]; }catch(e){} }
  };
})();
const K_US="doce.usuarios", K_SE="doce.sessao", K_PR="doce.progresso.";

/* ============ RETRATOS (SVG, estilo polaroide desenhada) ============ */
function retrato(p){
  return `<svg viewBox="0 0 160 190" role="img" aria-label="Retrato de ${p.nome}">
    <defs><linearGradient id="g${p.id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.f1}"/><stop offset="1" stop-color="${p.f2}"/></linearGradient></defs>
    <rect width="160" height="190" fill="url(#g${p.id})"/>
    <circle cx="80" cy="66" r="52" fill="rgba(255,255,255,.05)"/>
    <path d="M18 190c0-33 28-52 62-52s62 19 62 52z" fill="${p.roupa}"/>
    <path d="M62 118h36v22H62z" fill="${p.pele}"/>
    ${p.cabelo}
    <ellipse cx="80" cy="84" rx="30" ry="36" fill="${p.pele}"/>
    <ellipse cx="69" cy="82" rx="3.4" ry="${p.olho}" fill="#241C16"/>
    <ellipse cx="91" cy="82" rx="3.4" ry="${p.olho}" fill="#241C16"/>
    <path d="${p.sob}" stroke="#2A211A" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M77 92q3 5 6 0" stroke="#2A211A" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="${p.boca}" stroke="#7A3F3A" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    ${p.frente||""}
    <rect width="160" height="190" fill="#C8A05A" opacity=".08"/></svg>`;
}
const ELENCO = {
  icaro:{id:"icaro",nome:"Ícaro",papel:"convidado distante · seus olhos nesta noite",
    f1:"#2A3238",f2:"#12181A",roupa:"#33424A",pele:"#C79E7C",olho:3,
    cabelo:`<path d="M48 82q0-44 32-44t32 44q0-22-32-22T48 82z" fill="#3A2E23"/>`,
    sob:"M62 71h14 M84 71h14",boca:"M73 102h14",
    frente:`<circle cx="46" cy="90" r="10" fill="none" stroke="#1B1712" stroke-width="3"/>
            <circle cx="114" cy="90" r="10" fill="none" stroke="#1B1712" stroke-width="3"/>
            <path d="M56 90h48" stroke="#1B1712" stroke-width="3"/>`},
  mateus:{id:"mateus",nome:"Mateus",papel:"anfitrião · vítima",morto:true,
    f1:"#2A2E33",f2:"#14181B",roupa:"#39424A",pele:"#C9A183",olho:.6,
    cabelo:`<path d="M48 76q2-42 32-42t32 42q-6-20-32-20T48 76z" fill="#2E2620"/>`,
    sob:"M62 71h14 M84 71h14",boca:"M72 103h16"},
  angelica:{id:"angelica",nome:"Angélica",papel:"comediante de humor mórbido",
    f1:"#3A2732",f2:"#1A1218",roupa:"#7A2F45",pele:"#D9AE8C",olho:4.2,
    cabelo:`<path d="M44 92q-4-56 36-56t36 56q-4-16-10-26-12 10-26 8t-24-10q-8 10-12 28z" fill="#3B1F1C"/>
            <circle cx="46" cy="96" r="12" fill="#3B1F1C"/><circle cx="114" cy="96" r="12" fill="#3B1F1C"/>`,
    sob:"M61 70q8-5 16-1 M83 69q8-4 16 1",boca:"M69 101q11 10 22 -1"},
  mariane:{id:"mariane",nome:"Mariane",papel:"nervosa e desconfiada",
    f1:"#26333A",f2:"#111A1E",roupa:"#4C5A52",pele:"#B98A67",olho:5,
    cabelo:`<path d="M46 86q0-48 34-48t34 48q2-26-10-34-10 8-24 8t-24-8q-12 8-10 34z" fill="#171310"/>
            <path d="M42 86q-2 40 8 56-14-16-12-56z" fill="#171310"/>
            <path d="M118 86q2 40-8 56 14-16 12-56z" fill="#171310"/>`,
    sob:"M61 68q8-3 15 2 M84 70q7-5 15-2",boca:"M73 102q7 3 14 0",
    frente:`<path d="M52 60q28-16 56 0" stroke="#171310" stroke-width="7" fill="none"/>`},
  carla:{id:"carla",nome:"Carla",papel:"executiva prática e agressiva",
    f1:"#33302A",f2:"#17150F",roupa:"#25292E",pele:"#E0B694",olho:3.4,
    cabelo:`<path d="M47 80q0-44 33-44t33 44q0-22-33-22T47 80z" fill="#6B4322"/>
            <path d="M47 80v26l-6-4q-2-14 6-22z" fill="#6B4322"/>
            <path d="M113 80v26l6-4q2-14-6-22z" fill="#6B4322"/>`,
    sob:"M61 69q8-2 15 3 M84 72q7-5 15-3",boca:"M72 102h16",
    frente:`<rect x="62" y="132" width="36" height="8" fill="#8E2F28" opacity=".8"/>`},
  lais:{id:"lais",nome:"Laís",papel:"calma, prestativa e racional",
    f1:"#24333A",f2:"#0F171B",roupa:"#3C5B58",pele:"#CFA07C",olho:3.8,
    cabelo:`<path d="M48 82q0-46 32-46t32 46q0-24-32-24T48 82z" fill="#241A14"/>
            <path d="M48 82q-6 46 4 66 6-34 2-66z" fill="#241A14"/>
            <path d="M112 82q6 46-4 66-6-34-2-66z" fill="#241A14"/>`,
    sob:"M62 70h14 M84 70h14",boca:"M73 101q7 4 14 0"}
};

/* ============ PISTAS ============ */
const PISTAS = {
  embalagem:{t:"Embalagem com dobra",o:"sala de jantar",k:1,
    l:"Só um dos seis brigadeiros tinha uma dobra própria no papel. Era exatamente o que Mateus pegou.",
    a:"Outra leitura: Mateus marcava sozinho os doces que pretendia comer."},
  tacas:{t:"Seis taças no chão",o:"sala de jantar",
    l:"A queda do corpo derrubou as taças. Ninguém se moveu por alguns segundos — exceto quem já sabia.",
    a:"Outra leitura: o choque paralisa todo mundo, inclusive inocentes."},
  relogio:{t:"Relógio conferido demais",o:"sala de jantar",
    l:"Mateus olhou o relógio nove vezes durante o jantar. Esperava uma hora marcada.",
    a:"Outra leitura: ele apenas media quanto faltava para o anúncio que preparou."},
  cinzas:{t:"Cinzas de papel na lareira",o:"sala de estar",k:1,
    l:"Restos de papel queimado com timbre do projeto. Alguém destruiu documentos antes da sobremesa.",
    a:"Outra leitura: Mateus queimou o que não pretendia mostrar a ninguém."},
  cacau:{t:"Pote de cacau remexido",o:"cozinha",
    l:"Resíduo fino na borda e uma digital parcial. Alguém mexeu ali pouco antes do jantar.",
    a:"Outra leitura: a cozinha foi usada a noite toda; a marca pode ser de qualquer um."},
  copo:{t:"Copo d'água com sedimento",o:"cozinha",k:1,
    l:"O segundo ataque veio da água, não do doce. O assassino continua com acesso à casa.",
    a:"Outra leitura: o sedimento é do encanamento antigo da serra."},
  fundos:{t:"Porta dos fundos trancada por dentro",o:"cozinha",
    l:"Quem trancou está dentro da casa. Ninguém fugiu pela neve.",
    a:"Outra leitura: trancaram para impedir que alguém de fora entrasse."},
  passos:{t:"Passos no apagão",o:"corredor",
    l:"Três passos, pausa, mais dois. Quem andava conhecia a casa o bastante para não tropeçar.",
    a:"Outra leitura: Ícaro estava de fones; a contagem pode estar errada."},
  telefone:{t:"Telefone arrancado",o:"corredor",
    l:"O fio foi cortado com lâmina, não rompido pela neve. O isolamento foi decidido por alguém.",
    a:"Outra leitura: a linha da serra cai sozinha em toda tempestade."},
  gravacao:{t:"Gravação da festa de três anos atrás",o:"escritório",k:1,
    l:"Davi ameaça denunciar o desvio. A queda da varanda não soa como acidente.",
    a:"Outra leitura: o áudio tem cortes. Mateus pode ter editado o que lhe convinha."},
  transferencias:{t:"Extratos e transferências",o:"escritório",k:1,
    l:"Dinheiro saindo do projeto por rotas controladas por Carla, e um pagamento a uma testemunha.",
    a:"Outra leitura: as contas passavam por três diretores; assinar não é comandar."},
  recibo:{t:"Recibo de composto químico",o:"escritório",k:1,
    l:"A compra está no nome de Laís, seis semanas antes deste fim de semana.",
    a:"Outra leitura: o mesmo composto aparece em receitas de confeitaria."},
  celular:{t:"Celular de Davi",o:"quarto de hóspedes",k:1,
    l:"O aparelho que sumiu antes da polícia chegar, guardado há três anos por Laís.",
    a:"Outra leitura: guardar a prova não é o mesmo que ter causado a queda."},
  gerador:{t:"Gerador adulterado",o:"subsolo",k:1,
    l:"A pane foi programada. E o zumbido é idêntico ao ruído de fundo da gravação antiga.",
    a:"Outra leitura: o apagão não serviu para fugir, e sim para assustar alguém até confessar."},
  chave:{t:"Chave de metal",o:"entregue por Mariane",k:1,
    l:"Achada no corredor, limpa demais para o chão da casa. Abre o escritório, não o carro.",
    a:"Outra leitura: deixaram a chave ali para que ela fosse vista com a chave na mão."}
};

/* ============ MANSÃO (planta baixa + objetos) ============ */
const COMODOS = {
  jantar:{nome:"Sala de jantar",x:24,y:24,w:296,h:186,
    atmosfera:"O corpo já foi coberto com a toalha. As velas continuam acesas porque ninguém teve coragem de apagá-las.",
    objetos:[
      {id:"mesa",nome:"A mesa de mogno",txt:"Uma marca funda onde a testa bateu. O prato de Mateus está intacto: ele morreu antes de comer qualquer outra coisa."},
      {id:"caixa",nome:"A caixa de brigadeiros",txt:"Cinco lugares vazios e um papel amassado deixado para trás.",pista:"embalagem"},
      {id:"tacas",nome:"As taças no chão",txt:"Seis taças, todas caídas para o mesmo lado.",pista:"tacas"},
      {id:"relogio",nome:"O relógio de parede",txt:"Parou às 21h04 com o tranco da queda — e por isso registrou a hora exata.",pista:"relogio"}
    ]},
  estar:{nome:"Sala de estar",x:24,y:222,w:296,h:210,
    atmosfera:"A lareira ainda está quente. Foi aqui que Mateus discutiu com Carla por vinte minutos antes do jantar.",
    objetos:[
      {id:"lareira",nome:"A lareira",txt:"Sob as brasas, papel que não terminou de queimar.",pista:"cinzas"},
      {id:"poltrona",nome:"A poltrona de Mateus",txt:"Entre a almofada e o braço, um comprovante de farmácia com o nome dele. Ele estava doente e não contou a ninguém."},
      {id:"disco",nome:"A vitrola",txt:"O disco parou no mesmo ponto a noite toda. Alguém levantou a agulha às nove em ponto."}
    ]},
  corredor:{nome:"Corredor dos quartos",x:336,y:24,w:112,h:408,
    atmosfera:"Escuro, estreito, com um tapete comprido que abafa o som. De onde vieram os passos durante o apagão.",
    objetos:[
      {id:"tapete",nome:"O tapete comprido",txt:"Marcas de pressão recentes, espaçadas de forma estranha: três, pausa, duas.",pista:"passos"},
      {id:"telefone",nome:"O telefone da parede",txt:"O fio pende cortado, com corte limpo.",pista:"telefone"},
      {id:"quadro",nome:"O quadro torto",txt:"Uma foto do grupo há três anos. Davi aparece no canto, cortado pela moldura."}
    ]},
  cozinha:{nome:"Cozinha",x:464,y:24,w:312,h:160,
    atmosfera:"Carla esteve aqui sozinha por quatro minutos. Mariane viu uma mão mexendo no pote de cacau.",
    objetos:[
      {id:"cacau",nome:"O pote de cacau",txt:"Uma digital parcial na borda e resíduo fino.",pista:"cacau"},
      {id:"pia",nome:"A pia",txt:"Um copo pela metade com sedimento no fundo.",pista:"copo"},
      {id:"fundos",nome:"A porta dos fundos",txt:"Trancada, e a tranca está deste lado.",pista:"fundos"},
      {id:"lixo",nome:"O lixo",txt:"Papéis de doce, todos rasgados do mesmo jeito. Menos um, aberto com cuidado pela dobra."}
    ]},
  escritorio:{nome:"Escritório",x:464,y:196,w:312,h:130,exige:"chave",bloqueio:"trancado",
    atmosfera:"O cômodo que Mateus prometeu abrir no jantar. Cheiro de papel guardado e fita magnética.",
    objetos:[
      {id:"gravador",nome:"O gravador de fita",txt:"Uma fita rotulada apenas com uma data de três anos atrás.",pista:"gravacao"},
      {id:"arquivo",nome:"O arquivo de aço",txt:"Pastas organizadas por pessoa. A mais grossa tem o nome de Carla.",pista:"transferencias"},
      {id:"gaveta",nome:"A gaveta trancada",txt:"Cede com a chave. Dentro, um recibo que Mateus guardou como quem guarda uma arma.",pista:"recibo"}
    ]},
  quarto:{nome:"Quarto de hóspedes",x:464,y:338,w:312,h:94,
    atmosfera:"Três malas, nenhuma desfeita por completo. Ninguém pretendia ficar muito tempo.",
    objetos:[
      {id:"mala",nome:"A mala de Laís",txt:"No forro, um aparelho antigo, descarregado e cuidadosamente embrulhado.",pista:"celular"},
      {id:"caderno",nome:"Um caderno de anotações",txt:"Observações sobre cada convidado: horários, hábitos, o que cada um bebe. Nenhuma assinatura."},
      {id:"casaco",nome:"Um casaco de manga escura",txt:"Manga escura, como a que Mariane descreveu. Está pendurado onde qualquer um poderia ter pegado."}
    ]},
  subsolo:{nome:"Subsolo",x:24,y:462,w:752,h:88,
    atmosfera:"Frio, úmido, com o gerador estalando desde a hora da morte. O som enche a casa inteira.",
    objetos:[
      {id:"gerador",nome:"O gerador",txt:"Um cabo foi religado fora de ordem. A pane tinha hora marcada.",pista:"gerador"},
      {id:"ferramentas",nome:"A caixa de ferramentas",txt:"Falta um alicate. O contorno de poeira mostra que sumiu há pouco."}
    ]}
};

/* ============ INTERROGATÓRIO — perguntas e respostas fixas ============
   As personalidades e segredos seguem exatamente o que já está definido
   na história: nada aqui muda de acordo com o jogador. */
const PERGUNTAS = {
  angelica:[
    { id:"riso", pergunta:"Por que você riu quando ele caiu?",
      resposta:"— Mecanismo de defesa. Eu rio de caixão, de demissão, de tudo. Você queria o quê, uma reverência? Eu não escolhi rir, simplesmente ri." },
    { id:"programa", pergunta:"Você usou a morte do Davi no seu programa.",
      resposta:"— Usei. Mudei os nomes e dormi bem por dois anos. Mateus tinha o recorte impresso numa gaveta, como se fosse prova de alguma coisa.",
      pista:null },
    { id:"horario", pergunta:"A que horas você saiu da festa, há três anos?",
      resposta:"— Falei que saí antes da confusão. Não saí. Fiquei perto o suficiente pra ouvir a discussão e longe o suficiente pra dizer que não vi nada." }
  ],
  mariane:[
    { id:"chave", pergunta:"O que é essa chave na sua mão?",
      resposta:"— Estava no corredor, no chão, limpa demais pro chão daqui. Pode ficar com você. Eu não quero mais.",
      pista:"chave" },
    { id:"cozinha", pergunta:"O que você viu na cozinha?",
      resposta:"— Uma mão no pote de cacau. Manga escura. Não olhei o rosto. As paredes daqui repetem o que ouvem, sabia?",
      pista:"cacau" },
    { id:"paredes", pergunta:"O que você quer dizer com 'as paredes repetem'?",
      resposta:"— O gerador. Esse barulho. Eu já ouvi esse barulho antes, há três anos, na noite em que o Davi caiu. Alguém trouxe a gente pra essa casa de propósito." }
  ],
  carla:[
    { id:"sozinha", pergunta:"Você ficou sozinha na cozinha.",
      resposta:"— Fiquei. Fui buscar gelo e respirar longe dele. Isso não põe a minha mão no doce. Quatro minutos, se você quer contar." },
    { id:"dinheiro", pergunta:"Mateus estava te chantageando com o desvio.",
      resposta:"— Estava. Há onze meses. Você acha que eu ia esperar a sobremesa de um sábado pra resolver isso do jeito mais estúpido possível?" },
    { id:"documentos", pergunta:"Para quem ele mandou cópia dos documentos?",
      resposta:"— Não sei. Só sei que ele disse isso pra me deixar quieta, e que agora ele está morto e eu continuo sem saber. Pergunte pra quem sabia demais sobre a rotina dele.",
      pista:"transferencias" }
  ],
  lais:[
    { id:"doce", pergunta:"Você sabia qual brigadeiro ele ia escolher.",
      resposta:"— Sabia. Todos sabiam, se prestassem atenção: café, sempre café. Prestar atenção não é crime." },
    { id:"composto", pergunta:"Existe uma compra de composto químico no seu nome.",
      resposta:"— Existe. Eu marquei uma embalagem com um composto invisível pra saber quem abriria a caixa. Eu queria uma confissão, não um corpo.",
      pista:"recibo" },
    { id:"gerador", pergunta:"O gerador foi mexido. E o ruído dele está numa gravação antiga.",
      resposta:"— Mateus escolheu essa casa por causa desse som. Ele queria que eu e a Mariane lembrássemos daquela noite. Eu só usei o mesmo som contra ele.",
      pista:"gerador" }
  ]
};

/* ============ PRÓLOGO ============ */
const PROLOGO = [
  { local:"estrada da serra · 17h40",
    txt:[`A van parou onde a estrada deixa de ser estrada. Daí em diante era neve, e a casa aparecia entre os pinheiros como se tivesse sido esquecida ali.`,
      `Você é <b>Ícaro</b>. Aceitou o convite porque queria passar um fim de semana longe de gente, o que é uma razão estranha para ir a uma festa. Não tem intimidade com ninguém do grupo. Usa fones quase o tempo todo, e é por isso que todo mundo assume que você não está prestando atenção.`,
      `Nenhum deles vai se lembrar de baixar a voz perto de você. Essa é a sua única vantagem.`] },
  { local:"hall de entrada · 18h10",
    txt:[`Mateus recebeu todo mundo com um abraço que durou dois segundos a mais do que devia.`,
      `<span class="fala-destaque">— Que bom que veio. Sério. Você vai ver que valeu.</span>`,
      `Ele disse isso para cada convidado, com a mesma frase e a mesma pausa. E conferiu o relógio depois de cada um.`],
    escolha:{ pergunta:"Você responde o quê?",
      opcoes:[
        { txt:"\u201cValeu o quê?\u201d — e sustenta o olhar.", nota:"Ele desvia o assunto. Mas registra que você perguntou." },
        { txt:"Um aceno. Você recoloca o fone.", nota:"Ele relaxa na hora. Já te descartou como plateia." }
      ] } },
  { local:"sala de estar · 19h20",
    txt:[`Angélica contou uma piada sobre funeral antes mesmo de tirar o casaco. Carla riu por educação e voltou para o celular. Mariane não riu: ficou de pé perto da parede, olhando o corredor como quem espera alguém passar.`,
      `Laís foi a única que perguntou o seu nome duas vezes, e na segunda acertou a pronúncia.`],
    escolha:{ pergunta:"Antes do jantar, você se aproxima de quem?",
      opcoes:[
        { txt:"De Mariane, que está sozinha e visivelmente mal.", nota:"Ela não fala muito. Mas para de olhar para o corredor enquanto você está ali." },
        { txt:"De Angélica, para entrar na piada dela.", nota:"Ela te adota como plateia pelo resto da noite." },
        { txt:"De Carla, que parece a única com pressa de ir embora.", nota:"Ela responde em frases de três palavras, mas responde." },
        { txt:"De ninguém. Você senta e escuta.", nota:"Laís nota que você escolheu não falar com ninguém. E parece aprovar." }
      ] } },
  { local:"corredor · 20h05",
    txt:[`Você foi buscar água e ouviu, através do fone, uma discussão na sala de estar. Mateus e Carla. Palavras soltas: <i>prazo</i>, <i>conta</i>, <i>não é ameaça</i>.`,
      `Quando você passou pela porta, os dois pararam ao mesmo tempo. Ninguém finge tão mal quanto duas pessoas que acabaram de brigar por dinheiro.`] },
  { local:"sala de jantar · 20h50",
    txt:[`A caixa de brigadeiros artesanais estava no centro da mesa desde o começo, e Mateus pediu que ninguém tocasse nela até a sobremesa.`,
      `O aviso ocupava metade da embalagem:`,
      `<span class="fala-destaque">O melhor doce da sua vida até o seu último suspiro.</span>`,
      `Você leu a frase duas vezes. Não parecia uma piada particularmente boa. Também não parecia uma ameaça.`] },
  { local:"sala de jantar · 21h00",
    txt:[`Mateus se levantou, olhou o relógio pela nona vez e pegou um brigadeiro. O papel dele tinha uma dobra que os outros não tinham.`,
      `<span class="fala-destaque">— Antes de comermos, preciso contar uma coisa.</span>`,
      `Ele não terminou a frase. O corpo caiu sobre a mesa de mogno e derrubou seis taças. O gerador estalou no subsolo. Por um instante ninguém se moveu.`,
      `Então Angélica riu. Um som curto, involuntário e horrível.`] },
  { local:"sala de jantar · 21h07",
    txt:[`Mariane apontava para a caixa.`,
      `<span class="fala-destaque">— Não foi o brigadeiro. Foi a marca.</span>`,
      `Entre os dedos dela havia uma pequena chave de metal que não pertencia à cozinha. Você tirou um dos fones. Do corredor veio uma porta se fechando. Depois três passos. Pausa. Mais dois.`,
      `As luzes apagaram. No escuro, uma embalagem foi aberta perto do seu rosto, e uma voz baixa disse: <i>não foi uma maldição, foi uma escolha</i>.`,
      `Quando o gerador voltou, a porta do escritório estava aberta e a caixa de brigadeiros havia sumido.`],
    fim:true }
];

/* ============ ACUSAÇÃO — 5 finais, um por acusado ============ */
const ACUSADOS = [
  {id:"carla",nome:"Carla",nota:"Motivo mais claro, acesso à cozinha, dinheiro desviado."},
  {id:"lais",nome:"Laís",nota:"Comprou o composto, alterou o gerador, marcou a embalagem."},
  {id:"dupla",nome:"Laís e Carla, juntas",nota:"Duas responsabilidades diferentes na mesma noite — exige mais provas reunidas."},
  {id:"mariane",nome:"Mariane",nota:"Estava com a chave e viu parte do crime antigo."},
  {id:"angelica",nome:"Angélica",nota:"Mentiu sobre o horário e lucrou com a tragédia."}
];

const MIN_PARA_DUPLA = 7; // de 15 pistas possíveis

const FINAIS = {
  carla:{ correto:true, m:"final: a experiência perfeita", t:"Carla é presa. Laís desaparece.",
    p:["Você aponta para Carla, e as provas realmente sustentam a acusação: o desvio de dinheiro, os minutos sozinha na cozinha, a chantagem de Mateus.",
       "Ela é presa ainda naquela madrugada. O que você não vê — e só descobre tarde demais — é Laís recolhendo a gravação original antes de qualquer policial subir a serra.",
       "O caso se fecha oficialmente. Mas a pessoa que armou o cenário inteiro, que alterou o gerador e marcou a embalagem, sai pela porta da frente sem que ninguém pergunte nada."] },
  lais:{ correto:true, m:"final: a última escolha de laís", t:"Você encurrala Laís — mas ela também te encurrala.",
    p:["Você reúne o gerador, a gravação e a embalagem marcada e confronta Laís diretamente, diante de todos.",
       "Ela não nega. Admite ter preparado o experimento inteiro para arrancar uma confissão, e afirma que Carla aproveitou o palco pronto para matar de verdade.",
       "Então ela te oferece uma escolha, não uma prova: entregar todos os envolvidos agora, ou deixar a peça mais importante desaparecer em troca da liberdade de Mariane. O jogo termina numa decisão moral, não policial — e essa decisão é sua."] },
  dupla:{ correto:true, m:"final: a verdade completa", t:"Você reconstrói a noite inteira.",
    p:["Você põe a embalagem marcada, o recibo, o gerador e a gravação lado a lado sobre a mesa de mogno e deixa que as provas falem por si.",
       "Diante de tudo isso, Laís admite o experimento — o marcador invisível, as informações falsas, o gerador adulterado. Ela queria uma confissão. Carla aproveitou o cenário pronto e trocou o conteúdo do doce reservado.",
       "Quando a polícia finalmente sobe a serra, encontra um grupo dividido, mas uma cadeia de acontecimentos que dá para reconstruir do começo ao fim — inclusive a noite em que Davi caiu, três anos atrás."] },
  mariane:{ correto:false, m:"acusação equivocada", t:"Um inocente é levado. O caso continua aberto.",
    p:["Você aponta para Mariane. Ela tem a chave na mão, viu o crime antigo de perto e treme quando é confrontada — mas nada disso a torna culpada de envenenar ninguém.",
       "A polícia a leva mesmo assim, porque é a única versão que alguém apresentou com convicção. Carla e Laís trocam um olhar rápido e voltam para dentro de casa.",
       "Você acabou de prender uma testemunha assustada e deixar o verdadeiro plano intacto. A neve ainda não cedeu de vez — há tempo de reunir mais provas e tentar de novo."] },
  angelica:{ correto:false, m:"acusação equivocada", t:"Um inocente é levado. O caso continua aberto.",
    p:["Você aponta para Angélica. Ela mentiu sobre o horário, lucrou com a tragédia antiga e ri nos momentos errados — mas mentir e lucrar não é o mesmo que envenenar.",
       "Ela é levada em meio a um riso nervoso que, dessa vez, não é resposta a piada nenhuma. Ninguém mais na sala parece surpreso o suficiente para ser inocente.",
       "Você acabou de prender a pessoa errada. A neve ainda não cedeu de vez — há tempo de reunir mais provas e tentar de novo."] }
};

/* ============ ESTADO ============ */
const novoJogo = () => ({
  provas:[], examinados:[], conversas:{angelica:[],mariane:[],carla:[],lais:[]},
  perguntasFeitas:{angelica:[],mariane:[],carla:[],lais:[]},
  registro:[], cenaAtual:0, suspeitoAtivo:null, comodoAberto:null,
  acusado:null, ultimaTela:"prologo", ultimaEscolha:"nenhuma ainda"
});
let usuario=null, jogo=novoJogo(), telaAtual="site";
const $ = s => document.querySelector(s);
const chaves = () => jogo.provas.filter(p=>PISTAS[p].k).length;
const anotar = t => { jogo.registro.unshift(t); if(jogo.registro.length>40) jogo.registro.pop(); };
function salvar(){ if(!usuario) return; jogo.ultimaTela = telaAtual; Guardar.gravar(K_PR+usuario.email, jogo); }

/* ============ NAVEGAÇÃO ============ */
const TELAS=["login","cadastro","menu","perfil","prologo","mansao","comodo","mural","suspeitos","acusacao","final"];
const COM_BARRA=["mansao","comodo","mural","suspeitos","acusacao"];
function ir(t){
  telaAtual=t;
  $("#site").classList.toggle("oculto", t!=="site");
  TELAS.forEach(x=>$("#tela-"+x).classList.toggle("oculto", x!==t));
  $("#barra").classList.toggle("oculto", !COM_BARRA.includes(t));
  document.querySelectorAll(".menu button").forEach(b=>
    b.setAttribute("aria-current", b.dataset.ir===t || (t==="comodo"&&b.dataset.ir==="mansao")));
  if(t==="prologo") pintarCena();
  if(t==="mansao") pintarMansao();
  if(t==="comodo") pintarComodo();
  if(t==="mural") pintarMural();
  if(t==="suspeitos") pintarSuspeitos();
  if(t==="acusacao") pintarAcusacao();
  if(COM_BARRA.includes(t)){ $("#pino").textContent = jogo.provas.length||""; salvar(); }
  window.scrollTo(0,0);
}
document.querySelectorAll(".menu button").forEach(b=>b.onclick=()=>ir(b.dataset.ir));

/* ============ SITE ============ */
$("#foto-icaro").innerHTML = `<div class="polaroid" style="transform:rotate(1.5deg)">${retrato(ELENCO.icaro)}
  <div class="legenda"><strong>Ícaro</strong><em>convidado distante · seus olhos nesta noite</em></div></div>`;
$("#foto-mateus").innerHTML = `<div class="polaroid" style="transform:rotate(-2deg)">${retrato(ELENCO.mateus)}
  <div class="legenda"><strong>Mateus</strong><em>anfitrião · morto às 21h00</em></div></div>`;
$("#galeria-site").innerHTML = ["angelica","mariane","carla","lais"].map(id=>{
  const p=ELENCO[id];
  return `<div class="polaroid">${retrato(p)}<div class="legenda"><strong>${p.nome}</strong><em>${p.papel}</em></div></div>`;
}).join("");
$("#ir-entrar").onclick = () => { const e=Guardar.ler(K_SE), u=e&&usuarios()[e]; u?entrarComo(u):ir("login"); };
$("#btn-voltar-site1").onclick = () => ir("site");

/* ============ CONTA ============ */
const usuarios = () => Guardar.ler(K_US) || {};
$("#ir-cadastro").onclick=()=>ir("cadastro");
$("#ir-login").onclick=()=>ir("login");
$("#btn-site").onclick=()=>ir("site");

$("#btn-cadastrar").onclick=()=>{
  const nome=$("#c-nome").value.trim(), email=$("#c-email").value.trim().toLowerCase();
  const s1=$("#c-senha").value, s2=$("#c-senha2").value, e=$("#c-erro");
  if(!nome) return e.textContent="Escreva um nome.";
  if(!/^\S+@\S+\.\S+$/.test(email)) return e.textContent="Esse e-mail não parece válido.";
  if(s1.length<6) return e.textContent="A senha precisa de pelo menos 6 caracteres.";
  if(s1!==s2) return e.textContent="As duas senhas não batem.";
  const us=usuarios();
  if(us[email]) return e.textContent="Já existe um cadastro com esse e-mail.";
  us[email]={nome,email,senha:s1}; Guardar.gravar(K_US,us); e.textContent="";
  entrarComo(us[email]);
};
$("#btn-entrar").onclick=()=>{
  const email=$("#l-email").value.trim().toLowerCase(), u=usuarios()[email];
  if(!u||u.senha!==$("#l-senha").value) return $("#l-erro").textContent="E-mail ou senha não conferem.";
  $("#l-erro").textContent=""; entrarComo(u);
};
function entrarComo(u){
  usuario=u; Guardar.gravar(K_SE,u.email); $("#quem").textContent=u.nome;
  const salvo=Guardar.ler(K_PR+u.email);
  $("#saudacao").textContent = "Caso 4471, "+u.nome;
  $("#status-save").textContent = salvo
    ? `última ação: ${salvo.ultimaEscolha} · ${salvo.provas.length} provas no mural`
    : "investigação ainda não iniciada";
  $("#btn-continuar").disabled=!salvo;
  ir("menu");
}
$("#btn-continuar").onclick=()=>{
  const s=Guardar.ler(K_PR+usuario.email); if(!s) return;
  jogo=Object.assign(novoJogo(),s);
  ir(["prologo","mansao","comodo","mural","suspeitos","acusacao"].includes(s.ultimaTela)?s.ultimaTela:"mansao");
};
$("#btn-nova").onclick=()=>{ jogo=novoJogo(); Guardar.apagar(K_PR+usuario.email); ir("prologo"); };
$("#btn-sair").onclick=()=>{ Guardar.apagar(K_SE); usuario=null; ir("site"); };
$("#btn-menu").onclick=()=>entrarComo(usuario);

/* ============ PERFIL (dados da conta) ============ */
$("#btn-perfil").onclick = () => {
  $("#p-nome").value = usuario.nome;
  $("#p-email").value = usuario.email;
  $("#p-senha-atual").value = "";
  $("#p-senha-nova").value = "";
  $("#p-erro").textContent = ""; $("#p-sucesso").textContent = "";
  ir("perfil");
};
$("#btn-voltar-menu").onclick = () => entrarComo(usuario);
$("#btn-salvar-perfil").onclick = () => {
  const novoNome = $("#p-nome").value.trim();
  const novoEmail = $("#p-email").value.trim().toLowerCase();
  const senhaAtual = $("#p-senha-atual").value;
  const senhaNova = $("#p-senha-nova").value;
  const erro=$("#p-erro"), ok=$("#p-sucesso");
  erro.textContent=""; ok.textContent="";

  if(!novoNome) return erro.textContent="O nome não pode ficar em branco.";
  if(!/^\S+@\S+\.\S+$/.test(novoEmail)) return erro.textContent="Esse e-mail não parece válido.";
  if(senhaAtual !== usuario.senha) return erro.textContent="Senha atual incorreta.";

  const us = usuarios();
  if(novoEmail !== usuario.email && us[novoEmail]) return erro.textContent="Já existe uma conta com esse e-mail.";

  // move o progresso salvo se o e-mail (chave de conta) mudar
  const progresso = Guardar.ler(K_PR+usuario.email);
  delete us[usuario.email];
  const atualizado = { nome:novoNome, email:novoEmail, senha: senhaNova || usuario.senha };
  us[novoEmail] = atualizado;
  Guardar.gravar(K_US, us);
  if(progresso){ Guardar.apagar(K_PR+usuario.email); Guardar.gravar(K_PR+novoEmail, progresso); }
  Guardar.gravar(K_SE, novoEmail);

  usuario = atualizado;
  ok.textContent = "Dados atualizados com sucesso.";
  $("#quem").textContent = usuario.nome;
};

/* ============ PRÓLOGO ============ */
function pintarCena(){
  const c=PROLOGO[jogo.cenaAtual];
  $("#cena").innerHTML=`<span class="local">${c.local}</span>
    <div class="corpo">${c.txt.map(t=>`<p>${t}</p>`).join("")}</div>
    <div id="area-escolha"></div>
    <p class="passo">cena ${jogo.cenaAtual+1} de ${PROLOGO.length}</p>`;
  const area=$("#area-escolha");
  if(c.escolha){
    area.innerHTML=`<p style="color:var(--fraco);font-family:'Special Elite',monospace;font-size:13px;margin:26px 0 0">${c.escolha.pergunta}</p>
      <div class="escolhas">${c.escolha.opcoes.map((o,i)=>`<button data-i="${i}">${o.txt}</button>`).join("")}</div>`;
    area.querySelectorAll("button").forEach(b=>b.onclick=()=>{
      const o=c.escolha.opcoes[+b.dataset.i];
      jogo.ultimaEscolha=o.txt.replace(/<[^>]+>/g,"").slice(0,48);
      anotar(o.nota);
      area.innerHTML=`<div class="achado"><span class="m">consequência</span>${o.nota}</div>
        <div class="acoes"><button class="btn" id="seguir">Continuar</button></div>`;
      $("#seguir").onclick=avancarCena; salvar();
    });
  } else {
    area.innerHTML=`<div class="acoes"><button class="btn" id="seguir">${c.fim?"Começar a investigar":"Continuar"}</button></div>`;
    $("#seguir").onclick=avancarCena;
  }
}
function avancarCena(){
  if(PROLOGO[jogo.cenaAtual].fim){ anotar("Você tirou os dois fones. A partir daqui, a casa é sua."); ir("mansao"); return; }
  jogo.cenaAtual++; salvar(); pintarCena();
}

/* ============ MANSÃO ============ */
function pintarMansao(){
  const tot=Object.keys(PISTAS).length;
  $("#contador-provas").innerHTML = `Provas no mural: <b>${jogo.provas.length}</b> de ${tot}`;
  const grupos=Object.entries(COMODOS).map(([id,c])=>{
    const travado=c.exige && !jogo.provas.includes(c.exige);
    const rest=c.objetos.filter(o=>!jogo.examinados.includes(id+":"+o.id)).length;
    const cls="comodo-g"+(travado?" travado":"")+(rest===0?" limpo":"");
    const cx=c.x+16, cy=c.y+28;
    return `<g class="${cls}" data-comodo="${id}" tabindex="0" role="button" aria-label="${c.nome}">
      <rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}"/>
      <text class="nome" x="${cx}" y="${cy}">${c.nome}</text>
      <text class="conta" x="${cx}" y="${cy+20}">${travado?"trancado":rest?rest+" a revistar":"revistado"}</text>
    </g>`;
  }).join("");
  $("#area-planta").innerHTML=`
    <div class="planta"><svg viewBox="0 0 800 574" role="img" aria-label="Planta baixa da mansão">
      <rect x="10" y="10" width="780" height="554" fill="none" stroke="#2E3D3F" stroke-width="2"/>
      ${grupos}
      <text x="24" y="452" fill="#5C8283" font-family="'Special Elite',monospace" font-size="11">escada ↓</text>
    </svg></div>
    <p class="legenda-planta"><span>clique num cômodo para revistar</span>
      <span>o escritório exige a chave</span></p>`;
  document.querySelectorAll(".comodo-g").forEach(g=>{
    const abrir=()=>{
      const id=g.dataset.comodo, c=COMODOS[id];
      if(c.exige && !jogo.provas.includes(c.exige)){
        anotar("O escritório está trancado. Alguém na casa está com a chave certa.");
        pintarMansao(); return;
      }
      jogo.comodoAberto=id; ir("comodo");
    };
    g.onclick=abrir;
    g.onkeydown=e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); abrir(); } };
  });
  $("#registro").innerHTML=jogo.registro.map(r=>`<p>${r}</p>`).join("");
}

function pintarComodo(){
  const id=jogo.comodoAberto, c=COMODOS[id];
  $("#area-comodo").innerHTML=`
    <button class="btn sec" id="voltar-planta" style="margin-bottom:24px">← Voltar à planta</button>
    <div class="cabeca-comodo"><span class="carimbo">${id==="subsolo"?"subsolo":"térreo"}</span>
      <h2>${c.nome}</h2><p>${c.atmosfera}</p></div>
    <div class="objetos" id="objetos"></div>
    <div id="resultado"></div>`;
  $("#voltar-planta").onclick=()=>ir("mansao");
  const alvo=$("#objetos");
  c.objetos.forEach(o=>{
    const visto=jogo.examinados.includes(id+":"+o.id);
    const b=document.createElement("button");
    b.className="objeto"+(visto?" visto":"");
    b.innerHTML=`<h4>${o.nome}</h4><span class="st">${visto?"já examinado":"examinar"}</span>`;
    b.onclick=()=>examinar(id,o);
    alvo.appendChild(b);
  });
}

function examinar(comodoId,o){
  const marca=comodoId+":"+o.id, novo=!jogo.examinados.includes(marca);
  if(novo) jogo.examinados.push(marca);
  let extra="";
  if(novo && o.pista && !jogo.provas.includes(o.pista)){
    jogo.provas.push(o.pista);
    anotar(`${COMODOS[comodoId].nome}: <strong>${PISTAS[o.pista].t.toLowerCase()}</strong> foi para o mural.`);
    if(o.pista==="chave") anotar("O escritório agora pode ser aberto.");
    extra=`<p style="margin:12px 0 0;color:var(--lampada);font-family:'Special Elite',monospace;font-size:12px">
      nova prova no mural: ${PISTAS[o.pista].t.toLowerCase()}</p>`;
  }
  jogo.ultimaEscolha=`examinou ${o.nome.toLowerCase()}`;
  pintarComodo();
  $("#resultado").innerHTML=`<div class="achado"><span class="m">${o.nome}</span>${o.txt}${extra}</div>`;
  $("#resultado").scrollIntoView({block:"nearest"});
  $("#pino").textContent=jogo.provas.length||""; salvar();
}

/* ============ MURAL ============ */
function pintarMural(){
  const a=$("#mural-conteudo");
  if(!jogo.provas.length){ a.innerHTML=`<div class="vazio">O mural está vazio. Comece pela sala de jantar.</div>`; return; }
  a.innerHTML=`<div class="mural">`+jogo.provas.map(id=>{const p=PISTAS[id];
    return `<article class="ficha"><span class="origem">${p.o}</span><h4>${p.t}</h4>
      <p class="leitura">${p.l}</p><p class="alt">${p.a}</p></article>`;}).join("")+`</div>`;
}

/* ============ INTERROGATÓRIO (perguntas fixas) ============ */
function pintarSuspeitos(){
  const g=$("#galeria-jogo"); g.innerHTML="";
  ["angelica","mariane","carla","lais"].forEach(id=>{
    const p=ELENCO[id];
    const b=document.createElement("button");
    b.className="polaroid"; b.setAttribute("aria-pressed", jogo.suspeitoAtivo===id);
    b.innerHTML=retrato(p)+`<div class="legenda"><strong>${p.nome}</strong><em>${p.papel}</em></div>`;
    b.onclick=()=>{ jogo.suspeitoAtivo=id; pintarSuspeitos(); salvar(); };
    g.appendChild(b);
  });
  pintarSala();
}
function pintarSala(){
  const a=$("#sala"), id=jogo.suspeitoAtivo;
  if(!id){ a.innerHTML=`<p style="color:var(--fraco);font-family:'Special Elite',monospace;font-size:13px;margin:0">
    Escolha um retrato para ver as perguntas disponíveis.</p>`; return; }
  const h=jogo.conversas[id]||[];
  const feitas = jogo.perguntasFeitas[id]||[];
  a.innerHTML=`
    <div class="conversa" id="conversa">${h.length?h.map(m=>`<div class="msg ${m.q}"><span>${m.t}</span></div>`).join("")
      :`<div class="msg sistema">${ELENCO[id].nome} espera a sua primeira pergunta.</div>`}</div>
    <div class="perguntas">${PERGUNTAS[id].map(p=>{
      const usada = feitas.includes(p.id);
      return `<button class="pergunta-btn" data-p="${p.id}" ${usada?"disabled":""}>${p.pergunta}
        ${usada?'<span class="marcado">já perguntado</span>':""}</button>`;
    }).join("")}</div>`;
  a.querySelectorAll(".pergunta-btn:not(:disabled)").forEach(b=>b.onclick=()=>perguntar(id,b.dataset.p));
  const conv=$("#conversa"); conv.scrollTop=conv.scrollHeight;
}
function perguntar(id,perguntaId){
  const p = PERGUNTAS[id].find(x=>x.id===perguntaId);
  jogo.perguntasFeitas[id].push(perguntaId);
  jogo.conversas[id].push({q:"eu",t:p.pergunta});
  jogo.conversas[id].push({q:"ele",t:p.resposta});
  jogo.ultimaEscolha=`perguntou a ${ELENCO[id].nome}: "${p.pergunta}"`;
  if(p.pista && !jogo.provas.includes(p.pista)){
    jogo.provas.push(p.pista);
    jogo.conversas[id].push({q:"sistema",t:`nova prova no mural: ${PISTAS[p.pista].t.toLowerCase()}`});
    anotar(`${ELENCO[id].nome} entregou: <strong>${PISTAS[p.pista].t.toLowerCase()}</strong>.`);
  }
  pintarSala();
  $("#pino").textContent=jogo.provas.length||""; salvar();
}

/* ============ ACUSAÇÃO ============ */
function pintarAcusacao(){
  $("#aviso").textContent = `O telefone voltou por alguns minutos. Você reuniu ${jogo.provas.length} de ${Object.keys(PISTAS).length} provas. Escolha com cuidado: acusar a pessoa errada não fecha o caso — leva um inocente e deixa o verdadeiro responsável livre.`;
  const a=$("#lista-acusados"); a.innerHTML="";
  ACUSADOS.forEach(x=>{
    const b=document.createElement("button");
    b.className="acusado"; b.setAttribute("aria-pressed", jogo.acusado===x.id);
    b.innerHTML=`<h3>${x.nome}</h3><p>${x.nota}</p>`;
    b.onclick=()=>{ jogo.acusado=x.id; jogo.ultimaEscolha=`selecionou ${x.nome} para acusação`; pintarAcusacao(); salvar(); };
    a.appendChild(b);
  });
  $("#btn-acusar").disabled=!jogo.acusado;
}
$("#btn-acusar").onclick=()=>{
  if(jogo.acusado==="dupla" && chaves()<MIN_PARA_DUPLA){
    encerrarInsuficiente();
    return;
  }
  encerrar(jogo.acusado);
};

function encerrarInsuficiente(){
  jogo.ultimaEscolha = "tentou acusar as duas sem provas suficientes";
  salvar();
  $("#f-marca").textContent = "provas insuficientes";
  $("#f-titulo").textContent = "Você não consegue sustentar as duas acusações ao mesmo tempo.";
  $("#f-texto").innerHTML = `<p>Apontar Laís e Carla juntas exige provas que fechem a participação de cada uma separadamente. Com o que você tem agora, a acusação cai por contradição antes mesmo de chegar à delegacia da cidade.</p>
    <p>Volte à mansão e reúna mais evidências antes de tentar de novo.</p>`;
  $("#f-resumo").classList.add("oculto");
  $("#f-acoes").innerHTML = `<button class="btn" id="btn-tentar-de-novo">Voltar à acusação</button>
    <button class="btn sec" id="btn-para-mansao">Voltar à mansão</button>`;
  $("#btn-tentar-de-novo").onclick = () => ir("acusacao");
  $("#btn-para-mansao").onclick = () => ir("mansao");
  ir("final");
}

function encerrar(idAcusado){
  const f = FINAIS[idAcusado];
  jogo.ultimaEscolha=`acusou ${idAcusado} · resultado: ${f.t}`;
  salvar();
  $("#f-marca").textContent=f.m;
  $("#f-titulo").textContent=f.t;
  $("#f-texto").innerHTML=f.p.map(x=>`<p>${x}</p>`).join("");

  if(f.correto){
    $("#f-resumo").classList.remove("oculto");
    $("#f-resumo").innerHTML=`<ul>
      <li>Provas preservadas: ${jogo.provas.length} de ${Object.keys(PISTAS).length}</li>
      <li>Provas materiais decisivas: ${chaves()} de 8</li></ul>`;
    $("#f-acoes").innerHTML = `<button class="btn" id="btn-rejogar">Reabrir o caso</button>
      <button class="btn sec" id="btn-menu2">Menu</button>`;
    $("#btn-rejogar").onclick = () => { jogo=novoJogo(); Guardar.apagar(K_PR+usuario.email); ir("prologo"); };
    $("#btn-menu2").onclick = () => entrarComo(usuario);
  } else {
    $("#f-resumo").classList.add("oculto");
    $("#f-acoes").innerHTML = `<button class="btn" id="btn-tentar-de-novo2">Tentar novamente</button>
      <button class="btn sec" id="btn-para-mansao2">Voltar à mansão</button>`;
    $("#btn-tentar-de-novo2").onclick = () => ir("acusacao");
    $("#btn-para-mansao2").onclick = () => ir("mansao");
  }
  ir("final");
}

/* ============ INÍCIO ============ */
(function(){ const e=Guardar.ler(K_SE), u=e&&usuarios()[e]; if(u){ usuario=u; $("#quem").textContent=u.nome; } ir("site"); })();