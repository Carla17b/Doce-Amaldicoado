import { api } from "../core/api.js";
import { carregarDados, urlRetrato } from "../core/dados.js";
import { el } from "../core/dom.js";

const form = document.getElementById("ficha");
const aviso = form.querySelector(".aviso");
const botao = form.querySelector("button[type=submit]");

const [opcoes, { detetive }] = await Promise.all([carregarDados("detetive"), api("/api/detetive")]);

function opcaoRadio(grupo, item, marcado) {
  return el("label", { classe: "opcao" },
    el("input", { type: "radio", name: grupo, value: item.id, checked: marcado, required: true }),
    el("span", {},
      el("strong", {}, item.nome),
      el("small", {}, item.descricao ?? item.frase),
    ),
  );
}

function retratoRadio(item, marcado) {
  return el("label", { classe: "retrato" },
    el("input", { type: "radio", name: "retrato", value: item.id, checked: marcado, required: true }),
    el("span", { classe: "moldura" }, el("img", { src: urlRetrato(item.id), alt: "" })),
    el("span", { classe: "legenda" }, item.nome),
  );
}

// Monta as opções; se já existe ficha, vem tudo preenchido (modo edição).
const atual = detetive ?? { retrato: opcoes.retratos[0].id };
document.getElementById("retratos").append(
  ...opcoes.retratos.map((item) => retratoRadio(item, item.id === atual.retrato)));
document.getElementById("especialidades").append(
  ...opcoes.especialidades.map((item) => opcaoRadio("especialidade", item, item.id === atual.especialidade)));
document.getElementById("passados").append(
  ...opcoes.passados.map((item) => opcaoRadio("passado", item, item.id === atual.passado)));

if (detetive) {
  form.elements.nome.value = detetive.nome;
  form.elements.codinome.value = detetive.codinome;
  document.getElementById("voltar").hidden = false;
}

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  aviso.textContent = "";
  botao.disabled = true;
  try {
    await api("/api/detetive", { metodo: "POST", corpo: Object.fromEntries(new FormData(form)) });
    window.location.href = "/menu";
  } catch (erro) {
    aviso.textContent = erro.message;
    botao.disabled = false;
  }
});
