// Motor de cenas: mostra o texto aos poucos, oferece escolhas, apresenta pistas e guarda o estado.
// Não conhece a história: ela vem de um JSON em /data (veja data/interrogatorios.json).
//
// Formato de uma cena:
//   local, cenario, hora ("23:38": define a hora de forma absoluta)
//   texto: lista de itens, cada um podendo ter "se" (marcas exigidas) e "sem" (marcas proibidas):
//     "texto simples"                    narração
//     { fala, texto }                    diálogo
//     { papel: [ "linha", {texto, se} ] } documento datilografado
//     { dica, se: ["esp_pessoas"] }      dica extra da especialidade do detetive
//     { selo, titulo }                   cartão de título de um final
//     { epigrafe }                       frase de encerramento
//   escolhas: [{ texto, vai, marcar, minutos, se, sem, resposta, pista }]
//     pista: id de uma pista de data/pistas.json; é anotada no caderno ao escolher
//     apresentar: "carla" (no lugar de "vai") abre o seletor para mostrar pistas a essa pessoa
//       (o seletor tem um botão "Dica", em dois níveis, calculado a partir das regras de "confrontos")
//     desmarcar: [marcas] apaga marcas ao escolher; href: leva a outra página em vez de "vai"
//   pista: (na cena) anota sozinha uma pista quando a cena começa, para acontecimentos da história
//   marcar: (na cena) liga marcas quando a cena começa
//   roteia: [{ se, sem, marcar, vai }] a cena não aparece: leva à primeira regra que servir (um "desvio")
//   final: "3" registra que o jogador chegou a esse final (aoFinal) e liga a marca final_3
//   escolhasDe: reaproveita as escolhas de outra cena
//   proximo + rotulo: um único botão de continuar
//   fim: true encerra a sequência (href opcional: para onde o botão final leva)
// Nos textos, {nome} e {codinome} viram o nome do detetive.
// "limite" (opcional, no topo do JSON): { hora, vai } leva à cena "vai" quando o relógio passa da hora.
// "confrontos" (opcional): { pessoa: { fecha, regras: [{ id, exige: [pistas], vai, fraca }] } }
//   Mostrar as pistas "exige" (e no máximo uma a mais) leva à cena "vai". Se nenhuma regra serve,
//   a pessoa se fecha: ligam-se as marcas fechou_<pessoa> e errou_<pessoa> e vai para a cena "fecha".
import { el } from "./dom.js";

const SEM_ANIMACAO = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const ATRASO = SEM_ANIMACAO ? 0 : 650; // tempo entre um parágrafo e o seguinte (ms)
const MAX_PISTAS = 4; // quantas pistas se pode mostrar de uma vez

// Horas da madrugada (antes das 6h) contam como o dia seguinte, para "00:00" ser depois de "23:15".
export const paraMinutos = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h < 6 ? h + 24 : h) * 60 + m;
};
const dois = (n) => String(n).padStart(2, "0");
const horaTexto = (min) => `${dois(Math.floor(min / 60) % 24)}h${dois(min % 60)}`;

const temTodas = (estado, lista = []) => lista.every((m) => estado.marcas.includes(m));
const temAlguma = (estado, lista = []) => lista.some((m) => estado.marcas.includes(m));
const visivel = (item, estado) =>
  typeof item === "string" || (temTodas(estado, item.se) && !temAlguma(estado, item.sem));

function marcar(estado, lista = []) {
  for (const marca of lista) if (!estado.marcas.includes(marca)) estado.marcas.push(marca);
}
function desmarcar(estado, lista = []) {
  estado.marcas = estado.marcas.filter((m) => !lista.includes(m));
}

export function criarLeitor({ cenas, estado, elementos, contexto = {}, limite, catalogoPistas = [], confrontos = {}, aoEntrar, aoFim, aoPista, aoFinal }) {
  const { local, hora, cenario, texto, escolhas } = elementos;
  const titulos = Object.fromEntries(catalogoPistas.map((p) => [p.id, p.titulo]));
  let geracao = 0; // identifica a cena atual, para ignorar timers de cenas antigas

  const t = (s) => s.replaceAll("{nome}", contexto.nome ?? "").replaceAll("{codinome}", contexto.codinome ?? "");

  function linha(item) {
    if (typeof item === "string") return el("p", { classe: "narracao" }, t(item));
    if (item.eco) return el("p", { classe: "eco" }, t(item.eco));
    if (item.dica) return el("p", { classe: "dica" }, t(item.dica));
    if (item.pista) return el("p", { classe: "pista" }, "Anotado no caderno: ", el("strong", {}, item.pista));
    if (item.narra) return el("p", { classe: "narracao" }, t(item.narra));
    if (item.selo) return el("div", { classe: "selo" }, el("span", {}, item.selo), el("strong", {}, item.titulo));
    if (item.epigrafe) return el("p", { classe: "epigrafe" }, t(item.epigrafe));
    if (item.papel) {
      const linhas = item.papel.filter((l) => visivel(l, estado)).map((l) => el("p", {}, t(typeof l === "string" ? l : l.texto)));
      return el("div", { classe: "papel" }, ...linhas);
    }
    return el("p", { classe: "fala" }, el("span", { classe: "quem" }, t(item.fala)), ` “${t(item.texto)}”`);
  }

  function botoes(lista) {
    escolhas.replaceChildren(...lista.map(({ rotulo, acao, href }) => {
      if (href) return el("a", { classe: "escolha", href }, rotulo);
      const botao = el("button", { classe: "escolha", type: "button" }, rotulo);
      botao.addEventListener("click", acao);
      return botao;
    }));
    escolhas.querySelector(".escolha")?.focus({ preventScroll: true });
  }

  // Mostra os itens um a um; clicar no texto mostra tudo de uma vez.
  function revelar(itens, aoTerminar) {
    const minha = ++geracao;
    const paragrafos = itens.filter((i) => visivel(i, estado)).map(linha);
    paragrafos.forEach((p) => p.classList.add("oculto"));
    texto.replaceChildren(...paragrafos);
    escolhas.replaceChildren();

    let proximo = 0;
    let terminou = false;
    const terminar = () => {
      if (terminou || minha !== geracao) return;
      terminou = true;
      paragrafos.forEach((p) => p.classList.remove("oculto"));
      aoTerminar();
    };
    const passo = () => {
      if (terminou || minha !== geracao) return;
      if (proximo >= paragrafos.length) return terminar();
      paragrafos[proximo++].classList.remove("oculto");
      setTimeout(passo, ATRASO);
    };
    texto.onclick = terminar;
    passo();
  }

  function cabecalho(no) {
    local.textContent = no.local ?? "";
    hora.textContent = estado.hora ? horaTexto(estado.hora) : "";
    cenario.parentElement.hidden = !no.cenario;
    if (no.cenario) cenario.src = `/static/img/cenarios/${no.cenario}.svg`;
  }

  // Os botões que a cena oferece agora (depende das marcas).
  function opcoesDaCena(no) {
    if (no.fim) return [{ rotulo: no.rotulo ?? "Voltar ao menu", href: no.href ?? "/menu" }];
    if (no.proximo) return [{ rotulo: no.rotulo ?? "Continuar", acao: () => entrar(no.proximo) }];
    const lista = no.escolhas ?? cenas[no.escolhasDe]?.escolhas ?? [];
    return lista.filter((e) => visivel(e, estado)).map((e) => {
      if (e.href) return { rotulo: t(e.texto), href: e.href };
      return { rotulo: t(e.texto), acao: e.apresentar ? () => abrirSeletor(e.apresentar, no) : () => escolher(e) };
    });
  }

  function pintarCena(no, extras = []) {
    revelar([...no.texto, ...extras], () => {
      if (no.fim) aoFim?.(estado);
      botoes(opcoesDaCena(no));
    });
  }

  // ---- apresentar pistas do caderno a alguém ----
  const porId = Object.fromEntries(catalogoPistas.map((p) => [p.id, p]));
  const achou = (id) => estado.marcas.includes(`pista_${id}`);
  const lista = (ids) => {
    const nomes = ids.map((id) => porId[id]?.titulo ?? id);
    return nomes.length < 2 ? nomes.join("") : `${nomes.slice(0, -1).join(", ")} e ${nomes.at(-1)}`;
  };

  // Calcula a dica para uma pessoa. Nível 1: destaca as pistas que servem; nível 2: sugere a combinação.
  // Nunca revela o nome de uma pista que o jogador ainda não tem.
  function dicaPara(convidado, nivel) {
    const { regras = [] } = confrontos[convidado] ?? {};
    const pendentes = regras
      .filter((r) => !estado.marcas.includes(`conf_${r.grupo ?? r.id}`))
      .map((r) => ({ regra: r, tem: r.exige.filter(achou), falta: r.exige.filter((id) => !achou(id)) }));

    if (!pendentes.length) return { texto: "Você já mostrou a essa pessoa tudo o que servia.", destaque: [] };

    const uteis = pendentes.filter((x) => x.tem.length);
    if (nivel === 1) {
      const destaque = [...new Set(uteis.flatMap((x) => x.tem))];
      return destaque.length
        ? { texto: "Algumas das suas pistas têm a ver com essa pessoa. Estão destacadas. Peça outra dica se quiser saber como combiná-las.", destaque }
        : { texto: "Nenhuma pista do seu caderno parece servir a essa pessoa agora. Talvez falte achar algo, ou conversar com outra pessoa antes.", destaque: [] };
    }

    // nível 2: a melhor combinação (as fortes primeiro; dentro delas, a mais completa)
    const ordem = [...pendentes].sort((a, b) =>
      Number(Boolean(a.regra.fraca)) - Number(Boolean(b.regra.fraca)) || a.falta.length - b.falta.length || b.tem.length - a.tem.length);
    const melhor = ordem[0];

    if (!melhor.falta.length) {
      return melhor.regra.fraca
        ? { texto: `Isto não resolve, mas rende uma reação: ${lista(melhor.tem)}.`, destaque: melhor.tem }
        : { texto: `Tente mostrar juntas: ${lista(melhor.tem)}.`, destaque: melhor.tem };
    }
    const locais = [...new Set(melhor.falta.map((id) => porId[id]?.local).filter(Boolean))].join(", ");
    const quantas = melhor.falta.length === 1 ? "uma pista" : `${melhor.falta.length} pistas`;
    return {
      texto: (melhor.tem.length ? `Você já tem ${lista(melhor.tem)}. ` : "")
        + `Para a combinação mais forte contra essa pessoa ainda falta ${quantas}${locais ? `, que pode estar em: ${locais}` : ""}.`,
      destaque: melhor.tem,
    };
  }

  function abrirSeletor(convidado, no) {
    const achadas = catalogoPistas.filter((p) => achou(p.id));
    const voltar = el("button", { classe: "escolha", type: "button" }, "Voltar");
    voltar.addEventListener("click", () => botoes(opcoesDaCena(no)));

    if (!achadas.length) {
      escolhas.replaceChildren(el("p", { classe: "seletor-aviso" }, "Você ainda não tem nenhuma pista no caderno para mostrar."), voltar);
      return;
    }

    const escolhidas = new Set();
    const mostrar = el("button", { classe: "escolha", type: "button", disabled: true }, "Mostrar as pistas escolhidas");
    const caixas = achadas.map((p) => {
      const caixa = el("input", { type: "checkbox", value: p.id });
      caixa.addEventListener("change", () => {
        if (caixa.checked) escolhidas.add(p.id); else escolhidas.delete(p.id);
        mostrar.disabled = escolhidas.size === 0;
        for (const outra of caixas) outra.disabled = !outra.checked && escolhidas.size >= MAX_PISTAS;
      });
      return caixa;
    });
    mostrar.addEventListener("click", () => confrontar(convidado, [...escolhidas]));

    const rotulos = achadas.map((p, i) =>
      el("label", { classe: "pista-opcao", "data-pista": p.id }, caixas[i],
        el("span", {}, el("strong", {}, p.titulo), el("small", {}, p.local))));

    // Botão de dica: o primeiro clique destaca, os seguintes sugerem a combinação.
    let nivel = 0;
    const aviso = el("p", { classe: "seletor-dica", role: "status", hidden: true });
    const dica = el("button", { classe: "escolha escolha-dica", type: "button" }, "Dica: qual pista usar?");
    dica.addEventListener("click", () => {
      nivel += 1;
      const { texto: msg, destaque } = dicaPara(convidado, Math.min(nivel, 2));
      aviso.hidden = false;
      aviso.textContent = msg;
      rotulos.forEach((r) => r.classList.toggle("sugerida", destaque.includes(r.dataset.pista)));
    });

    escolhas.replaceChildren(
      el("p", { classe: "seletor-aviso" },
        `Escolha até ${MAX_PISTAS} pistas do caderno. Se elas não tiverem relação com o que a pessoa sabe, ela pode se fechar.`),
      dica,
      aviso,
      el("div", { classe: "pistas-lista" }, ...rotulos),
      mostrar,
      voltar,
    );
  }

  function confrontar(convidado, escolhidas) {
    const { regras = [], fecha } = confrontos[convidado] ?? {};
    const regra = regras.find((r) => r.exige.every((id) => escolhidas.includes(id)) && escolhidas.length <= r.exige.length + 1);

    if (regra) {
      const grupo = `conf_${regra.grupo ?? regra.id}`;
      if (estado.marcas.includes(grupo)) {
        return entrar(`${convidado}_volta`, ["Você mostra o que já tinha mostrado. Não há nada novo a dizer sobre isso."]);
      }
      marcar(estado, [...(regra.marcar ?? []), grupo]);
      if (!regra.fraca) desmarcar(estado, [`fechou_${convidado}`]); // uma prova de verdade reabre a conversa
      if (estado.hora) estado.hora += regra.minutos ?? 8;
      return entrar(regra.vai);
    }

    // Nenhuma regra serve: a pessoa se fecha (consequência), mas o jogo continua.
    marcar(estado, [`fechou_${convidado}`, `errou_${convidado}`]);
    if (estado.hora) estado.hora += 10;
    entrar(fecha ?? `${convidado}_fecha`);
  }

  function escolher(escolha) {
    desmarcar(estado, escolha.desmarcar);
    marcar(estado, escolha.marcar);
    if (estado.hora) estado.hora += escolha.minutos ?? 0;

    const itens = escolha.resposta ? [{ eco: escolha.texto }, ...escolha.resposta] : [];
    for (const id of [].concat(escolha.pista ?? [])) {
      marcar(estado, [`pista_${id}`]);
      aoPista?.(id);
      itens.push({ pista: titulos[id] ?? id });
    }

    // Passou da hora limite: a história segue para a cena do limite (a menos que já seja um fim).
    const estourou = limite && estado.hora && estado.hora >= paraMinutos(limite.hora)
      && !cenas[escolha.vai]?.fim && !estado.marcas.includes(`limite_${limite.vai}`);
    entrar(estourou ? limite.vai : escolha.vai, itens.length ? itens : null);
  }

  function entrar(id, resposta = null) {
    const no = cenas[id];
    if (!no) throw new Error(`Cena inexistente: ${id}`);

    // Cena-desvio: não aparece, só decide para onde ir com base nas marcas.
    if (no.roteia) {
      const regra = no.roteia.find((r) => temTodas(estado, r.se) && !temAlguma(estado, r.sem));
      if (!regra) throw new Error(`Desvio sem saída: ${id}`);
      marcar(estado, regra.marcar);
      return entrar(regra.vai, resposta);
    }

    estado.cena = id;
    if (no.hora) estado.hora = paraMinutos(no.hora);
    marcar(estado, no.marcar);
    if (limite && id === limite.vai) marcar(estado, [`limite_${id}`]); // o limite só dispara uma vez
    if (no.final) { marcar(estado, [`final_${no.final}`]); aoFinal?.(no.final); }

    const extras = [];
    for (const pistaId of [].concat(no.pista ?? [])) {
      if (estado.marcas.includes(`pista_${pistaId}`)) continue;
      marcar(estado, [`pista_${pistaId}`]);
      aoPista?.(pistaId);
      extras.push({ pista: titulos[pistaId] ?? pistaId });
    }

    cabecalho(no);
    aoEntrar?.(estado, no);

    if (resposta) {
      revelar(resposta, () => botoes([{ rotulo: "Continuar", acao: () => pintarCena(no, extras) }]));
    } else {
      pintarCena(no, extras);
    }
  }

  return { iniciar: () => entrar(estado.cena) };
}
