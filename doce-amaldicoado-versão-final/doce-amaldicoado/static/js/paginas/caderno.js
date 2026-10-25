import { api } from "../core/api.js";
import { carregarDados } from "../core/dados.js";
import { el } from "../core/dom.js";

const [{ pistas: encontradas }, catalogo, ligacoes, { usuario }] = await Promise.all([
  api("/api/pistas"),
  carregarDados("pistas"),
  carregarDados("ligacoes"),
  api("/api/sessao"),
]);

// "Voltar" leva de volta para onde o jogador estava (a leitura retoma de onde parou).
const voltar = document.getElementById("voltar");
if (document.referrer.startsWith(location.origin) && !document.referrer.includes("/caderno")) voltar.href = document.referrer;

const achou = new Set(encontradas);
const porId = Object.fromEntries(catalogo.map((p) => [p.id, p]));
const achadas = encontradas.map((id) => porId[id]).filter(Boolean);

// ---- contagem: no topo e em cada caso ----
document.getElementById("contagem").textContent = `${achadas.length} de ${catalogo.length} pistas`;

for (const caso of ["leonardo", "mateus"]) {
  const lugar = document.getElementById(`notas-${caso}`);
  const total = catalogo.filter((p) => p.caso === caso).length;
  const doCaso = achadas.filter((p) => p.caso === caso);
  document.getElementById(`conta-${caso}`).textContent = `${doCaso.length} de ${total}`;

  lugar.append(...doCaso.map((p) =>
    el("article", { classe: "nota", "data-pista": p.id },
      el("h3", {}, p.titulo),
      el("p", { classe: "onde" }, p.local),
      el("p", {}, p.descricao),
    )));

  // Um espaço tracejado para cada pista que falta (sem dizer o que é).
  const faltam = total - doCaso.length;
  if (faltam > 0) {
    lugar.append(el("p", { classe: "somente-leitor" }, `${faltam} ${faltam === 1 ? "pista ainda não encontrada" : "pistas ainda não encontradas"}.`));
    for (let i = 0; i < faltam; i++) lugar.append(el("div", { classe: "nota vazia", "aria-hidden": "true" }, "?"));
  }
}

// ---- dica: cada clique revela uma ligação entre pistas que o jogador já tem ----
const possiveis = ligacoes.filter((l) => l.pistas.every((id) => achou.has(id)));
const parciais = ligacoes.filter((l) => !possiveis.includes(l) && l.pistas.some((id) => achou.has(id)));
const chave = `caderno_dicas_${usuario.id}`;

function lerReveladas() {
  try { return (JSON.parse(localStorage.getItem(chave)) ?? []).filter((id) => possiveis.some((l) => l.id === id)); }
  catch { return []; }
}
function guardarReveladas(ids) {
  try { localStorage.setItem(chave, JSON.stringify(ids)); } catch { /* sem armazenamento: a dica vale só nesta visita */ }
}

let reveladas = lerReveladas();
const botao = document.getElementById("pedir-dica");
const estado = document.getElementById("estado-dica");
const lista = document.getElementById("ligacoes");

function destacar(ids, ligar) {
  document.querySelectorAll(".nota[data-pista]").forEach((n) => n.classList.remove("ligada"));
  if (!ligar) return;
  const notas = ids.map((id) => document.querySelector(`.nota[data-pista="${id}"]`)).filter(Boolean);
  notas.forEach((n) => n.classList.add("ligada"));
  notas[0]?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function desenharLigacao(l) {
  const cartao = el("article", { classe: "ligacao", tabindex: "0", role: "button", "aria-pressed": "false" },
    el("p", {}, l.texto),
    el("ul", {}, ...l.pistas.map((id) => el("li", {}, porId[id].titulo))),
  );
  const alternar = () => {
    const ligar = cartao.getAttribute("aria-pressed") !== "true";
    lista.querySelectorAll(".ligacao").forEach((c) => c.setAttribute("aria-pressed", "false"));
    cartao.setAttribute("aria-pressed", String(ligar));
    destacar(l.pistas, ligar);
  };
  cartao.addEventListener("click", alternar);
  cartao.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); alternar(); } });
  return cartao;
}

function atualizar(mensagem) {
  lista.replaceChildren(...reveladas.map((id) => desenharLigacao(ligacoes.find((l) => l.id === id))));
  const restantes = possiveis.length - reveladas.length;
  botao.disabled = restantes === 0;

  if (mensagem) estado.textContent = mensagem;
  else if (!possiveis.length) estado.textContent = "Ainda não há ligações entre as pistas que você tem. Procure mais, e volte aqui se travar.";
  else if (!reveladas.length) estado.textContent = "Se estiver travado, peça uma dica: ela mostra pistas suas que se ligam, e o motivo.";
  else estado.textContent = `${reveladas.length} de ${possiveis.length} ligações possíveis com as pistas que você tem.`;
}

botao.addEventListener("click", () => {
  const proxima = possiveis.find((l) => !reveladas.includes(l.id));
  if (!proxima) return;
  reveladas = [...reveladas, proxima.id];
  guardarReveladas(reveladas);
  atualizar();
  if (possiveis.length === reveladas.length) {
    estado.textContent += parciais.length
      ? " Algumas das suas pistas ainda se ligam a outras que você não achou." : " Não há mais ligações novas por enquanto.";
  }
  lista.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

atualizar();
if (!possiveis.length) botao.disabled = true;
