import { api } from "../core/api.js";

const abas = {
  entrar:   { aba: document.getElementById("aba-entrar"),   painel: document.getElementById("painel-entrar") },
  cadastro: { aba: document.getElementById("aba-cadastro"), painel: document.getElementById("painel-cadastro") },
};

function mostrarAba(nome) {
  for (const [chave, { aba, painel }] of Object.entries(abas)) {
    const ativa = chave === nome;
    aba.setAttribute("aria-selected", ativa);
    aba.tabIndex = ativa ? 0 : -1;
    painel.hidden = !ativa;
    painel.querySelector(".aviso").textContent = "";
  }
  abas[nome].painel.querySelector("input").focus();
}

abas.entrar.aba.addEventListener("click", () => mostrarAba("entrar"));
abas.cadastro.aba.addEventListener("click", () => mostrarAba("cadastro"));

// Links "Criar conta" / "Entrar" dentro dos formulários
document.querySelectorAll("[data-ir]").forEach((link) =>
  link.addEventListener("click", () => mostrarAba(link.dataset.ir))
);

function ligarFormulario(painel, rota) {
  const aviso = painel.querySelector(".aviso");
  const botao = painel.querySelector("button[type=submit]");

  painel.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    aviso.textContent = "";
    botao.disabled = true;
    try {
      const corpo = Object.fromEntries(new FormData(painel));
      await api(rota, { metodo: "POST", corpo });
      window.location.href = "/menu";
    } catch (erro) {
      aviso.textContent = erro.message;
      botao.disabled = false;
    }
  });
}

ligarFormulario(abas.entrar.painel, "/api/login");
ligarFormulario(abas.cadastro.painel, "/api/cadastro");

// A página inicial leva direto ao cadastro com /login#cadastro.
if (location.hash === "#cadastro") mostrarAba("cadastro");
