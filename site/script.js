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
const cifrar = t => { let h=5381; for(let i=0;i<t.length;i++) h=((h<<5)+h+t.charCodeAt(i))|0; return "h"+(h>>>0).toString(36); };

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

/* ============ CRUZAMENTOS ============ */
const CRUZAMENTOS = [
  {id:"veneno", par:["embalagem","cacau"], t:"O veneno entrou pelo cacau",
   d:"O doce marcado foi polvilhado depois de pronto. Quem fez isso precisou de quatro minutos na cozinha e de saber qual papel tinha a dobra.", e:"acesso + método"},
  {id:"casa", par:["gerador","gravacao"], t:"A gravação foi feita nesta casa",
   d:"O zumbido irregular no fundo da fita é o mesmo do gerador do subsolo. A noite de Davi não foi gravada na festa: foi gravada aqui, depois.", e:"som + lugar"},
  {id:"cenario", par:["recibo","gerador"], t:"Alguém montou o cenário com antecedência",
   d:"O composto foi comprado seis semanas antes e a pane tinha hora marcada. Isso não é um crime de impulso: é uma encenação preparada.", e:"compra + preparo"},
  {id:"motivo", par:["transferencias","gravacao"], t:"O dinheiro e a queda são a mesma história",
   d:"Davi ameaçou denunciar o desvio e caiu na mesma noite. O motivo de três anos atrás continua de pé nesta mesa.", e:"motivo + horário"},
  {id:"dentro", par:["copo","fundos"], t:"O assassino nunca saiu daqui",
   d:"A segunda dose veio da água, horas depois da morte, e a única porta para a neve está trancada por dentro.", e:"acesso + persistência"},
  {id:"movimento", par:["passos","relogio"], t:"Alguém atravessou a casa no escuro",
   d:"Três passos, pausa, mais dois, entre 21h04 e 21h10. Quem andou não tropeçou em nada: conhecia o corredor de olhos fechados.", e:"horário + comportamento"},
  {id:"guardiao", par:["celular","chave"], t:"As provas do crime antigo têm dona",
   d:"O celular de Davi e a chave do escritório estavam com a mesma pessoa. Guardar não é o mesmo que matar, mas explica quem controla a versão dos fatos.", e:"posse + controle"},
  {id:"isolamento", par:["telefone","fundos"], t:"O isolamento foi uma decisão",
   d:"O fio foi cortado com lâmina e a porta trancada pelo lado de dentro. Não foi a neve que prendeu vocês aqui.", e:"método + intenção"},
  {id:"queima", par:["cinzas","transferencias"], t:"Papel do projeto virou cinza antes da sobremesa",
   d:"Alguém já estava destruindo documento quando Mateus ainda estava vivo — e o que sobrou do timbre bate com os extratos.", e:"comportamento + motivo"},
  {id:"habito", par:["embalagem","relogio"], t:"A hora da morte foi escolhida",
   d:"Mateus conferiu o relógio nove vezes e pegou o doce marcado às nove em ponto. Quem preparou a dobra sabia a que horas ele comeria.", e:"hábito + horário"}
];
const acha = (a,b) => CRUZAMENTOS.find(c => c.par.includes(a) && c.par.includes(b) && a!==b);

/* ============ EVENTOS DA NOITE ============ */
const INICIO=1270, FIM=1680;
const relogio = m => { const h=Math.floor(m/60)%24, i=m%60; return String(h).padStart(2,"0")+"h"+String(i).padStart(2,"0"); };

const EVENTOS = [
  {id:"agua", em:1380, marca:"23h00",
   fn(){ jogo.medo=lim(jogo.medo+14);
     if(!jogo.provas.includes("copo") && !jogo.destruidas.includes("copo")) receber("copo","A copa");
     return "Angélica encheu um copo na copa e cuspiu no primeiro gole. O gosto metálico é o mesmo que ficou na boca de Mateus. A segunda tentativa não veio pelo doce — veio pela água."; }},
  {id:"apagao", em:1440, marca:"00h00",
   fn(){ const protegido = jogo.vigia==="subsolo";
     jogo.medo=lim(jogo.medo+(protegido?4:11)); if(!protegido) jogo.rel+=10;
     return protegido
       ? "O gerador tentou cair de novo. Você estava no subsolo e viu o cabo se soltar sozinho, sem mão nenhuma perto. A luz piscou e ficou."
       : "A casa apagou por dez minutos inteiros. Quando a luz voltou, três pessoas estavam em cômodos diferentes de onde tinham dito que estariam."; }},
  {id:"lareira", em:1500, marca:"01h00",
   fn(){ const salvo = jogo.provas.includes("transferencias") || jogo.vigia==="escritorio";
     if(salvo) return "Carla desceu até o escritório com uma pasta debaixo do braço e voltou sem ela. Os extratos continuam onde estavam — dessa vez porque alguém estava olhando.";
     perder("transferencias");
     jogo.medo=lim(jogo.medo+8);
     return "Cheiro de papel queimado vindo da sala de estar. Quando você chega, Carla está de pé na frente da lareira e os extratos já são um bloco preto que se desfaz ao toque."; }},
  {id:"mariane", em:1560, marca:"02h00",
   fn(){ if(jogo.confianca.mariane>=45){
       if(!jogo.provas.includes("chave") && !jogo.destruidas.includes("chave")) receber("chave","Mariane");
       jogo.medo=lim(jogo.medo-5);
       return "Mariane te procura no corredor, sem falar com mais ninguém, e põe a chave na sua mão. — Não é do carro. Eu contei os passos. Eram três, pausa, dois. Igualzinho àquela noite.";
     }
     jogo.fechados.push("mariane");
     if(!jogo.provas.includes("chave")) perder("chave");
     jogo.medo=lim(jogo.medo+10);
     return "Mariane se trancou no quarto e empurrou a cômoda contra a porta. Do outro lado, só repete que as paredes repetem. O que ela estava segurando não sai mais de lá."; }},
  {id:"telefone", em:1640, marca:"03h20",
   fn(){ jogo.telefone=true;
     return "O telefone da cozinha voltou a dar linha. Vai durar pouco. É o tempo de dizer uma frase para a delegacia da serra — e a frase que você disser é a versão que eles vão subir para investigar."; }}
];

/* ============ RESPOSTAS DE RESERVA ============ */
const BANCO = {
  angelica:[
    {k:["riu","riso","rir","piada"], f:"— Mecanismo de defesa. Eu rio de caixão, de demissão, de tudo. Você queria uma reverência?"},
    {k:["davi","programa","palco","material"], f:"— Usei a história no palco, sim. Mudei os nomes. Achei que era só uma história horrível que alguém tinha me contado."},
    {k:["horário","hora","saiu","festa","táxi"], f:"— Eu disse que saí às onze. Não saí. E fiz piada sobre isso em rede nacional por três anos, então já me castiguei bastante."},
    {k:["mateus","relógio","jantar"], f:"— Ele conferiu o relógio a noite toda. Quem faz isso está esperando alguém chegar, não anunciando nada."},
    {k:["carla","laís","mariane"], f:"— Carla grita, a Laís organiza e a Mariane escuta. Eu sou a que fala alto para ninguém reparar em qual das três está mentindo."}
  ],
  mariane:[
    {k:["chave"], f:"— Achei no corredor. Achei. Não peguei de ninguém. Está limpa demais para ter caído no chão desta casa."},
    {k:["cozinha","mão","cacau","pote"], f:"— Uma mão. Só a mão e a manga escura. Eu não vi rosto, e todo mundo aqui tem um casaco de manga escura."},
    {k:["som","gerador","barulho","ouviu","parede"], f:"— As paredes repetem. Repetem. Esse barulho do subsolo eu já ouvi antes, e não foi aqui."},
    {k:["davi","festa","garçonete","trabalho"], f:"— Eu servia bebida. Vi a discussão de longe e fiquei quieta porque eu precisava do emprego. É isso que você queria ouvir?"},
    {k:["medo","polícia","prender"], f:"— Se a polícia subir a serra, a culpa vai cair em quem não tem advogado. Eu sei exatamente quem é essa pessoa nesta sala."}
  ],
  carla:[
    {k:["cozinha","sozinha","minutos"], f:"— Fiquei quatro minutos na cozinha, no telefone. Conta os minutos, se quiser. Isso não põe a minha mão no doce."},
    {k:["chantagem","dinheiro","desvio","extrato","projeto"], f:"— Ele cobrava há onze meses. Eu paguei. Pagar não é matar, é ser trouxa por mais tempo do que devia."},
    {k:["cópia","documento","arquivo"], f:"— Ele mandou cópia para alguém de fora antes do jantar. Então me explique o que eu ganharia matando ele hoje."},
    {k:["davi","varanda","queda"], f:"— O Davi descobriu o desvio. Eu ofereci dinheiro. Ele recusou. A queda eu não vi, e é a única coisa que eu ainda juro."},
    {k:["laís","mariane","angélica"], f:"— A Laís é a única aqui que não perdeu a linha nenhuma vez esta noite. Você não acha isso estranho? Eu acho."}
  ],
  lais:[
    {k:["doce","café","brigadeiro","dobra","embalagem"], f:"— Café, sempre café, e sempre o que estivesse mais à direita. Todos sabiam, se prestassem atenção. Prestar atenção não é crime."},
    {k:["composto","recibo","comprou","veneno"], f:"— Existe uma compra no meu nome, sim. O mesmo composto está em três receitas de confeitaria que eu testei este ano."},
    {k:["gerador","luz","apagão"], f:"— O apagão foi útil. Coisas úteis raramente são acidentes, e você já entendeu isso sozinho."},
    {k:["celular","davi","polícia"], f:"— Recolhi o aparelho porque ia sumir de qualquer jeito. Fui a única que guardou. Isso me faz cúmplice ou arquivo?"},
    {k:["plano","experimento","marcador","confissão"], f:"— Eu queria uma confissão, não um corpo. Alguém ouviu o meu plano e mudou o final dele."}
  ]
};
function reserva(id, pergunta){
  const q=(pergunta||"").toLowerCase();
  const achou=(BANCO[id]||[]).find(r=>r.k.some(k=>q.includes(k)));
  const base={confianca:2, medo:1, pista:null, destruir:null};
  if(achou) return Object.assign(base,{fala:achou.f, confianca:4});
  const genericas={
    angelica:"— Eu podia responder isso com uma piada, mas você não ri de nada, então vou só dizer que não sei.",
    mariane:"— Não. Não. Pergunta outra coisa, essa eu não sei responder sem começar de novo do começo.",
    carla:"— Próxima pergunta. Essa não me interessa e o meu tempo aqui é o mesmo que o seu.",
    lais:"— Interessante você perguntar isso agora, e não há duas horas. Reformula que eu respondo."
  };
  return Object.assign(base,{fala:genericas[id], confianca:0});
}

/* ============ ESTADO ============ */
const novoJogo = () => ({
  provas:[], destruidas:[], conclusoes:[], examinados:[], medo:18,
  confianca:{angelica:40,mariane:28,carla:20,lais:50},
  conversas:{angelica:[],mariane:[],carla:[],lais:[]},
  registro:[], cenaAtual:0, suspeitoAtivo:null, comodoAberto:null,
  rel:INICIO, eventos:[], vigia:null, fechados:[], telefone:false, forcou:false,
  selec:[], acusado:null, anexos:[],
  ultimaTela:"prologo", ultimaEscolha:"nenhuma ainda"
});
let usuario=null, jogo=novoJogo(), ocupado=false, telaAtual="site", askClaude=null, iaResolvida=false;
const $ = s => document.querySelector(s);
const lim = n => Math.max(0,Math.min(100,n));
const confMedia = () => Math.round(Object.values(jogo.confianca).reduce((a,b)=>a+b,0)/4);
const aliados = () => Object.values(jogo.confianca).filter(v=>v>=60).length;
const chaves = () => jogo.provas.filter(p=>PISTAS[p].k).length;
const resta = () => Math.max(0, FIM - jogo.rel);
const anotar = t => { jogo.registro.unshift(`<i>${relogio(jogo.rel)}</i> ${t}`); if(jogo.registro.length>40) jogo.registro.pop(); };
function salvar(){ if(!usuario) return; jogo.ultimaTela = telaAtual; Guardar.gravar(K_PR+usuario.email, jogo); }

function receber(id, origem){
  if(jogo.provas.includes(id)||jogo.destruidas.includes(id)) return false;
  jogo.provas.push(id);
  anotar(`${origem}: <strong>${PISTAS[id].t.toLowerCase()}</strong> foi para o mural.`);
  return true;
}
function perder(id){
  if(jogo.provas.includes(id)||jogo.destruidas.includes(id)) return false;
  jogo.destruidas.push(id);
  anotar(`Perdida para sempre: <strong>${PISTAS[id].t.toLowerCase()}</strong>.`);
  return true;
}

/* ============ TEMPO ============ */
function gastar(min){
  jogo.rel += min;
  const disparou=[];
  EVENTOS.forEach(ev=>{
    if(jogo.rel>=ev.em && !jogo.eventos.includes(ev.id)){
      jogo.eventos.push(ev.id);
      const txt=ev.fn();
      anotar(`<strong>${ev.marca}</strong> — ${txt.split(".")[0]}.`);
      disparou.push({marca:ev.marca, txt});
    }
  });
  if(disparou.length) jogo.ultimoEvento=disparou[disparou.length-1];
  if(jogo.rel>=FIM && !jogo.fimForcado){ jogo.fimForcado=true; }
  salvar();
  return disparou;
}
function pintarRelogio(){
  const r=$("#relogio"); if(!r) return;
  const m=resta();
  r.className="relogio"+(m<=90?" apertado":"");
  r.innerHTML=`<span class="hora">${relogio(jogo.rel)}</span>
    <span class="resto">${m?`${Math.floor(m/60)}h${String(m%60).padStart(2,"0")} até o amanhecer`:"amanheceu"}</span>`;
}

/* ============ NAVEGAÇÃO ============ */
const TELAS=["login","cadastro","menu","prologo","mansao","comodo","mural","suspeitos","acusacao","final"];
const COM_BARRA=["mansao","comodo","mural","suspeitos","acusacao"];
function ir(t){
  if(jogo.fimForcado && COM_BARRA.includes(t) && t!=="acusacao" && !jogo.fim){ encerrar("f4"); return; }
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
  if(COM_BARRA.includes(t)){ $("#pino").textContent = jogo.provas.length||""; pintarRelogio(); salvar(); }
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
$("#ir-entrar").onclick = () => { const e=Guardar.ler(K_SE), u=e&&usuarios()[e]; u?entrarComo(u):ir("login"); };

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
  us[email]={nome,email,senha:cifrar(s1+"::"+email)}; Guardar.gravar(K_US,us); e.textContent="";
  entrarComo(us[email]);
};
$("#btn-entrar").onclick=()=>{
  const email=$("#l-email").value.trim().toLowerCase(), u=usuarios()[email];
  const s=$("#l-senha").value;
  if(!u || (u.senha!==cifrar(s+"::"+email) && u.senha!==s))
    return $("#l-erro").textContent="E-mail ou senha não conferem.";
  if(u.senha===s){ u.senha=cifrar(s+"::"+email); const us=usuarios(); us[email]=u; Guardar.gravar(K_US,us); }
  $("#l-erro").textContent=""; entrarComo(u);
};
function entrarComo(u){
  usuario=u; Guardar.gravar(K_SE,u.email); $("#quem").textContent=u.nome;
  const s=Guardar.ler(K_PR+u.email);
  $("#saudacao").textContent = "Caso 4471, "+u.nome;
  $("#status-save").textContent = s
    ? `${relogio(s.rel||INICIO)} · ${s.provas.length} provas · última ação: ${s.ultimaEscolha}`
    : "investigação ainda não iniciada";
  $("#btn-continuar").disabled=!s;
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
      <div class="mbar a"><span style="width:${n/tot*100}%"></span></div></div>
    <div class="medidor"><div class="rot"><span>Conclusões fechadas</span><span>${jogo.conclusoes.length} de ${CRUZAMENTOS.length}</span></div>
      <div class="mbar a"><span style="width:${jogo.conclusoes.length/CRUZAMENTOS.length*100}%"></span></div></div>`;
}

const VIGIAS=[
  {id:"escritorio", nome:"o escritório", nota:"protege o arquivo de quem quiser queimá-lo"},
  {id:"subsolo", nome:"o subsolo", nota:"protege o gerador de um segundo apagão"},
  {id:"corredor", nome:"o corredor", nota:"acalma quem passa a noite andando pela casa"}
];

function pintarPainelNoite(){
  const p=$("#painel-noite"); p.innerHTML="";
  const acoes=[
    {id:"ouvir", t:"Ouvir a casa", d:"Ícaro tira os fones e mapeia quem está onde pelo som.", c:6},
    {id:"acalmar", t:"Acalmar o grupo", d:"Junta todo mundo na sala, serve chá, abaixa a voz. Custa caro em tempo.", c:20},
    {id:"esperar", t:"Deixar a noite correr", d:"Sentar no corredor, de fones, e esperar a casa se mexer sozinha.", c:30},
    {id:"forcar", t:"Forçar a porta do escritório", d:"Sem a chave, com um pé de cabra e barulho suficiente para acordar a serra.", c:20,
     ver:()=>!jogo.provas.includes("chave") && !jogo.forcou && jogo.rel>=1500}
  ];
  acoes.forEach(a=>{
    if(a.ver && !a.ver()) return;
    const b=document.createElement("button");
    b.className="acao-noite";
    b.innerHTML=`<strong>${a.t}</strong><span>${a.d}</span><em>custa ${a.c} min</em>`;
    b.disabled = resta()<a.c;
    b.onclick=()=>executarAcao(a);
    p.appendChild(b);
  });
  VIGIAS.forEach(v=>{
    const b=document.createElement("button");
    b.className="acao-noite";
    b.setAttribute("aria-pressed", jogo.vigia===v.id);
    b.innerHTML=`<strong>Vigiar ${v.nome}</strong><span>${v.nota}</span><em>${jogo.vigia===v.id?"vigiando agora":"não custa tempo, mas só dá para vigiar um lugar"}</em>`;
    b.onclick=()=>{ jogo.vigia = jogo.vigia===v.id ? null : v.id;
      anotar(jogo.vigia?`Você passou a ficar de olho ${v.nome}.`:"Você parou de vigiar.");
      jogo.ultimaEscolha=jogo.vigia?`vigiando ${v.nome}`:"parou de vigiar";
      salvar(); pintarMansao(); };
    p.appendChild(b);
  });
}

function executarAcao(a){
  let texto="";
  if(a.id==="ouvir") texto=escutar();
  if(a.id==="acalmar"){
    jogo.medo=lim(jogo.medo-14);
    Object.keys(jogo.confianca).forEach(k=>jogo.confianca[k]=lim(jogo.confianca[k]+4));
    texto="Você junta todo mundo na sala de estar e não diz quase nada. Vinte minutos depois, as vozes voltaram ao volume normal. Vinte minutos que a noite não devolve.";
  }
  if(a.id==="esperar"){
    jogo.medo=lim(jogo.medo+3);
    texto="Meia hora sentado no corredor, com os fones no pescoço. Portas, passos, uma torneira, alguém que chega perto e desiste. A casa continua andando sem você, o que é exatamente o problema.";
  }
  if(a.id==="forcar"){
    jogo.forcou=true; jogo.medo=lim(jogo.medo+12);
    receber("chave","A fechadura arrombada");
    texto="A madeira racha perto da fechadura e o barulho percorre a casa inteira. Quatro pessoas aparecem no corredor ao mesmo tempo, o que pelo menos responde onde cada uma estava.";
  }
  anotar(texto.split(".")[0]+".");
  jogo.ultimaEscolha=a.t.toLowerCase();
  const eventos=gastar(a.c);
  pintarMansao();
  $("#area-evento").innerHTML = `<div class="achado"><span class="m">${a.t.toLowerCase()} · ${relogio(jogo.rel)}</span>${texto}</div>`
    + eventos.map(e=>`<div class="evento"><b>${e.marca}</b><p>${e.txt}</p></div>`).join("");
  $("#area-evento").scrollIntoView({block:"nearest"});
  if(jogo.fimForcado) encerrar("f4");
}

function escutar(){
  const linhas=[];
  const hora=jogo.rel;
  linhas.push(hora<1440
    ? "Alguém anda de um lado para o outro no andar de cima, sempre no mesmo trecho de tábua."
    : "A casa está quieta demais para ter quatro pessoas acordadas dentro dela.");
  if(jogo.provas.includes("gerador") && jogo.provas.includes("gravacao") && !jogo.conclusoes.includes("casa"))
    linhas.push("O zumbido do subsolo tem um soluço a cada quatro segundos. Você já ouviu esse soluço hoje — e não foi no subsolo. Foi no fundo da fita. <b>Vale cruzar as duas provas no mural.</b>");
  if(jogo.confianca.mariane>=50) linhas.push("Do quarto de Mariane vem uma contagem baixinha, repetida: três, pausa, dois.");
  if(jogo.medo>=60) linhas.push("Duas vozes discutem no corredor e param no instante em que uma tábua range sob o seu pé.");
  if(jogo.vigia==="corredor"){ jogo.medo=lim(jogo.medo-4); linhas.push("Como você passou a noite no corredor, ninguém tentou trancar nada."); }
  linhas.push("Nenhuma porta dos fundos abriu. Continua sendo alguém de dentro.");
  return linhas.join(" ");
}

function pintarMansao(){
  pintarMedidores(); pintarPainelNoite(); pintarRelogio();
  const grupos=Object.entries(COMODOS).map(([id,c])=>{
    const travado=c.exige && !jogo.provas.includes(c.exige);
    const rest=c.objetos.filter(o=>!jogo.examinados.includes(id+":"+o.id)).length;
    const cls="comodo-g"+(travado?" travado":"")+(rest===0?" limpo":"");
    const cx=c.x+16, cy=c.y+28;
    return `<g class="${cls}" data-comodo="${id}" tabindex="0" role="button" aria-label="${c.nome}">
      <rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}"/>
      <text class="nome" x="${cx}" y="${cy}">${c.nome}</text>
      <text class="conta" x="${cx}" y="${cy+20}">${travado?"trancado":rest?rest+" a revistar":"revistado"}</text>
      ${jogo.vigia===id?`<text class="conta" x="${cx}" y="${cy+38}">você está de olho aqui</text>`:""}
    </g>`;
  }).join("");
  $("#area-planta").innerHTML=`
    <div class="planta"><svg viewBox="0 0 800 574" role="img" aria-label="Planta baixa da mansão">
      <rect x="10" y="10" width="780" height="554" fill="none" stroke="#2E3D3F" stroke-width="2"/>
      ${grupos}
      <text x="24" y="452" fill="#5C8283" font-family="'Special Elite',monospace" font-size="11">escada ↓</text>
    </svg></div>
    <p class="legenda-planta"><span>cada objeto revistado custa 4 minutos</span>
      <span>o escritório exige a chave</span><span>a noite acaba às 04h00</span></p>`;
  document.querySelectorAll(".comodo-g").forEach(g=>{
    const abrir=()=>{
      const id=g.dataset.comodo, c=COMODOS[id];
      if(c.exige && !jogo.provas.includes(c.exige)){
        anotar("O escritório continua trancado. A chave está com alguém desta casa.");
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
    <div class="cabeca-comodo"><span class="carimbo">${relogio(jogo.rel)} · ${id==="subsolo"?"subsolo":"térreo"}</span>
      <h2>${c.nome}</h2><p>${c.atmosfera}</p></div>
    <div class="objetos" id="objetos"></div>
    <div id="resultado"></div>`;
  $("#voltar-planta").onclick=()=>ir("mansao");
  const alvo=$("#objetos");
  c.objetos.forEach(o=>{
    const visto=jogo.examinados.includes(id+":"+o.id);
    const b=document.createElement("button");
    b.className="objeto"+(visto?" visto":"");
    b.innerHTML=`<h4>${o.nome}</h4><span class="st">${visto?"já examinado":"examinar · 4 min"}</span>`;
    b.disabled = !visto && resta()<4;
    b.onclick=()=>examinar(id,o);
    alvo.appendChild(b);
  });
}

function examinar(comodoId,o){
  const marca=comodoId+":"+o.id, novo=!jogo.examinados.includes(marca);
  let extra="", eventos=[];
  if(novo){
    jogo.examinados.push(marca);
    if(o.pista && receber(o.pista, COMODOS[comodoId].nome)){
      jogo.medo=lim(jogo.medo+(o.medo||0));
      if(o.pista==="chave") anotar("O escritório agora pode ser aberto.");
      extra=`<p style="margin:12px 0 0;color:var(--lampada);font-family:'Special Elite',monospace;font-size:12px">
        nova prova no mural: ${PISTAS[o.pista].t.toLowerCase()}</p>`;
    } else if(o.pista && jogo.destruidas.includes(o.pista)){
      extra=`<p style="margin:12px 0 0;color:#C2655F;font-family:'Special Elite',monospace;font-size:12px">
        o que estava aqui já foi destruído</p>`;
    }
    jogo.ultimaEscolha=`examinou ${o.nome.toLowerCase()}`;
    eventos=gastar(4);
  }
  pintarComodo();
  $("#resultado").innerHTML=`<div class="achado"><span class="m">${o.nome}</span>${o.txt}${extra}</div>`
    + eventos.map(e=>`<div class="evento"><b>${e.marca}</b><p>${e.txt}</p></div>`).join("");
  $("#resultado").scrollIntoView({block:"nearest"});
  $("#pino").textContent=jogo.provas.length||""; pintarRelogio(); salvar();
  if(jogo.fimForcado) encerrar("f4");
}

/* ============ MURAL E CRUZAMENTOS ============ */
function pintarMural(){
  const a=$("#mural-conteudo"), c=$("#area-conclusoes"), b=$("#barra-cruz");
  c.innerHTML = jogo.conclusoes.length
    ? `<p class="subt">conclusões fechadas</p><div class="conclusoes">`+jogo.conclusoes.map(id=>{
        const k=CRUZAMENTOS.find(x=>x.id===id);
        return `<article class="conclusao"><h4>${k.t}</h4><p>${k.d}</p><span>${k.e}</span></article>`;
      }).join("")+`</div>`
    : "";
  if(!jogo.provas.length){
    a.innerHTML=`<div class="vazio">O mural está vazio. Comece pela sala de jantar.</div>`; b.innerHTML=""; return;
  }
  a.innerHTML=`<div class="mural">`+jogo.provas.map(id=>{const p=PISTAS[id];
    const sel=jogo.selec.includes(id);
    return `<article class="ficha${sel?" marcada":""}"><span class="origem">${p.o}</span><h4>${p.t}</h4>
      <p class="leitura">${p.l}</p><p class="alt">${p.a}</p>
      <button class="sel" data-p="${id}">${sel?"remover do cruzamento":"usar no cruzamento"}</button></article>`;}).join("")+`</div>`;
  a.querySelectorAll("[data-p]").forEach(btn=>btn.onclick=()=>{
    const id=btn.dataset.p;
    if(jogo.selec.includes(id)) jogo.selec=jogo.selec.filter(x=>x!==id);
    else { jogo.selec.push(id); if(jogo.selec.length>2) jogo.selec.shift(); }
    salvar(); pintarMural();
  });
  const dois=jogo.selec.length===2;
  b.innerHTML=`<p>${dois?`cruzando: ${jogo.selec.map(x=>PISTAS[x].t.toLowerCase()).join("  ×  ")}`:"marque duas fichas para cruzar · 8 minutos por tentativa"}</p>
    <button class="btn" id="btn-cruzar" ${dois&&resta()>=8?"":"disabled"}>Cruzar as duas provas</button>
    <div id="saida-cruz" style="flex-basis:100%"></div>`;
  const bt=$("#btn-cruzar"); if(bt) bt.onclick=cruzar;
}

function cruzar(){
  const [x,y]=jogo.selec;
  const k=acha(x,y);
  let saida="";
  if(k && !jogo.conclusoes.includes(k.id)){
    jogo.conclusoes.push(k.id);
    anotar(`Conclusão fechada: <strong>${k.t.toLowerCase()}</strong>.`);
    jogo.ultimaEscolha=`fechou "${k.t}"`;
    saida=`<div class="achado"><span class="m">fecha · ${k.e}</span><strong>${k.t}.</strong> ${k.d}</div>`;
  } else if(k){
    saida=`<div class="achado"><span class="m">já fechado</span>Você já tinha juntado essas duas.</div>`;
  } else {
    jogo.medo=lim(jogo.medo+3);
    saida=`<div class="achado"><span class="m">não fecha</span>As duas coisas são verdadeiras e não se encontram em lugar nenhum. Você perdeu oito minutos olhando para elas, e quem estava te observando reparou.</div>`;
    jogo.ultimaEscolha="cruzou provas que não fechavam";
  }
  jogo.selec=[];
  const eventos=gastar(8);
  pintarMural(); pintarRelogio();
  $("#saida-cruz").innerHTML=saida + eventos.map(e=>`<div class="evento"><b>${e.marca}</b><p>${e.txt}</p></div>`).join("");
  if(jogo.fimForcado) encerrar("f4");
}

/* ============ INTERROGATÓRIO ============ */
function pintarSuspeitos(){
  const g=$("#galeria-jogo"); g.innerHTML="";
  ["angelica","mariane","carla","lais"].forEach(id=>{
    const p=ELENCO[id], v=jogo.confianca[id], fechado=jogo.fechados.includes(id);
    const b=document.createElement("button");
    b.className="polaroid"+(fechado?" morto":""); b.setAttribute("aria-pressed", jogo.suspeitoAtivo===id);
    b.innerHTML=retrato(p)+`<div class="legenda"><strong>${p.nome}</strong><em>${fechado?"trancada no quarto":p.papel}</em>
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
  if(jogo.fechados.includes(id)){
    a.innerHTML=`<p style="color:var(--fraco);margin:0">${ELENCO[id].nome} não abre a porta. Do outro lado só dá para ouvir a mesma frase, repetida em voz baixa.</p>`;
    return;
  }
  const h=jogo.conversas[id]||[];
  const modo = iaResolvida
    ? (askClaude ? `<p class="modo-ia">${ELENCO[id].nome} responde no personagem, ao vivo. Cada pergunta custa 3 minutos da noite.</p>`
                 : `<p class="modo-ia off">Sem conexão com o Claude nesta visualização: os depoimentos vêm do roteiro fixo. Cada pergunta custa 3 minutos.</p>`)
    : `<p class="modo-ia off">conectando os depoimentos…</p>`;
  a.innerHTML=`
    <div class="conversa" id="conversa">${h.length?h.map(m=>`<div class="msg ${m.q}"><span>${m.t}</span></div>`).join("")
      :`<div class="msg sistema">${ELENCO[id].nome} espera você começar.</div>`}</div>
    ${modo}
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
  if(resta()<3){ encerrar("f4"); return; }
  const campo=$("#campo"), txt=campo.value.trim(); if(!txt) return;
  const id=jogo.suspeitoAtivo;
  jogo.conversas[id].push({q:"eu",t:txt});
  jogo.ultimaEscolha=`perguntou a ${ELENCO[id].nome}`;
  campo.value=""; ocupado=true; pintarSala();
  const conv=$("#conversa");
  conv.insertAdjacentHTML("beforeend",`<div class="msg sistema pensando"><span>${ELENCO[id].nome} pensa antes de responder…</span></div>`);
  conv.scrollTop=conv.scrollHeight;

  const r=await responder(id,txt);
  jogo.conversas[id].push({q:"ele",t:r.fala});
  if(jogo.conversas[id].length>24) jogo.conversas[id]=jogo.conversas[id].slice(-24);
  jogo.confianca[id]=lim(jogo.confianca[id]+r.confianca);
  jogo.medo=lim(jogo.medo+r.medo);
  if(r.pista && PISTAS[r.pista] && receber(r.pista, ELENCO[id].nome))
    jogo.conversas[id].push({q:"sistema",t:`nova prova no mural: ${PISTAS[r.pista].t.toLowerCase()}`});
  if(r.destruir && PISTAS[r.destruir] && perder(r.destruir))
    jogo.conversas[id].push({q:"sistema",t:`prova perdida para sempre: ${PISTAS[r.destruir].t.toLowerCase()}`});
  const eventos=gastar(3);
  eventos.forEach(e=>jogo.conversas[id].push({q:"sistema",t:`${e.marca} — ${e.txt}`}));
  ocupado=false; pintarSuspeitos(); pintarRelogio();
  $("#pino").textContent=jogo.provas.length||""; salvar();
  if(jogo.fimForcado) encerrar("f4");
}

function montarPrompt(id,pergunta){
  const p=PERSONAS[id];
  const hist=(jogo.conversas[id]||[]).filter(m=>m.q!=="sistema").slice(-8)
    .map(m=>(m.q==="eu"?"ÍCARO: ":"VOCÊ: ")+m.t).join("\n");
  return `${CONTEXTO}

PERSONAGEM QUE VOCÊ INTERPRETA — siga esta descrição à risca e não a modifique:
${p.persona}

CONFIANÇA ATUAL EM ÍCARO: ${jogo.confianca[id]}/100 (abaixo de 30 você é hostil e evasivo; acima de 65 entrega detalhes que antes esconderia).
MEDO COLETIVO NA CASA: ${jogo.medo}/100. HORA: ${relogio(jogo.rel)}.
PROVAS QUE ÍCARO JÁ TEM: ${jogo.provas.length?jogo.provas.map(x=>PISTAS[x].t).join("; "):"nenhuma"}.
CONCLUSÕES QUE ELE JÁ FECHOU: ${jogo.conclusoes.length?jogo.conclusoes.map(x=>CRUZAMENTOS.find(k=>k.id===x).t).join("; "):"nenhuma"}.
${hist?`CONVERSA ATÉ AGORA:\n${hist}\n`:""}
PERGUNTA DE ÍCARO: "${pergunta}"

Avalie sozinho se a pergunta foi respeitosa, neutra ou agressiva, e reaja de acordo com o seu temperamento. Se ele apresentar uma prova ou conclusão que você não consegue contornar, ceda um pouco — nunca tudo.
Responda APENAS com JSON, sem markdown e sem texto fora do objeto:
{"fala":"resposta em português do Brasil, 1 a 3 frases, começando com travessão",
 "confianca":inteiro entre -20 e 15,
 "medo":inteiro entre -5 e 15,
 "pista":"${p.pista}" ou null (só se o personagem realmente entregou essa informação agora),
 "destruir":null ou "${p.pista}" (só se a pergunta foi agressiva e o personagem se fechou de vez)}`;
}

async function responder(id,pergunta){
  if(!askClaude) return reserva(id,pergunta);
  try{
    const r=await askClaude.json(montarPrompt(id,pergunta),{modelTier:"quick",cache:false});
    return {fala:(r&&r.fala)||reserva(id,pergunta).fala,
      confianca:Number(r&&r.confianca)||0, medo:Number(r&&r.medo)||0,
      pista:(r&&r.pista)||null, destruir:(r&&r.destruir)||null};
  }catch(e){
    if(["not_granted","sampling_disabled","not_declared","session_expired"].includes(e&&e.code)){
      askClaude=null; pintarSala();
    }
    const base=reserva(id,pergunta);
    if(e&&e.code==="rate_limited") base.fala="— Espera. Espera um pouco. Eu respondo, mas não agora.";
    return base;
  }
}

/* ============ ACUSAÇÃO ============ */
const SUPORTE={
  carla:["cacau","transferencias","embalagem","cinzas","copo"],
  lais:["recibo","gerador","celular","embalagem","chave"],
  mariane:["chave","passos"],
  angelica:["relogio","tacas"],
  dupla:["embalagem","cacau","recibo","gerador","transferencias","copo"]
};
function forca(){
  if(!jogo.acusado) return 0;
  return jogo.anexos.filter(p=>SUPORTE[jogo.acusado].includes(p)).length;
}
function pintarAcusacao(){
  $("#carimbo-acusacao").textContent = jogo.telefone ? "o telefone voltou · a linha cai a qualquer momento" : "o telefone ainda está mudo";
  const d=[];
  if(chaves()<3) d.push("poucas provas materiais");
  if(jogo.conclusoes.length<2) d.push("nenhuma conclusão fechada");
  if(aliados()<2) d.push("quase ninguém confia em você");
  if(jogo.medo>=70) d.push("o grupo está à beira de explodir");
  if(!jogo.telefone) d.push("nenhuma linha telefônica até as 03h20");
  $("#aviso").textContent = d.length
    ? `Se acusar agora, faz isso com ${d.join(", ")}.`
    : `Você tem provas materiais, conclusões fechadas, gente disposta a confirmar a sua versão e uma linha aberta. É agora.`;

  const a=$("#lista-acusados"); a.innerHTML="";
  ACUSADOS.forEach(x=>{
    const b=document.createElement("button");
    b.className="acusado"; b.setAttribute("aria-pressed", jogo.acusado===x.id);
    b.innerHTML=`<h3>${x.nome}</h3><p>${x.nota}</p>`;
    b.onclick=()=>{ jogo.acusado=x.id; jogo.ultimaEscolha=`apontou ${x.nome}`; pintarAcusacao(); salvar(); };
    a.appendChild(b);
  });

  const an=$("#lista-anexos"); an.innerHTML="";
  if(!jogo.provas.length) an.innerHTML=`<p style="color:var(--fraco);margin:0;font-size:13.5px">Você não tem nenhuma prova para anexar. Uma acusação assim é só uma opinião em voz alta.</p>`;
  jogo.provas.forEach(p=>{
    const b=document.createElement("button"), sel=jogo.anexos.includes(p);
    b.className="anexo"; b.setAttribute("aria-pressed", sel);
    b.textContent=PISTAS[p].t;
    b.disabled = !sel && jogo.anexos.length>=3;
    b.onclick=()=>{
      jogo.anexos = sel ? jogo.anexos.filter(x=>x!==p) : jogo.anexos.concat(p);
      pintarAcusacao(); salvar();
    };
    an.appendChild(b);
  });

  const f=forca();
  $("#forca").textContent = jogo.acusado
    ? `Das provas anexadas, ${f} sustenta${f===1?"":"m"} essa acusação. Conclusões fechadas: ${jogo.conclusoes.length}. Aliados: ${aliados()} de 4.`
    : "Escolha quem você vai apontar para ver se as provas anexadas sustentam a versão.";
  $("#btn-acusar").disabled=!jogo.acusado;
}

function calcularFinal(){
  if(jogo.medo>=78 || jogo.provas.length<5) return "f4";
  const f=forca();
  if(jogo.acusado==="dupla")
    return (f>=3 && jogo.conclusoes.length>=3 && aliados()>=2 && jogo.telefone) ? "f1" : "f2";
  if(jogo.acusado==="lais"){
    const trio=["gerador","gravacao","embalagem"].every(p=>jogo.provas.includes(p));
    return (trio && jogo.conclusoes.includes("casa") && f>=3) ? "f5" : "f2";
  }
  if(jogo.acusado==="carla") return (f>=3 && chaves()>=4 && aliados()>=2) ? "f1" : "f2";
  return "f2";
}
function encerrar(k){
  if(jogo.fim) return;
  jogo.fim=k;
  const f=FINAIS[k];
  jogo.ultimaEscolha=`terminou em "${f.t}"`; salvar();
  $("#f-marca").textContent=f.m; $("#f-titulo").textContent=f.t;
  $("#f-texto").innerHTML=f.p.map(x=>`<p>${x}</p>`).join("");
  $("#f-resumo").innerHTML=`<ul>
    <li>Hora em que a noite fechou: ${relogio(Math.min(jogo.rel,FIM))}</li>
    <li>Provas preservadas: ${jogo.provas.length} de ${Object.keys(PISTAS).length}</li>
    <li>Provas materiais decisivas: ${chaves()} de ${Object.values(PISTAS).filter(p=>p.k).length}</li>
    <li>Conclusões fechadas: ${jogo.conclusoes.length} de ${CRUZAMENTOS.length}</li>
    <li>Provas perdidas: ${jogo.destruidas.length?jogo.destruidas.map(p=>PISTAS[p].t).join(", "):"nenhuma"}</li>
    <li>Personagens do seu lado: ${aliados()} de 4</li>
    <li>Medo coletivo ao final: ${jogo.medo}%</li></ul>`;
  telaAtual="final";
  $("#site").classList.add("oculto");
  TELAS.forEach(x=>$("#tela-"+x).classList.toggle("oculto", x!=="final"));
  $("#barra").classList.add("oculto");
  window.scrollTo(0,0);
}
$("#btn-acusar").onclick=()=>encerrar(calcularFinal());
$("#btn-queimar").onclick=()=>encerrar("f3");
$("#btn-rejogar").onclick=()=>{ jogo=novoJogo(); if(usuario) Guardar.apagar(K_PR+usuario.email); ir("prologo"); };

/* ============ INÍCIO ============ */
(async()=>{
  try{
    if(typeof claude!=="undefined" && claude && typeof claude.use==="function")
      askClaude = await claude.use("sample");
  }catch(e){ askClaude=null; }
  iaResolvida=true;
  if(telaAtual==="suspeitos") pintarSala();
})();
(function(){ const e=Guardar.ler(K_SE), u=e&&usuarios()[e]; if(u){ usuario=u; $("#quem").textContent=u.nome; } ir("site"); })();

