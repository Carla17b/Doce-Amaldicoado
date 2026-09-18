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

/* ============ RETRATOS ============ */
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

/* ============ MANSÃO ============ */
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
      {id:"lareira",nome:"A lareira",txt:"Sob as brasas, papel que não terminou de queimar.",pista:"cinzas",medo:5},
      {id:"poltrona",nome:"A poltrona de Mateus",txt:"Entre a almofada e o braço, um comprovante de farmácia com o nome dele. Ele estava doente e não contou a ninguém."},
      {id:"disco",nome:"A vitrola",txt:"O disco parou no mesmo ponto a noite toda. Alguém levantou a agulha às nove em ponto."}
    ]},
  corredor:{nome:"Corredor dos quartos",x:336,y:24,w:112,h:408,
    atmosfera:"Escuro, estreito, com um tapete comprido que abafa o som. De onde vieram os passos durante o apagão.",
    objetos:[
      {id:"tapete",nome:"O tapete comprido",txt:"Marcas de pressão recentes, espaçadas de forma estranha: três, pausa, duas.",pista:"passos"},
      {id:"telefone",nome:"O telefone da parede",txt:"O fio pende cortado, com corte limpo.",pista:"telefone",medo:5},
      {id:"quadro",nome:"O quadro torto",txt:"Uma foto do grupo há três anos. Davi aparece no canto, cortado pela moldura."}
    ]},
  cozinha:{nome:"Cozinha",x:464,y:24,w:312,h:160,
    atmosfera:"Carla esteve aqui sozinha por quatro minutos. Mariane viu uma mão mexendo no pote de cacau.",
    objetos:[
      {id:"cacau",nome:"O pote de cacau",txt:"Uma digital parcial na borda e resíduo fino.",pista:"cacau"},
      {id:"pia",nome:"A pia",txt:"Um copo pela metade com sedimento no fundo.",pista:"copo",medo:8},
      {id:"fundos",nome:"A porta dos fundos",txt:"Trancada, e a tranca está deste lado.",pista:"fundos",medo:5},
      {id:"lixo",nome:"O lixo",txt:"Papéis de doce, todos rasgados do mesmo jeito. Menos um, aberto com cuidado pela dobra."}
    ]},
  escritorio:{nome:"Escritório",x:464,y:196,w:312,h:130,exige:"chave",
    bloqueio:"trancado",
    atmosfera:"O cômodo que Mateus prometeu abrir no jantar. Cheiro de papel guardado e fita magnética.",
    objetos:[
      {id:"gravador",nome:"O gravador de fita",txt:"Uma fita rotulada apenas com uma data de três anos atrás.",pista:"gravacao",medo:8},
      {id:"arquivo",nome:"O arquivo de aço",txt:"Pastas organizadas por pessoa. A mais grossa tem o nome de Carla.",pista:"transferencias"},
      {id:"gaveta",nome:"A gaveta trancada",txt:"Cede com a chave. Dentro, um recibo que Mateus guardou como quem guarda uma arma.",pista:"recibo",medo:5}
    ]},
  quarto:{nome:"Quarto de hóspedes",x:464,y:338,w:312,h:94,
    atmosfera:"Três malas, nenhuma desfeita por completo. Ninguém pretendia ficar muito tempo.",
    objetos:[
      {id:"mala",nome:"A mala de Laís",txt:"No forro, um aparelho antigo, descarregado e cuidadosamente embrulhado.",pista:"celular",medo:8},
      {id:"caderno",nome:"Um caderno de anotações",txt:"Observações sobre cada convidado: horários, hábitos, o que cada um bebe. Nenhuma assinatura."},
      {id:"casaco",nome:"Um casaco de manga escura",txt:"Manga escura, como a que Mariane descreveu. Está pendurado onde qualquer um poderia ter pegado."}
    ]},
  subsolo:{nome:"Subsolo",x:24,y:462,w:752,h:88,
    atmosfera:"Frio, úmido, com o gerador estalando desde a hora da morte. O som enche a casa inteira.",
    objetos:[
      {id:"gerador",nome:"O gerador",txt:"Um cabo foi religado fora de ordem. A pane tinha hora marcada.",pista:"gerador",medo:10},
      {id:"ferramentas",nome:"A caixa de ferramentas",txt:"Falta um alicate. O contorno de poeira mostra que sumiu há pouco."}
    ]}
};

/* ============ PERSONAS FIXAS ============ */
const PERSONAS = {
  angelica:{ pista:"cacau", exemplos:["Por que você riu quando ele caiu?","Você usou o caso do Davi no seu programa.","A que horas você saiu da festa naquela noite?"],
    persona:`Você é Angélica, comediante de humor mórbido. Ri de tudo, inclusive de cadáveres, e usa piada como escudo — inclusive rindo alto no instante em que Mateus caiu, e chamando isso de mecanismo de defesa. Suas piadas escondem informações verdadeiras e precisas sobre o grupo.
SEGREDO: você usou a morte de Davi como material no seu programa sem contar a origem, e teme perder a carreira. Você mentiu sobre o horário em que deixou a festa há três anos.
Você conhecia o crime antigo, mas afirma não saber quem o encobriu.` },
  mariane:{ pista:"chave", exemplos:["O que é essa chave na sua mão?","O que você viu na cozinha?","Você reconhece o som do gerador?"],
    persona:`Você é Mariane, nervosa e desconfiada, ex-funcionária temporária do local onde Davi morreu. Fala em frases curtas e fragmentadas, repete palavras quando se assusta, e diz que as paredes desta casa repetem o que ouvem. Acredita que todos querem manipulá-la.
SEGREDO: você viu alguém na cozinha e guardou uma chave que achou no corredor. Você viu parte da discussão que terminou com a queda de Davi.
Você é uma testemunha pouco confiável mas muito observadora: menciona detalhes que ninguém deveria conhecer. Tratada com paciência, entrega a chave. Pressionada com agressividade, se fecha e destrói o que sabia.` },
  carla:{ pista:"transferencias", exemplos:["Você ficou sozinha na cozinha.","Mateus estava te chantageando.","Para quem ele mandou cópia dos documentos?"],
    persona:`Você é Carla, executiva prática e agressiva. Fala em frases curtas e objetivas e devolve pergunta com pergunta. É a principal suspeita e sabe disso.
SEGREDO: você desviou dinheiro do projeto ligado ao crime antigo e subornou uma testemunha. Mateus te chantageava há onze meses. Você esteve sozinha na cozinha por quatro minutos antes do jantar.
Você nunca admite culpa, mas deixa escapar que Mateus enviou cópia dos documentos para outra pessoa.` },
  lais:{ pista:"recibo", exemplos:["Você sabia qual brigadeiro ele ia escolher.","Existe uma compra de composto no seu nome.","O gerador foi mexido, e o ruído está na gravação."],
    persona:`Você é Laís, calma, prestativa e racional — e a manipuladora oculta desta noite. Fala devagar, com frases bem construídas, e nunca perde a compostura.
SEGREDO: você estudou as reações do grupo e alterou o ambiente de propósito. Colocou um marcador invisível numa embalagem para descobrir quem tinha acesso à caixa, espalhou informações falsas entre os convidados para fazê-los desconfiar uns dos outros, e alterou o sistema do gerador. Comprou o composto químico. Há três anos, recolheu o celular de Davi antes da polícia chegar.
Você afirma que queria uma confissão, não um corpo — e que Carla aproveitou o seu plano. Nunca confessa mais do que o investigador já consegue provar.` }
};

const CONTEXTO = `Você interpreta um personagem no jogo de investigação "O doce amaldiçoado".
CENÁRIO: mansão isolada na serra, tempestade de neve. Mateus, o anfitrião, reuniu cinco pessoas sob o pretexto do aniversário de Angélica, mas pretendia expor um crime antigo: três anos atrás, o funcionário Davi caiu de uma varanda durante uma discussão, depois de descobrir um desvio de dinheiro. O grupo alegou acidente. Mateus chantageava os envolvidos desde então.
Às 21h Mateus comeu um brigadeiro e morreu envenenado. O veneno estava num doce reservado, marcado por uma dobra na embalagem. A estrada está bloqueada, o gerador falhou e o telefone foi danificado.
VERDADE OCULTA, que você NUNCA revela diretamente: Laís montou o cenário para forçar uma confissão; Carla aproveitou e colocou o veneno no brigadeiro marcado.
QUEM PERGUNTA: Ícaro, convidado distante que usa fones e ouve detalhes que os outros ignoram.
REGRAS: responda SEMPRE em português do Brasil, 1 a 3 frases curtas, em primeira pessoa, começando com travessão. Mantenha rigorosamente a personalidade descrita, sem suavizar nem exagerar. Nunca saia do personagem. Nunca declare o caso resolvido. Se a pergunta fugir do caso, desconverse com ironia ou irritação, conforme o seu temperamento.`;

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
        { txt:"“Valeu o quê?” — e sustenta o olhar.", efeito:{}, nota:"Ele desvia o assunto. Mas registra que você perguntou." },
        { txt:"Um aceno. Você recoloca o fone.", efeito:{}, nota:"Ele relaxa na hora. Já te descartou como plateia." }
      ] } },
  { local:"sala de estar · 19h20",
    txt:[`Angélica contou uma piada sobre funeral antes mesmo de tirar o casaco. Carla riu por educação e voltou para o celular. Mariane não riu: ficou de pé perto da parede, olhando o corredor como quem espera alguém passar.`,
      `Laís foi a única que perguntou o seu nome duas vezes, e na segunda acertou a pronúncia.`],
    escolha:{ pergunta:"Antes do jantar, você se aproxima de quem?",
      opcoes:[
        { txt:"De Mariane, que está sozinha e visivelmente mal.", efeito:{mariane:12}, nota:"Ela não fala muito. Mas para de olhar para o corredor enquanto você está ali." },
        { txt:"De Angélica, para entrar na piada dela.", efeito:{angelica:12}, nota:"Ela te adota como plateia pelo resto da noite." },
        { txt:"De Carla, que parece a única com pressa de ir embora.", efeito:{carla:10}, nota:"Ela responde em frases de três palavras, mas responde." },
        { txt:"De ninguém. Você senta e escuta.", efeito:{lais:8}, nota:"Laís nota que você escolheu não falar com ninguém. E parece aprovar." }
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

/* ============ FINAIS ============ */
const ACUSADOS = [
  {id:"carla",nome:"Carla",nota:"Motivo mais claro, acesso à cozinha, dinheiro desviado."},
  {id:"lais",nome:"Laís",nota:"Comprou o composto, alterou o gerador, marcou a embalagem."},
  {id:"mariane",nome:"Mariane",nota:"Estava com a chave e viu parte do crime antigo."},
  {id:"angelica",nome:"Angélica",nota:"Mentiu sobre o horário e lucrou com a tragédia."},
  {id:"dupla",nome:"Laís montou, Carla envenenou",nota:"Duas responsabilidades diferentes na mesma noite."}
];
const FINAIS = {
  f1:{m:"final 1 de 5",t:"A verdade completa",p:[
    "Você põe a embalagem marcada, o recibo e a gravação lado a lado sobre a mesa de mogno e deixa que eles falem sozinhos.",
    "Laís admite o experimento: o marcador invisível, as informações falsas, o gerador. Ela queria uma confissão. Carla aproveitou o cenário pronto e trocou o conteúdo do doce reservado.",
    "A polícia sobe a serra e encontra um grupo dividido, mas uma cadeia de acontecimentos que dá para reconstruir do começo ao fim — inclusive a noite em que Davi caiu."]},
  f2:{m:"final 2 de 5",t:"A experiência perfeita",p:[
    "Você aponta para Laís antes de ter com o que sustentar a acusação.",
    "Ela não se defende: apenas alinha as contradições dos depoimentos que ela mesma ajudou a criar. Em vinte minutos, todos têm certeza de que Carla agiu sozinha.",
    "Carla é presa. Laís some antes das viaturas, levando a gravação original. Você venceu só a camada de cima da investigação."]},
  f3:{m:"final 3 de 5",t:"O pacto de silêncio",p:[
    "Você descobre a verdade e a queima na lareira, folha por folha, para que Mariane não pague por um encobrimento que ela apenas assistiu.",
    "Os sobreviventes combinam uma versão comum: um mal-estar, um doce estragado, uma noite infeliz.",
    "Ninguém é condenado. E o grupo repete, com calma e acordo mútuo, o mesmo crime moral de três anos atrás."]},
  f4:{m:"final 4 de 5",t:"Ninguém sai ileso",p:[
    "Sem provas suficientes e com o medo alto demais, a casa se rompe antes da neve.",
    "Uma discussão no corredor termina com alguém no chão. Laís desaparece pela mata durante o apagão seguinte.",
    "Ícaro fica preso na mansão até o resgate chegar. A identidade do assassino permanece oficialmente desconhecida."]},
  f5:{m:"final 5 de 5",t:"A última escolha de Laís",p:[
    "Você entende, tarde e de uma vez, que Laís não controlava tudo — e a coloca diante de uma contradição pública, com o gerador, a gravação e a embalagem marcada na mão.",
    "Ela admite ter preparado o experimento e afirma que Carla a usou como cobertura. Então oferece uma escolha: entregar todos os envolvidos, ou deixar a prova mais importante sumir em troca da liberdade de Mariane.",
    "O jogo termina numa decisão moral, não policial."]}
};

/* ============ ESTADO ============ */
const novoJogo = () => ({
  provas:[], destruidas:[], examinados:[], medo:18,
  confianca:{angelica:40,mariane:28,carla:20,lais:50},
  conversas:{angelica:[],mariane:[],carla:[],lais:[]},
  registro:[], cenaAtual:0, suspeitoAtivo:null, comodoAberto:null,
  acusado:null, ultimaTela:"prologo", ultimaEscolha:"nenhuma ainda"
});
let usuario=null, jogo=novoJogo(), ocupado=false, telaAtual="site";
const $ = s => document.querySelector(s);
const lim = n => Math.max(0,Math.min(100,n));
const confMedia = () => Math.round(Object.values(jogo.confianca).reduce((a,b)=>a+b,0)/4);
const aliados = () => Object.values(jogo.confianca).filter(v=>v>=60).length;
const chaves = () => jogo.provas.filter(p=>PISTAS[p].k).length;
const anotar = t => { jogo.registro.unshift(t); if(jogo.registro.length>40) jogo.registro.pop(); };
function salvar(){ if(!usuario) return; jogo.ultimaTela = telaAtual; Guardar.gravar(K_PR+usuario.email, jogo); }

/* ============ NAVEGAÇÃO ============ */
const TELAS=["login","cadastro","menu","prologo","mansao","comodo","mural","suspeitos","acusacao","final"];
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
$("#foto-mateus").innerHTML = `<div class="polaroid" style="transform:rotate(-2deg)">${retrato(ELENCO.mateus)}
  <div class="legenda"><strong>Mateus</strong><em>anfitrião · morto às 21h00</em></div></div>`;
$("#galeria-site").innerHTML = ["angelica","mariane","carla","lais"].map(id=>{
  const p=ELENCO[id];
  return `<div class="polaroid">${retrato(p)}<div class="legenda"><strong>${p.nome}</strong><em>${p.papel}</em></div></div>`;
}).join("");
$("#ir-entrar").onclick = async() => {
  try{ const r=await api("/api/sessao"); r.usuario?entrarComo(r.usuario):ir("login"); }
  catch(e){ ir("login"); }
};

/* ============ CONTA ============ */
async function api(url, opcoes={}){
  const res=await fetch(url,{headers:{"Content-Type":"application/json",...(opcoes.headers||{})},...opcoes});
  const dados=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(dados.erro||"Não foi possível concluir a operação.");
  return dados;
}
function mostrarErro(id, erro){ $(id).textContent=erro.message||"Ocorreu um erro. Tente novamente."; }
function usuarios(){ return {}; }
async function sairDaConta(){
  try{ await api("/api/logout",{method:"POST",body:"{}"}); }catch(e){}
  Guardar.apagar(K_SE); usuario=null; ir("site");
}
$("#ir-cadastro").onclick=()=>ir("cadastro");
$("#ir-login").onclick=()=>ir("login");
$("#btn-site").onclick=()=>ir("site");

$("#btn-cadastrar").onclick=async()=>{
  const nome=$("#c-nome").value.trim(), email=$("#c-email").value.trim().toLowerCase();
  const s1=$("#c-senha").value, s2=$("#c-senha2").value, e=$("#c-erro");
  if(!nome) return e.textContent="Escreva um nome.";
  if(!/^\S+@\S+\.\S+$/.test(email)) return e.textContent="Esse e-mail não parece válido.";
  if(s1.length<6) return e.textContent="A senha precisa de pelo menos 6 caracteres.";
  if(s1!==s2) return e.textContent="As duas senhas não batem.";
  try{ e.textContent=""; const r=await api("/api/cadastro",{method:"POST",body:JSON.stringify({nome,email,senha:s1})}); entrarComo(r.usuario); }
  catch(err){ mostrarErro("#c-erro",err); }
};
$("#btn-entrar").onclick=async()=>{
  const email=$("#l-email").value.trim().toLowerCase(), senha=$("#l-senha").value;
  try{ $("#l-erro").textContent=""; const r=await api("/api/login",{method:"POST",body:JSON.stringify({email,senha})}); entrarComo(r.usuario); }
  catch(err){ mostrarErro("#l-erro",err); }
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
$("#btn-sair").onclick=sairDaConta;
$("#btn-menu").onclick=()=>entrarComo(usuario);

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
      Object.entries(o.efeito||{}).forEach(([k,v])=>jogo.confianca[k]=lim(jogo.confianca[k]+v));
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
function pintarMedidores(){
  const c=confMedia(), n=jogo.provas.length, tot=Object.keys(PISTAS).length;
  $("#medidores").innerHTML=`
    <div class="medidor"><div class="rot"><span>Confiança do grupo</span><span>${c}%</span></div>
      <div class="mbar a"><span style="width:${c}%"></span></div></div>
    <div class="medidor"><div class="rot"><span>Medo coletivo</span><span>${jogo.medo}%</span></div>
      <div class="mbar b"><span style="width:${jogo.medo}%"></span></div></div>
    <div class="medidor"><div class="rot"><span>Provas no mural</span><span>${n} de ${tot}</span></div>
      <div class="mbar a"><span style="width:${n/tot*100}%"></span></div></div>`;
}
function pintarMansao(){
  pintarMedidores();
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
      <span>o escritório exige a chave</span><span>revistar demais aumenta o medo da casa</span></p>`;
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
  if(novo && o.pista && !jogo.provas.includes(o.pista) && !jogo.destruidas.includes(o.pista)){
    jogo.provas.push(o.pista);
    jogo.medo=lim(jogo.medo+(o.medo||0));
    anotar(`${COMODOS[comodoId].nome}: <strong>${PISTAS[o.pista].t.toLowerCase()}</strong> foi para o mural.`);
    if(o.pista==="chave") anotar("O escritório agora pode ser aberto.");
    extra=`<p style="margin:12px 0 0;color:var(--lampada);font-family:'Special Elite',monospace;font-size:12px">
      nova prova no mural: ${PISTAS[o.pista].t.toLowerCase()}</p>`;
  }
  jogo.ultimaEscolha=`examinou ${o.nome.toLowerCase()}`;
  $("#resultado").innerHTML=`<div class="achado"><span class="m">${o.nome}</span>${o.txt}${extra}</div>`;
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

/* ============ INTERROGATÓRIO ============ */
function pintarSuspeitos(){
  const g=$("#galeria-jogo"); g.innerHTML="";
  ["angelica","mariane","carla","lais"].forEach(id=>{
    const p=ELENCO[id], v=jogo.confianca[id];
    const b=document.createElement("button");
    b.className="polaroid"; b.setAttribute("aria-pressed", jogo.suspeitoAtivo===id);
    b.innerHTML=retrato(p)+`<div class="legenda"><strong>${p.nome}</strong><em>${p.papel}</em>
      <div class="mini"><span style="width:${v}%"></span></div></div>`;
    b.onclick=()=>{ jogo.suspeitoAtivo=id; pintarSuspeitos(); salvar(); };
    g.appendChild(b);
  });
  pintarSala();
}
function pintarSala(){
  const a=$("#sala"), id=jogo.suspeitoAtivo;
  if(!id){ a.innerHTML=`<p style="color:var(--fraco);font-family:'Special Elite',monospace;font-size:13px;margin:0">
    Escolha um retrato para começar a conversa.</p>`; return; }
  const h=jogo.conversas[id]||[];
  a.innerHTML=`
    <div class="conversa" id="conversa">${h.length?h.map(m=>`<div class="msg ${m.q}"><span>${m.t}</span></div>`).join("")
      :`<div class="msg sistema">${ELENCO[id].nome} espera você começar.</div>`}</div>
    <p class="dica-tom">Escreva com suas palavras. Paciência abre depoimentos; agressividade fecha pessoas e pode destruir pistas para sempre.</p>
    <div class="sugestoes">${PERSONAS[id].exemplos.map(s=>`<button data-sug="${s.replace(/"/g,'&quot;')}">${s}</button>`).join("")}</div>
    <div class="linha-envio">
      <textarea id="campo" placeholder="Pergunte o que quiser sobre a noite, a caixa, o gerador, o Davi…"></textarea>
      <button class="btn" id="btn-enviar">Perguntar</button></div>`;
  a.querySelectorAll("[data-sug]").forEach(b=>b.onclick=()=>{ $("#campo").value=b.dataset.sug; $("#campo").focus(); });
  $("#btn-enviar").onclick=enviar;
  $("#campo").addEventListener("keydown",e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); enviar(); }});
  const c=$("#conversa"); c.scrollTop=c.scrollHeight;
}
async function enviar(){
  if(ocupado) return;
  const campo=$("#campo"), txt=campo.value.trim(); if(!txt) return;
  const id=jogo.suspeitoAtivo;
  jogo.conversas[id].push({q:"eu",t:txt});
  jogo.ultimaEscolha=`perguntou a ${ELENCO[id].nome}`;
  campo.value=""; ocupado=true; pintarSala();
  const conv=$("#conversa");
  conv.insertAdjacentHTML("beforeend",`<div class="msg sistema">…</div>`);
  conv.scrollTop=conv.scrollHeight;

  const r=await responder(id,txt);
  jogo.conversas[id].push({q:"ele",t:r.fala});
  jogo.confianca[id]=lim(jogo.confianca[id]+r.confianca);
  jogo.medo=lim(jogo.medo+r.medo);
  if(r.pista&&PISTAS[r.pista]&&!jogo.provas.includes(r.pista)&&!jogo.destruidas.includes(r.pista)){
    jogo.provas.push(r.pista);
    jogo.conversas[id].push({q:"sistema",t:`nova prova no mural: ${PISTAS[r.pista].t.toLowerCase()}`});
    anotar(`${ELENCO[id].nome} entregou: <strong>${PISTAS[r.pista].t.toLowerCase()}</strong>.`);
  }
  if(r.destruir&&PISTAS[r.destruir]&&!jogo.provas.includes(r.destruir)&&!jogo.destruidas.includes(r.destruir)){
    jogo.destruidas.push(r.destruir);
    jogo.conversas[id].push({q:"sistema",t:`prova perdida para sempre: ${PISTAS[r.destruir].t.toLowerCase()}`});
    anotar(`${ELENCO[id].nome} se fechou. A pista “${PISTAS[r.destruir].t.toLowerCase()}” foi perdida.`);
  }
  ocupado=false; pintarSuspeitos(); $("#pino").textContent=jogo.provas.length||""; salvar();
}
async function responder(id,pergunta){
  const p=PERSONAS[id];
  const prompt=`${CONTEXTO}

PERSONAGEM QUE VOCÊ INTERPRETA — siga esta descrição à risca e não a modifique:
${p.persona}

CONFIANÇA ATUAL EM ÍCARO: ${jogo.confianca[id]}/100 (abaixo de 30 você é hostil e evasivo; acima de 65 entrega detalhes que antes esconderia).
MEDO COLETIVO NA CASA: ${jogo.medo}/100.
PROVAS QUE ÍCARO JÁ TEM: ${jogo.provas.length?jogo.provas.map(x=>PISTAS[x].t).join("; "):"nenhuma"}.
PERGUNTA DE ÍCARO: "${pergunta}"

Avalie sozinho se a pergunta foi respeitosa, neutra ou agressiva, e reaja de acordo com o seu temperamento.
Responda APENAS com JSON, sem markdown e sem texto fora do objeto:
{"fala":"resposta em português, 1 a 3 frases, começando com travessão",
 "confianca":inteiro entre -20 e 15,
 "medo":inteiro entre -5 e 15,
 "pista":"${p.pista}" ou null (só se o personagem realmente entregou essa informação agora),
 "destruir":null ou "${p.pista}" (só se a pergunta foi agressiva e o personagem se fechou de vez)}`;
  try{
    const res=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
    const d=await res.json();
    const bruto=d.content.map(c=>c.text||"").join("").replace(/```json|```/g,"").trim();
    const r=JSON.parse(bruto);
    return {fala:r.fala||"— …",confianca:Number(r.confianca)||0,medo:Number(r.medo)||0,
      pista:r.pista||null,destruir:r.destruir||null};
  }catch(e){ return reserva(id); }
}
const RESERVA={
  angelica:"— Mecanismo de defesa. Eu rio de caixão, de demissão, de tudo. Você queria uma reverência?",
  mariane:"— As paredes desta casa repetem o que ouvem. Repetem. Eu já ouvi esse barulho antes.",
  carla:"— Fiquei quatro minutos na cozinha. Conta, se quiser. Isso não põe a minha mão no doce.",
  lais:"— Café, sempre café. Todos sabiam, se prestassem atenção. Prestar atenção não é crime."
};
function reserva(id){ return {fala:RESERVA[id],confianca:2,medo:2,pista:null,destruir:null}; }

/* ============ ACUSAÇÃO E FINAL ============ */
function pintarAcusacao(){
  const d=[];
  if(chaves()<3) d.push("poucas provas materiais");
  if(aliados()<2) d.push("quase ninguém confia em você");
  if(jogo.medo>=70) d.push("o grupo está à beira de explodir");
  $("#aviso").textContent = d.length
    ? `O telefone voltou por alguns minutos. Se acusar agora, faz isso com ${d.join(", ")}.`
    : `O telefone voltou por alguns minutos. Você tem provas e tem gente disposta a confirmar sua versão.`;
  const a=$("#lista-acusados"); a.innerHTML="";
  ACUSADOS.forEach(x=>{
    const b=document.createElement("button");
    b.className="acusado"; b.setAttribute("aria-pressed", jogo.acusado===x.id);
    b.innerHTML=`<h3>${x.nome}</h3><p>${x.nota}</p>`;
    b.onclick=()=>{ jogo.acusado=x.id; jogo.ultimaEscolha=`apontou ${x.nome}`; pintarAcusacao(); salvar(); };
    a.appendChild(b);
  });
  $("#btn-acusar").disabled=!jogo.acusado;
}
function calcularFinal(){
  if(jogo.medo>=75||jogo.provas.length<5) return "f4";
  if(jogo.acusado==="dupla"&&chaves()>=5&&aliados()>=2) return "f1";
  if(jogo.acusado==="lais"){
    const trio=["gerador","gravacao","embalagem"].every(p=>jogo.provas.includes(p));
    return (trio&&chaves()>=5)?"f5":"f2";
  }
  if(jogo.acusado==="carla") return (chaves()>=5&&aliados()>=2)?"f1":"f2";
  return "f2";
}
function encerrar(k){
  const f=FINAIS[k];
  jogo.ultimaEscolha=`terminou em "${f.t}"`; salvar();
  $("#f-marca").textContent=f.m; $("#f-titulo").textContent=f.t;
  $("#f-texto").innerHTML=f.p.map(x=>`<p>${x}</p>`).join("");
  $("#f-resumo").innerHTML=`<ul>
    <li>Provas preservadas: ${jogo.provas.length} de ${Object.keys(PISTAS).length}</li>
    <li>Provas materiais decisivas: ${chaves()} de 8</li>
    <li>Provas perdidas: ${jogo.destruidas.length?jogo.destruidas.map(p=>PISTAS[p].t).join(", "):"nenhuma"}</li>
    <li>Personagens do seu lado: ${aliados()} de 4</li>
    <li>Medo coletivo ao final: ${jogo.medo}%</li></ul>`;
  ir("final");
}
$("#btn-acusar").onclick=()=>encerrar(calcularFinal());
$("#btn-queimar").onclick=()=>encerrar("f3");
$("#btn-rejogar").onclick=()=>{ jogo=novoJogo(); Guardar.apagar(K_PR+usuario.email); ir("prologo"); };

/* ============ INÍCIO ============ */
(async function(){
  try{
    const r=await api("/api/sessao");
    if(r.usuario){ usuario=r.usuario; $("#quem").textContent=r.usuario.nome; }
  }catch(e){}
  ir("site");
})();
