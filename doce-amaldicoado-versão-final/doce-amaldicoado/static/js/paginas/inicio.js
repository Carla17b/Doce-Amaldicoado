// Se a pessoa já tem conta e está logada, os botões levam direto ao jogo.
import { api } from "../core/api.js";

try {
  const { usuario } = await api("/api/sessao");
  if (usuario) {
    for (const id of ["cta-principal", "cta-final"]) {
      const botao = document.getElementById(id);
      botao.textContent = "Continuar o caso";
      botao.href = "/menu";
    }
    document.getElementById("cta-secundario").hidden = true;
    const topo = document.getElementById("link-topo");
    topo.textContent = "Menu";
    topo.href = "/menu";
  }
} catch {
  // sem servidor de sessão: os botões continuam levando ao cadastro e ao login
}
